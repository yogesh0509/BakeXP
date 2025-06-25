"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Flame, Award } from "lucide-react";
import { useUserData } from "@/contexts/UserDataContext";
import { useWallet } from "@/contexts/WalletContext";
import { GardenStage } from '@/contexts/UserDataContext';

// Helper function to render garden emoji based on stage
function renderGardenEmoji(stage: GardenStage): string {
  switch (stage) {
    case 'Seed': return '🌰';
    case 'Seedling': return '🌱';
    case 'Sprout': return '🌿';
    case 'Plant': return '🪴';
    case 'Tree': return '🌳';
    case 'Garden': return '🏡';
    default: return '🌱';
  }
}

// Helper function to get garden stage description
function getGardenDescription(stage: GardenStage): string {
  switch (stage) {
    case 'Seed': 
      return 'Your garden journey is just beginning! Log your first bake to start growing.';
    case 'Seedling': 
      return 'Your garden is still young! Continue your baking streak to help it grow into a beautiful garden.';
    case 'Sprout': 
      return 'Your sprout is growing nicely! Keep up the good work to see it flourish further.';
    case 'Plant': 
      return 'Your plant is thriving! Maintain your streak to grow it into a magnificent tree.';
    case 'Tree': 
      return 'Your tree is growing tall and strong! You\'re almost at a full garden.';
    case 'Garden': 
      return 'Congratulations! Your garden is fully grown. You\'ve become a master baker!';
    default: 
      return 'Continue baking to grow your garden!';
  }
}

export default function Garden() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { userStats, isLoading, error } = useUserData();
  
  // If not connected, show connect prompt
  if (!wallet.connected) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Please connect your wallet to view your BakeXP garden and track your progress.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => router.push("/")} size="lg">Back to Home</Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show loading state
  if (isLoading && !userStats) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-16 px-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Growing your garden...</p>
        </div>
      </Layout>
    );
  }
  
  // Handle error state
  if (error && !userStats) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-bold mb-6">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">{error}</p>
          <div className="flex justify-center">
            <Button size="lg" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Handle case where stats haven't loaded yet
  if (!userStats) {
    return null;
  }

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Baking Garden</h1>
            <p className="text-muted-foreground">Watch your garden evolve as you continue baking</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="bg-primary/10 text-primary py-1 px-3 rounded-full text-sm font-medium flex items-center gap-1">
              <Flame className="h-4 w-4" />
              <span>{userStats.streak} Day Streak</span>
            </div>
            <div className="bg-amber-500/10 text-amber-500 py-1 px-3 rounded-full text-sm font-medium flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>Level {userStats.level}</span>
            </div>
          </div>
        </div>
        
        {/* Garden Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Stage: {userStats.gardenStage}</CardTitle>
                <CardDescription>Level {userStats.level} Garden • {userStats.totalBakes} Total Bakes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 rounded-lg p-8 w-full min-h-80 flex flex-col items-center justify-center mb-6">
              {/* Garden visualization */}
              <div className="text-8xl mb-10 transition-all duration-500 hover:scale-110">
                {renderGardenEmoji(userStats.gardenStage)}
              </div>
              <p className="text-center text-muted-foreground max-w-md">
                {getGardenDescription(userStats.gardenStage)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{userStats.gardenStage}</span>
                <span>{userStats.nextGardenStage || 'Complete'}</span>
              </div>
              <Progress value={userStats.percentToNextGardenStage} className="h-2" />
              <p className="text-xs text-muted-foreground text-center mt-1">
                {userStats.nextGardenStage ? 
                  `${userStats.percentToNextGardenStage.toFixed(0)}% progress to ${userStats.nextGardenStage}` : 
                  'Garden fully grown!'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Garden Evolution Path */}
        <Card>
          <CardHeader>
            <CardTitle>Garden Evolution Path</CardTitle>
            <CardDescription>
              Continue baking to unlock these garden stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {/* Seed Stage */}
              <div className={`bg-background rounded-md p-4 ${userStats.gardenStage === 'Seed' ? 'border-2 border-primary' : userStats.streak >= 1 ? 'border border-primary/50 bg-primary/5' : 'border border-border opacity-70'}`}>
                <div className="text-3xl mb-2">🌰</div>
                <h3 className="font-medium">Seed</h3>
                <p className="text-xs text-muted-foreground">Start</p>
              </div>
              
              {/* Seedling Stage */}
              <div className={`bg-background rounded-md p-4 ${userStats.gardenStage === 'Seedling' ? 'border-2 border-primary' : userStats.streak >= 1 ? 'border border-primary/50 bg-primary/5' : 'border border-border opacity-70'}`}>
                <div className="text-3xl mb-2">🌱</div>
                <h3 className="font-medium">Seedling</h3>
                <p className="text-xs text-muted-foreground">1 Day</p>
              </div>
              
              {/* Sprout Stage */}
              <div className={`bg-background rounded-md p-4 ${userStats.gardenStage === 'Sprout' ? 'border-2 border-primary' : userStats.streak >= 3 ? 'border border-primary/50 bg-primary/5' : 'border border-border opacity-70'}`}>
                <div className="text-3xl mb-2">🌿</div>
                <h3 className="font-medium">Sprout</h3>
                <p className="text-xs text-muted-foreground">3 Day Streak</p>
              </div>
              
              {/* Plant Stage */}
              <div className={`bg-background rounded-md p-4 ${userStats.gardenStage === 'Plant' ? 'border-2 border-primary' : userStats.streak >= 7 ? 'border border-primary/50 bg-primary/5' : 'border border-border opacity-70'}`}>
                <div className="text-3xl mb-2">🪴</div>
                <h3 className="font-medium">Plant</h3>
                <p className="text-xs text-muted-foreground">7 Day Streak</p>
              </div>
              
              {/* Tree Stage */}
              <div className={`bg-background rounded-md p-4 ${userStats.gardenStage === 'Tree' ? 'border-2 border-primary' : userStats.streak >= 14 ? 'border border-primary/50 bg-primary/5' : 'border border-border opacity-70'}`}>
                <div className="text-3xl mb-2">🌳</div>
                <h3 className="font-medium">Tree</h3>
                <p className="text-xs text-muted-foreground">14 Day Streak</p>
              </div>
              
              {/* Garden Stage */}
              <div className={`bg-background rounded-md p-4 ${userStats.gardenStage === 'Garden' ? 'border-2 border-primary' : userStats.streak >= 30 ? 'border border-primary/50 bg-primary/5' : 'border border-border opacity-70'}`}>
                <div className="text-3xl mb-2">🏡</div>
                <h3 className="font-medium">Garden</h3>
                <p className="text-xs text-muted-foreground">30 Day Streak</p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-muted/20 rounded-lg">
              <h3 className="font-medium mb-2">How Garden Growth Works</h3>
              <p className="text-sm text-muted-foreground">
                Your garden grows as you maintain your baking streak. Each stage represents your dedication to baking consistently.
                The longer your streak, the more your garden flourishes. Don't break your streak to keep your garden thriving!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
