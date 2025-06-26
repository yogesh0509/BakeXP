"use client";

import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trophy, UserPlus, Loader2 } from "lucide-react";
import { useContracts } from '@/hooks/useContracts';
import { useWallet } from '@/contexts/WalletContext';
import { Pod, PodStats } from '@/contracts/types';
import Link from 'next/link';

interface PodWithStats extends Pod {
  stats?: PodStats;
  members?: string[];
}

export default function BakePods() {
  const { wallet } = useWallet();
  const { isConnected, address, services } = useContracts();
  const [pods, setPods] = useState<PodWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Form state for creating new pod
  const [newPodForm, setNewPodForm] = useState({
    name: '',
    description: '',
    member1: '',
    member2: '',
    member3: ''
  });

  const loadUserPods = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      // Get user pod IDs
      const podIds = await services.bakePods.getUserPods(address);
      if (podIds && podIds.length > 0) {
        // Fetch full pod data for each ID
        const podPromises = podIds.map(async (podId) => {
          const [pod, stats, members] = await Promise.all([
            services.bakePods.getPod(podId),
            services.bakePods.getPodStats(podId),
            services.bakePods.getPodMembers(podId)
          ]);
          
          if (pod) {
            return {
              ...pod,
              stats,
              members: members || []
            } as PodWithStats;
          }
          return null;
        });
        
        const podsData = await Promise.all(podPromises);
        const validPods = podsData.filter(pod => pod !== null) as PodWithStats[];
        setPods(validPods);
      } else {
        setPods([]);
      }
    } catch (error) {
      console.error('Failed to load user pods:', error);
      setPods([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      loadUserPods();
    }
  }, [address]);

  const handleCreatePod = async () => {
    if (!newPodForm.name || !newPodForm.description) {
      alert('Please fill in pod name and description');
      return;
    }

    setIsCreating(true);
    try {
      const result = await services.bakePods.createPod(
        newPodForm.name, 
        newPodForm.description, 
        7, // 7-day target streak
        4  // max 4 members
      );
      
      if (result) {
        console.log('Pod created successfully:', result);
        setShowCreateDialog(false);
        setNewPodForm({
          name: '',
          description: '',
          member1: '',
          member2: '',
          member3: ''
        });
        // Refresh pods list
        await loadUserPods();
      }
    } catch (error) {
      console.error('Failed to create pod:', error);
      alert('Failed to create pod. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculateDaysLeft = (pod: PodWithStats) => {
    // Calculate based on creation timestamp and target streak
    const now = Date.now() / 1000; // Current time in seconds
    const daysPassed = Math.floor((now - pod.createdAt) / (24 * 60 * 60));
    const daysLeft = Math.max(0, pod.targetStreak - daysPassed);
    return daysLeft;
  };

  const calculateProgress = (pod: PodWithStats) => {
    if (!pod.stats) {
      return { current: 0, total: pod.targetStreak, percent: 0 };
    }
    
    const current = pod.stats.currentStreak;
    const total = pod.stats.targetStreak;
    const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;
    
    return { current, total, percent };
  };
  
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">BakePods</h1>
            <p className="text-muted-foreground">Group baking challenges with friends</p>
          </div>

          {/* Not connected state */}
          {!wallet.connected ? (
            <Link href="/">
              <Button variant="outline">Connect Wallet</Button>
            </Link>
          ) : (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> New BakePod
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a BakePod</DialogTitle>
                  <DialogDescription>
                    Invite friends to a group baking challenge! When everyone reaches the goal, you'll earn a special NFT.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pod-name">Pod Name</Label>
                    <Input 
                      id="pod-name" 
                      placeholder="Weekend Warriors, Bread Heads, etc."
                      value={newPodForm.name}
                      onChange={(e) => setNewPodForm({...newPodForm, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pod-description">Description</Label>
                    <Input 
                      id="pod-description" 
                      placeholder="A fun baking challenge for friends"
                      value={newPodForm.description}
                      onChange={(e) => setNewPodForm({...newPodForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="member1">Member 1 Address</Label>
                    <Input 
                      id="member1" 
                      placeholder="0x..."
                      value={newPodForm.member1}
                      onChange={(e) => setNewPodForm({...newPodForm, member1: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="member2">Member 2 Address</Label>
                    <Input 
                      id="member2" 
                      placeholder="0x..."
                      value={newPodForm.member2}
                      onChange={(e) => setNewPodForm({...newPodForm, member2: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="member3">Member 3 Address (Optional)</Label>
                    <Input 
                      id="member3" 
                      placeholder="0x..."
                      value={newPodForm.member3}
                      onChange={(e) => setNewPodForm({...newPodForm, member3: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Challenge</Label>
                    <div className="text-sm text-muted-foreground">Each member must log at least 5 bakes in 7 days</div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleCreatePod}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Pod'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Not connected state */}
        {!wallet.connected && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 text-lg mb-2">🔒</div>
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-4">
                Please connect your wallet to create and join BakePods
              </p>
              <Link href="/">
                <Button>Connect Wallet</Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        {/* Active BakePods */}
        {isConnected && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              Your Active Pods
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </h2>
            {pods.length > 0 ? (
              <div className="grid gap-6">
                {pods.map(pod => {
                  const progress = calculateProgress(pod);
                  const daysLeft = calculateDaysLeft(pod);
                  
                  return (
                    <Card key={pod.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-primary" />
                              {pod.name}
                            </CardTitle>
                            <CardDescription>{pod.description}</CardDescription>
                          </div>
                          <div className="bg-muted px-3 py-1 rounded-full text-xs font-medium">
                            {daysLeft} days left
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Streak Progress: {progress.current}/{progress.total} days</span>
                            <span>{progress.percent.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress.percent} />
                          {pod.stats && (
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>Total Bakes: {pod.stats.totalBakes}</span>
                              <span>Today: {pod.stats.dailyBakesToday}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium">Members ({pod.members?.length || 0}/{pod.memberLimit})</h3>
                          {pod.members && pod.members.length > 0 ? (
                            pod.members.map((member: string, i: number) => (
                              <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                                    {i + 1}
                                  </div>
                                  <span className="text-sm">{formatAddress(member)}</span>
                                  {member === address && (
                                    <span className="text-xs text-primary">(You)</span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Active
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No members yet - invite friends to join!</p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="text-xs text-muted-foreground">
                          <Trophy className="h-3 w-3 inline mr-1" /> Milestone NFT on completion
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          <UserPlus className="h-4 w-4 mr-1" /> Invite
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-muted/10 border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium text-lg mb-1">No active pods yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a pod to start a group baking challenge with friends!
                    </p>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" /> Create Your First Pod
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        {/* Same content as main create dialog */}
                        <DialogHeader>
                          <DialogTitle>Create a BakePod</DialogTitle>
                          <DialogDescription>
                            Invite friends to a group baking challenge! When everyone reaches the goal, you'll earn a special NFT.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="pod-name-2">Pod Name</Label>
                            <Input 
                              id="pod-name-2" 
                              placeholder="Weekend Warriors, Bread Heads, etc."
                              value={newPodForm.name}
                              onChange={(e) => setNewPodForm({...newPodForm, name: e.target.value})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="pod-description-2">Description</Label>
                            <Input 
                              id="pod-description-2" 
                              placeholder="A fun baking challenge for friends"
                              value={newPodForm.description}
                              onChange={(e) => setNewPodForm({...newPodForm, description: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            onClick={handleCreatePod}
                            disabled={isCreating}
                          >
                            {isCreating ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              'Create Pod'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {/* Pod Invites */}
        {isConnected && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Pod Invites</h2>
            <Card className="bg-muted/10 border-dashed">
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    No pending invites at the moment
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <Separator className="my-8" />
        
        {/* How it Works */}
        <div>
          <h2 className="text-xl font-bold mb-4">How BakePods Work</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">1. Create a Pod</h3>
                  <p className="text-sm text-muted-foreground">
                    Invite 2-3 friends using their wallet addresses
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">2. Bake Together</h3>
                  <p className="text-sm text-muted-foreground">
                    Everyone logs their bakes to meet the group challenge
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">3. Earn Rewards</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete the challenge together and earn exclusive group NFTs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
