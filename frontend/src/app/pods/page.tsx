"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Plus, 
  UserPlus, 
  Loader2, 
  Check, 
  X, 
  Trophy, 
  Calendar, 
  Flame,
  AlertCircle
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useUserData } from "@/contexts/UserDataContext";
import * as StarknetService from "@/services/StarknetService";
import { BakePod } from "@/services/StarknetService";

export default function PodsPage() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { userStats, refreshUserData } = useUserData();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPods, setUserPods] = useState<BakePod[]>([]);
  const [podInvites, setPodInvites] = useState<{ podId: string; podName: string }[]>([]);
  
  // New pod form state
  const [isCreatingPod, setIsCreatingPod] = useState(false);
  const [newPodName, setNewPodName] = useState("");
  const [newPodMembers, setNewPodMembers] = useState("");
  const [createPodError, setCreatePodError] = useState("");
  
  // Load user's pods and invites
  const loadUserPodsData = async () => {
    if (!wallet.connected || !wallet.address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get user's pods
      const pods = await StarknetService.getUserPods(wallet.address);
      setUserPods(pods);
      
      // Get pod invites
      const invites = await StarknetService.getUserPodInvites(wallet.address);
      setPodInvites(invites);
    } catch (err) {
      console.error("Error loading pods data:", err);
      setError("Failed to load your BakePods. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load pods data when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      loadUserPodsData();
    } else {
      setUserPods([]);
      setPodInvites([]);
    }
  }, [wallet.connected, wallet.address]);
  
  // Create a new pod
  const handleCreatePod = async () => {
    if (!wallet.connected || !wallet.address) return;
    if (!newPodName.trim()) {
      setCreatePodError("Please enter a pod name");
      return;
    }
    
    setIsCreatingPod(true);
    setCreatePodError("");
    
    try {
      // Parse member addresses (comma-separated)
      const memberAddresses = newPodMembers
        .split(",")
        .map(addr => addr.trim())
        .filter(Boolean);
      
      // Create pod through service
      const podId = await StarknetService.createPod(
        newPodName,
        wallet.address,
        memberAddresses
      );
      
      if (podId) {
        // Reset form
        setNewPodName("");
        setNewPodMembers("");
        
        // Reload pods data
        await loadUserPodsData();
      } else {
        setCreatePodError("Failed to create pod. Please try again.");
      }
    } catch (err) {
      console.error("Error creating pod:", err);
      setCreatePodError("An error occurred while creating the pod.");
    } finally {
      setIsCreatingPod(false);
    }
  };
  
  // Accept a pod invitation
  const handleAcceptInvite = async (podId: string) => {
    if (!wallet.connected || !wallet.address) return;
    
    setIsLoading(true);
    
    try {
      const success = await StarknetService.acceptPodInvite(podId, wallet.address);
      
      if (success) {
        // Reload pods data
        await loadUserPodsData();
      } else {
        setError("Failed to accept invitation. Please try again.");
      }
    } catch (err) {
      console.error("Error accepting pod invite:", err);
      setError("An error occurred while accepting the invitation.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Log a pod bake
  const handleLogPodBake = async (podId: string) => {
    if (!wallet.connected || !wallet.address) return;
    
    setIsLoading(true);
    
    try {
      const success = await StarknetService.logPodBake(podId, wallet.address);
      
      if (success) {
        // Reload pods data
        await loadUserPodsData();
      } else {
        setError("Failed to log pod bake. Please try again.");
      }
    } catch (err) {
      console.error("Error logging pod bake:", err);
      setError("An error occurred while logging the pod bake.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // If not connected, show connect prompt
  if (!wallet.connected) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Please connect your wallet to view and manage your BakePods.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => router.push("/")} size="lg">Back to Home</Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">BakePods</h1>
            <p className="text-muted-foreground">Bake together with friends and earn group milestones</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Pod
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New BakePod</DialogTitle>
                <DialogDescription>
                  Create a baking group to track progress together and earn special milestones.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="pod-name">Pod Name</Label>
                  <Input
                    id="pod-name"
                    placeholder="e.g., Weekend Bakers"
                    value={newPodName}
                    onChange={(e) => setNewPodName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pod-members">
                    Member Addresses (optional, comma-separated)
                  </Label>
                  <Input
                    id="pod-members"
                    placeholder="e.g., 0x123..., 0x456..."
                    value={newPodMembers}
                    onChange={(e) => setNewPodMembers(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can add members later if you don't have their addresses now.
                  </p>
                </div>
                
                {createPodError && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {createPodError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreatePod} 
                  disabled={isCreatingPod || !newPodName.trim()}
                >
                  {isCreatingPod ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Pod"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-start gap-2 mb-6">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && !userPods.length && !podInvites.length && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading your BakePods...</p>
          </div>
        )}
        
        {/* Tabs for My Pods and Invitations */}
        <Tabs defaultValue="my-pods" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-pods">
              My Pods {userPods.length > 0 && `(${userPods.length})`}
            </TabsTrigger>
            <TabsTrigger value="invites">
              Invitations {podInvites.length > 0 && `(${podInvites.length})`}
            </TabsTrigger>
          </TabsList>
          
          {/* My Pods Tab */}
          <TabsContent value="my-pods" className="pt-6">
            {userPods.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pods Yet</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    You haven't joined any BakePods yet. Create a new pod or accept an invitation to get started.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Create Your First Pod
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userPods.map((pod) => (
                  <Card key={pod.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{pod.name}</CardTitle>
                          <CardDescription>
                            {pod.members.length} {pod.members.length === 1 ? 'member' : 'members'} • {pod.totalBakes} {pod.totalBakes === 1 ? 'bake' : 'bakes'}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          <span>{pod.members.length}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Pod milestone */}
                        {pod.activeMilestone && (
                          <div className="bg-primary/5 p-3 rounded-md flex items-center gap-3">
                            <Trophy className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Latest Milestone</p>
                              <p className="text-xs text-muted-foreground">
                                {pod.activeMilestone === 'pod-10-bakes' && '10 Bakes Milestone'}
                                {pod.activeMilestone === 'pod-20-bakes' && '20 Bakes Milestone'}
                                {pod.activeMilestone === 'pod-50-bakes' && '50 Bakes Milestone'}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Members list */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Members</h4>
                          <div className="space-y-1">
                            {pod.members.map((member, index) => (
                              <div key={index} className="text-xs text-muted-foreground flex items-center">
                                <span className="truncate">
                                  {member === wallet.address ? `${member.substring(0, 6)}...${member.substring(member.length - 4)} (You)` : `${member.substring(0, 6)}...${member.substring(member.length - 4)}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Created {new Date(pod.createdAt).toLocaleDateString()}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleLogPodBake(pod.id)}
                        disabled={isLoading}
                      >
                        Log Pod Bake
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Invitations Tab */}
          <TabsContent value="invites" className="pt-6">
            {podInvites.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Invitations</h3>
                  <p className="text-muted-foreground max-w-md">
                    You don't have any pending pod invitations. When someone invites you to join their pod, it will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {podInvites.map((invite) => (
                  <Card key={invite.podId}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <h3 className="font-medium">{invite.podName}</h3>
                        <p className="text-sm text-muted-foreground">
                          You've been invited to join this BakePod
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleAcceptInvite(invite.podId)}
                          disabled={isLoading}
                        >
                          <Check className="h-4 w-4" /> Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* About BakePods */}
        <Card>
          <CardHeader>
            <CardTitle>About BakePods</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              BakePods are baking groups that allow you to track progress together with friends.
              Create a pod, invite friends, and earn special group milestones as you all bake together.
            </p>
            <p>
              Each time a pod member logs a bake, it counts toward the pod's total. Reach certain
              milestones to unlock special rewards and achievements for the entire group.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
