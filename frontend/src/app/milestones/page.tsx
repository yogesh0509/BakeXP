"use client";

import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Award, Lock, Star, Calendar, Flame } from "lucide-react";

export default function Milestones() {
  // Mock data (would be from Starknet contracts in the future)
  const earnedMilestones = [
    { 
      id: 1, 
      name: "First Bake", 
      description: "You logged your first bake! Welcome to BakeXP!",
      image: "🧁",
      date: "June 10, 2025"
    },
    { 
      id: 2, 
      name: "3-Day Streak", 
      description: "You've baked for 3 consecutive days!",
      image: "🔥",
      date: "June 15, 2025"
    }
  ];
  
  const lockedMilestones = [
    { 
      id: 3, 
      name: "7-Day Streak", 
      description: "Bake for 7 consecutive days",
      image: "🔒",
      requirement: "4 more days to go"
    },
    { 
      id: 4, 
      name: "First Pod Challenge", 
      description: "Complete your first BakePod group challenge",
      image: "🔒",
      requirement: "Join a BakePod"
    },
    { 
      id: 5, 
      name: "Level 5 Baker", 
      description: "Reach Level 5 by earning XP",
      image: "🔒",
      requirement: "Currently Level 3"
    }
  ];
  
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Milestone NFTs</h1>
            <p className="text-muted-foreground">Collect NFTs by achieving baking milestones</p>
          </div>
          <Badge variant="outline" className="gap-1 py-1.5 px-3 text-base">
            <Award className="h-4 w-4 text-primary" />
            <span>2/10 Earned</span>
          </Badge>
        </div>
        
        <Tabs defaultValue="earned" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="earned">Earned Milestones</TabsTrigger>
            <TabsTrigger value="locked">Locked Milestones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="earned" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnedMilestones.map((milestone) => (
                <Card key={milestone.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-primary/5 p-6 flex items-center justify-center">
                    <div className="text-6xl">{milestone.image}</div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{milestone.name}</CardTitle>
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    </div>
                    <CardDescription>{milestone.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" /> Earned on {milestone.date}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="locked" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedMilestones.map((milestone) => (
                <Card key={milestone.id} className="overflow-hidden opacity-70 hover:opacity-90 transition-opacity">
                  <div className="bg-muted/30 p-6 flex items-center justify-center">
                    <div className="text-6xl">
                      <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{milestone.name}</CardTitle>
                    <CardDescription>{milestone.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Flame className="h-3 w-3 mr-1" /> {milestone.requirement}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>About Milestone NFTs</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              BakeXP Milestone NFTs are stored on Starknet and represent your baking achievements. 
              Each NFT is a unique digital collectible that proves your baking journey.
            </p>
            <p>
              Continue baking, maintain your streak, and participate in special events to unlock
              more milestone NFTs. You can share your achievements with friends or display them on 
              social media.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
