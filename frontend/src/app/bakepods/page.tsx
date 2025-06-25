"use client";

import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trophy, UserPlus } from "lucide-react";

export default function BakePods() {
  // Mock data (would be from Starknet contracts in future)
  const pods = [
    {
      id: 1,
      name: "Weekend Warriors",
      members: ["0x123...abc", "0x456...def", "You"],
      goal: "20 bakes in 7 days",
      progress: 12,
      progressPercent: 60,
      daysLeft: 3
    }
  ];
  
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">BakePods</h1>
            <p className="text-muted-foreground">Group baking challenges with friends</p>
          </div>
          <Dialog>
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
                  <Input id="pod-name" placeholder="Weekend Warriors, Bread Heads, etc." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="member1">Member 1 Address</Label>
                  <Input id="member1" placeholder="0x..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="member2">Member 2 Address</Label>
                  <Input id="member2" placeholder="0x..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="member3">Member 3 Address (Optional)</Label>
                  <Input id="member3" placeholder="0x..." />
                </div>
                <div className="grid gap-2">
                  <Label>Challenge</Label>
                  <div className="text-sm text-muted-foreground">Each member must log at least 5 bakes in 7 days</div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Pod</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Active BakePods */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Your Active Pods</h2>
          {pods.length > 0 ? (
            <div className="grid gap-6">
              {pods.map(pod => (
                <Card key={pod.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          {pod.name}
                        </CardTitle>
                        <CardDescription>Goal: {pod.goal}</CardDescription>
                      </div>
                      <div className="bg-muted px-3 py-1 rounded-full text-xs font-medium">
                        {pod.daysLeft} days left
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress: {pod.progress}/20 bakes</span>
                        <span>{pod.progressPercent}%</span>
                      </div>
                      <Progress value={pod.progressPercent} />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Members</h3>
                      {pod.members.map((member, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                              {member === "You" ? "You" : (i + 1)}
                            </div>
                            <span className="text-sm">{member}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member === "You" ? "5/5 bakes" : "3/5 bakes"}
                          </div>
                        </div>
                      ))}
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
              ))}
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" /> Create Your First Pod
                      </Button>
                    </DialogTrigger>
                    <DialogContent>{/* Same content as above */}</DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Pod Invites */}
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
                  {/* <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Cake className="h-6 w-6 text-primary" />
                  </div> */}
                  <h3 className="font-medium mb-2">2. Bake Together</h3>
                  <p className="text-sm text-muted-foreground">
                    Everyone logs their bakes to meet the group challenge
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">3. Earn Pod NFT</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete the challenge to earn a special milestone NFT
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
