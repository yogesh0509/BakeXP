"use client";

import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Award, Calendar, Flame, Upload, Flower, Loader2, Users, TrendingUp, Star } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/hooks/useContracts";
import { useState, useEffect } from "react";
import { UserXPData, UserMilestone } from "@/contracts/types";

interface DashboardData {
  userStats: UserXPData | null;
  milestones: UserMilestone[];
  userPods: any[];
  isLoading: boolean;
  error: string | null;
}

export default function Dashboard() {
  const { wallet } = useWallet();
  const { isConnected, address, getUserXPData, getUserMilestones, services, isInitialized } = useContracts();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    userStats: null,
    milestones: [],
    userPods: [],
    isLoading: true,
    error: null
  });

  // Check if user has baked today based on contract data
  const [hasBakedToday, setHasBakedToday] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Only load data when wallet is connected, address is available, and contracts are initialized
      if (!isConnected || !address || !isInitialized) {
        console.log('Dashboard: Not ready to load data', { 
          isConnected, 
          hasAddress: !!address, 
          isInitialized 
        });
        
        // If wallet is not connected, don't show loading
        if (!wallet.connected) {
          setDashboardData(prev => ({ ...prev, isLoading: false }));
        }
        return;
      }

      console.log('Dashboard: Loading data - contracts ready');
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log('Loading dashboard data for address:', address);
        
        // Add a small delay to ensure contracts are fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Load all dashboard data in parallel
        const [userStats, milestones, podIds] = await Promise.all([
          getUserXPData(),
          getUserMilestones(),
          services.bakePods.getUserPods(address)
        ]);

        console.log('Loaded user stats:', userStats);
        console.log('Loaded milestones:', milestones);
        console.log('Loaded pod IDs:', podIds);

        // Load full pod data if user has pods
        let userPods: any[] = [];
        if (podIds && podIds.length > 0) {
          const podPromises = podIds.map(async (podId) => {
            const [pod, stats] = await Promise.all([
              services.bakePods.getPod(podId),
              services.bakePods.getPodStats(podId)
            ]);
            return pod ? { ...pod, stats } : null;
          });
          const pods = await Promise.all(podPromises);
          userPods = pods.filter(pod => pod !== null);
        }

        // Check if user has baked today - properly handle timestamp
        let bakedToday = false;
        if (userStats?.lastBakeTimestamp && userStats.lastBakeTimestamp > 0) {
          const lastBake = new Date(userStats.lastBakeTimestamp * 1000);
          const today = new Date();
          
          // Reset hours to compare only dates
          const lastBakeDate = new Date(lastBake.getFullYear(), lastBake.getMonth(), lastBake.getDate());
          const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          bakedToday = lastBakeDate.getTime() === todayDate.getTime();
          console.log('Baked today check:', { lastBake, today, bakedToday });
        }

        setHasBakedToday(bakedToday);
        setDashboardData({
          userStats,
          milestones: milestones || [],
          userPods,
          isLoading: false,
          error: null
        });

        console.log('Dashboard: Data loaded successfully');

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    loadDashboardData();
  }, [isConnected, address, isInitialized, wallet.connected]); // Added isInitialized and wallet.connected to dependencies

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
  
  // Show loading state (when wallet is connected but contracts not ready or data loading)
  if (dashboardData.isLoading || !isInitialized) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-16 px-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">
            {!isInitialized 
              ? 'Initializing contracts...' 
              : 'Loading your baking stats from blockchain...'
            }
          </p>
        </div>
      </Layout>
    );
  }
  
  // Handle error state
  if (dashboardData.error) {
    const retryLoadData = () => {
      setDashboardData(prev => ({ ...prev, error: null, isLoading: true }));
      // Trigger the useEffect to reload data
      setTimeout(() => {
        if (isConnected && address && isInitialized) {
          // Force re-run of useEffect
          setDashboardData(prev => ({ ...prev, isLoading: false }));
        }
      }, 100);
    };

    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-bold mb-6">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">{dashboardData.error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={retryLoadData}>
              Retry Loading
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const { userStats, milestones, userPods } = dashboardData;

  // Use default values if userStats is not available
  const stats = userStats || {
    xp: BigInt(0),
    level: 1,
    streak: 0,
    totalBakes: 0,
    lastBakeTimestamp: 0
  };

  // Fix level calculation using contract's utility functions - properly handle BigInt
  const xpNumber = Number(stats.xp);
  const level = Math.max(1, Math.floor(Math.sqrt(xpNumber / 100)) + 1);
  
  // Calculate level progress - fix division by zero error
  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = level * level * 100;
  const progressToNextLevel = nextLevelXP > currentLevelXP ? 
    Math.min(((xpNumber - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100) : 
    100;

  // Get user title based on level
  const getUserTitle = (level: number) => {
    if (level >= 10) return 'Master Baker';
    if (level >= 5) return 'Expert Baker';
    if (level >= 3) return 'Skilled Baker';
    return 'Apprentice Baker';
  };

  // Calculate garden stage based on XP (simplified logic)
  const getGardenStage = (xp: number) => {
    if (xp >= 500) return 'Garden';
    if (xp >= 300) return 'Tree';
    if (xp >= 150) return 'Plant';
    if (xp >= 75) return 'Sprout';
    if (xp >= 25) return 'Seedling';
    return 'Seed';
  };

  const gardenStage = getGardenStage(xpNumber);
  const nextGardenThresholds = [25, 75, 150, 300, 500];
  const nextThreshold = nextGardenThresholds.find(threshold => xpNumber < threshold);
  const progressToNextGarden = nextThreshold ? (xpNumber / nextThreshold) * 100 : 100;

  // Format last bake date
  const formatLastBakeDate = () => {
    if (!stats.lastBakeTimestamp || stats.lastBakeTimestamp === 0) return 'Never baked yet';
    return new Date(stats.lastBakeTimestamp * 1000).toLocaleDateString();
  };

  // Get display name
  const getDisplayName = () => {
    return 'Baker'; // Can be enhanced with user nickname from localStorage or profile
  };
  
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {getDisplayName()}!</h1>
            <p className="text-muted-foreground">Track your baking progress and achievements on the blockchain</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="bg-primary/10 text-primary py-1 px-3 rounded-full text-sm font-medium">
              Level {level} • {getUserTitle(level)}
            </div>
            <Link href="/log">
              <Button size="lg" className="gap-2" disabled={hasBakedToday}>
                <Upload className="h-4 w-4" />
                {hasBakedToday ? "Already Baked Today" : "Log Today's Bake"}
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Main Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak} Days</div>
              <p className="text-xs text-muted-foreground">Last bake: {formatLastBakeDate()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">XP Points</CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{xpNumber} XP</div>
              <p className="text-xs text-muted-foreground">Level {level} {getUserTitle(level)}</p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <Progress value={Math.min(Math.max(progressToNextLevel, 0), 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Bakes</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBakes}</div>
              <p className="text-xs text-muted-foreground">Logged on blockchain</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Garden Status</CardTitle>
              <Flower className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gardenStage}</div>
              <p className="text-xs text-muted-foreground">
                {nextThreshold ? `${progressToNextGarden.toFixed(0)}% to next stage` : 'Fully grown!'}
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <Progress value={Math.min(progressToNextGarden, 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements & Activity */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Recent Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Recent Achievements
              </CardTitle>
              <CardDescription>Your latest milestone NFTs</CardDescription>
            </CardHeader>
            <CardContent>
              {milestones.length > 0 ? (
                <div className="space-y-3">
                  {milestones.slice(0, 3).map((milestone, index) => (
                    <div key={milestone.id} className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{milestone.name}</p>
                        <p className="text-xs text-muted-foreground">{Number(milestone.rewardXP)} XP reward</p>
                      </div>
                    </div>
                  ))}
                  <Link href="/milestones">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Milestones
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No milestones earned yet</p>
                  <Link href="/milestones">
                    <Button variant="outline" size="sm">View Available Milestones</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Pods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Your BakePods
              </CardTitle>
              <CardDescription>Active group challenges</CardDescription>
            </CardHeader>
            <CardContent>
              {userPods.length > 0 ? (
                <div className="space-y-3">
                  {userPods.slice(0, 2).map((pod, index) => (
                    <div key={pod.id} className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{pod.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {pod.stats?.currentStreak || 0}/{pod.targetStreak} days
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <Progress 
                          value={pod.stats ? Math.min((pod.stats.currentStreak / pod.targetStreak) * 100, 100) : 0} 
                          className="h-1.5" 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pod.stats?.totalBakes || 0} total bakes
                      </p>
                    </div>
                  ))}
                  <Link href="/bakepods">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Pods
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No active pods</p>
                  <Link href="/bakepods">
                    <Button variant="outline" size="sm">Create Your First Pod</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Navigation */}
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
                <div className="mt-2 text-xs text-primary font-medium">
                  {milestones.length} earned • View collection
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/garden" className="no-underline">
            <Card className="hover:bg-muted/10 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flower className="h-5 w-5 text-primary" /> Garden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Nurture your digital garden as you log more bakes.</p>
                <div className="mt-2 text-xs text-primary font-medium">
                  {gardenStage} stage • Water now
                </div>
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
                <div className="mt-2 text-xs text-primary font-medium">
                  Level {level} • {xpNumber} XP
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
