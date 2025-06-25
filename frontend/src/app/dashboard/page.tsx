"use client";

import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Award, Calendar, Flame, Upload, Flower, Loader2 } from "lucide-react";
import { useUserData } from "@/contexts/UserDataContext";
import { useWallet } from "@/contexts/WalletContext";

// Helper function to render garden emoji based on stage
function renderGardenEmoji(stage: string): string {
  switch (stage) {
    case 'Seed': return '🌰'; // 🌰
    case 'Seedling': return '🌱'; // 🌱
    case 'Sprout': return '🌿'; // 🌿
    case 'Plant': return '🪴'; // 🪴
    case 'Tree': return '🌳'; // 🌳
    case 'Garden': return '🏡'; // 🏡
    default: return '🌱'; // 🌱
  }
}

export default function Dashboard() {
  const { wallet } = useWallet();
  const { userStats, isLoading, error, hasBakedToday } = useUserData();

  // If not connected, show connect prompt
  if (!wallet.connected) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Please connect your wallet to view your BakeXP dashboard and track your baking progress.
          </p>
          <div className="flex justify-center">
            <Link href="/">
              <Button size="lg">Back to Home</Button>
            </Link>
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
          <p className="text-muted-foreground">Loading your baking stats...</p>
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

  // Format last bake date
  const formatLastBakeDate = () => {
    if (!userStats.lastBakeTimestamp) return 'Never baked yet';
    return new Date(userStats.lastBakeTimestamp).toLocaleDateString();
  };
  
  // Get appropriate garden message based on streak and stage
  const getGardenMessage = (streak: number, stage: string) => {
    if (streak === 0) return "Start baking to grow your garden!";
    if (stage === 'Garden') return "Congratulations! Your garden is fully grown!";
    return "Your garden is growing! Keep baking to see it flourish.";
  };
  
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {userStats.nickname}!</h1>
            <p className="text-muted-foreground">Track your baking progress and achievements</p>
          </div>
          <Link href="/log">
            <Button size="lg" className="gap-2" disabled={hasBakedToday}>
              <Upload className="h-4 w-4" />
              {hasBakedToday ? "Already Baked Today" : "Log Today's Bake"}
            </Button>
          </Link>
        </div>
        
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.streak} Days</div>
              <p className="text-xs text-muted-foreground">Last bake: {formatLastBakeDate()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">XP Points</CardTitle>
              <Award className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.xp} XP</div>
              <p className="text-xs text-muted-foreground">Level {userStats.level} {userStats.title}</p>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <Progress value={userStats.percentToNextLevel} className="h-2" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Garden Status</CardTitle>
              <Flower className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.gardenStage}</div>
              {userStats.nextGardenStage ? (
                <p className="text-xs text-muted-foreground">
                  {userStats.percentToNextGardenStage.toFixed(0)}% to {userStats.nextGardenStage}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Garden fully grown!</p>
              )}
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <Progress value={userStats.percentToNextGardenStage} className="h-2 bg-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Garden Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Baking Garden</CardTitle>
            <CardDescription>Watch your garden grow with each bake!</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="bg-muted/30 rounded-lg p-8 w-full max-w-md h-60 flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                {renderGardenEmoji(userStats.gardenStage)}
                <br />
                <span className="block mt-4">
                  {getGardenMessage(userStats.streak, userStats.gardenStage)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/milestones" className="no-underline">
            <Card className="hover:bg-muted/10 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View your earned milestone NFTs and upcoming achievements.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/bakepods" className="no-underline">
            <Card className="hover:bg-muted/10 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> BakePods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Join or create a baking group challenge with friends.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/leaderboard" className="no-underline">
            <Card className="hover:bg-muted/10 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" /> Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">See how you rank among other bakers in the community.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
