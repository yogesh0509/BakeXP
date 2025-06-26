"use client";

import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Flame, Trophy, Loader2 } from "lucide-react";
import { useContracts } from '@/hooks/useContracts';
import { useWallet } from '@/contexts/WalletContext';
import Link from 'next/link';

export default function Leaderboard() {
  const { wallet } = useWallet();
  const { isConnected, address, getUserXPData } = useContracts();
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock leaderboard data (in a real app, this would come from a backend API)
  // Note: Since blockchain contracts typically don't store global leaderboards efficiently,
  // this would normally be handled by indexing services or backend APIs
  const [leaderboardData, setLeaderboardData] = useState({
    xpLeaders: [
      { rank: 1, address: "0x123...abc", name: "CakeWizard", xp: 1250, level: 8, title: "Master Baker" },
      { rank: 2, address: "0x456...def", name: "BreadArtist", xp: 980, level: 7, title: "Pastry Chef" },
      { rank: 3, address: "0x789...ghi", name: "SugarCrafter", xp: 845, level: 6, title: "Dessert Designer" },
      { rank: 4, address: "0xabc...jkl", name: "BakeExplorer", xp: 350, level: 3, title: "Baker" },
      { rank: 5, address: "0xdef...mno", name: "DoughMaster", xp: 330, level: 3, title: "Baker" },
    ],
    streakLeaders: [
      { rank: 1, address: "0x123...abc", name: "DailyPastry", streak: 42, title: "Baking Devotee" },
      { rank: 2, address: "0x456...def", name: "MorningBaker", streak: 30, title: "Consistent Creator" },
      { rank: 3, address: "0x789...ghi", name: "FlourPower", streak: 22, title: "Streak Champion" },
      { rank: 4, address: "0xabc...jkl", name: "BreadHead", streak: 18, title: "Regular Baker" },
      { rank: 5, address: "0xdef...mno", name: "StreakSeeker", streak: 15, title: "Dedicated Baker" },
    ],
    mostBakesLeaders: [
      { rank: 1, address: "0x123...abc", name: "BakeMaster", bakes: 85, title: "Baking Machine" },
      { rank: 2, address: "0x456...def", name: "SweetTooth", bakes: 72, title: "Dedicated Baker" },
      { rank: 3, address: "0x789...ghi", name: "CookieFiend", bakes: 64, title: "Baking Enthusiast" },
      { rank: 4, address: "0xabc...jkl", name: "PastryLover", bakes: 53, title: "Consistent Baker" },
      { rank: 5, address: "0xdef...mno", name: "BakeChampion", bakes: 48, title: "Active Baker" },
    ]
  });

  const loadUserStats = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const xpData = await getUserXPData();
      if (xpData) {
        setUserStats(xpData);
        // Update leaderboard to include current user's actual data
        updateLeaderboardWithUserData(xpData);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeaderboardWithUserData = (userData: any) => {
    // Find appropriate rank based on user's actual stats
    const userXP = Number(userData.xp);
    const userStreak = userData.streak;
    const userBakes = userData.totalBakes;
    
    // Insert user into XP leaderboard
    const xpRank = leaderboardData.xpLeaders.findIndex(leader => leader.xp < userXP) + 1;
    const streakRank = leaderboardData.streakLeaders.findIndex(leader => leader.streak < userStreak) + 1;
    const bakesRank = leaderboardData.mostBakesLeaders.findIndex(leader => leader.bakes < userBakes) + 1;

    const userEntry = {
      address: address || '',
      name: 'You',
      xp: userXP,
      level: userData.level,
      title: userData.title || 'Baker',
      streak: userStreak,
      bakes: userBakes
    };

    // Update leaderboards with user's actual position
    setLeaderboardData(prev => ({
      xpLeaders: insertUserIntoLeaderboard(prev.xpLeaders, userEntry, xpRank, 'xp'),
      streakLeaders: insertUserIntoLeaderboard(prev.streakLeaders, userEntry, streakRank, 'streak'),
      mostBakesLeaders: insertUserIntoLeaderboard(prev.mostBakesLeaders, userEntry, bakesRank, 'bakes')
    }));
  };

  const insertUserIntoLeaderboard = (leaderboard: any[], userEntry: any, rank: number, sortKey: string) => {
    // Remove existing user entry if present
    const filtered = leaderboard.filter(entry => entry.name !== 'You');
    
    // Insert user at correct position
    const newLeaderboard = [...filtered];
    const insertIndex = rank === 0 ? newLeaderboard.length : rank - 1;
    newLeaderboard.splice(insertIndex, 0, { ...userEntry, rank: insertIndex + 1 });
    
    // Update ranks for all entries
    return newLeaderboard.slice(0, 5).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  };

  useEffect(() => {
    if (address) {
      loadUserStats();
    }
  }, [address]);

  const getUserRank = (category: string) => {
    if (!userStats) return "N/A";
    
    switch (category) {
      case 'xp':
        const xpEntry = leaderboardData.xpLeaders.find(entry => entry.name === 'You');
        return xpEntry ? `#${xpEntry.rank}` : "Unranked";
      case 'streak':
        const streakEntry = leaderboardData.streakLeaders.find(entry => entry.name === 'You');
        return streakEntry ? `#${streakEntry.rank}` : "Unranked";
      case 'bakes':
        const bakesEntry = leaderboardData.mostBakesLeaders.find(entry => entry.name === 'You');
        return bakesEntry ? `#${bakesEntry.rank}` : "Unranked";
      default:
        return "N/A";
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground">See how you rank in the BakeXP community</p>
          </div>
          
          {/* Not connected state */}
          {!wallet.connected ? (
            <Link href="/">
              <Button variant="outline">Connect Wallet</Button>
            </Link>
          ) : (
            <Badge variant="outline" className="gap-1 py-1.5 px-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Your Best Rank: {getUserRank('xp')}</span>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
            </Badge>
          )}
        </div>

        {/* Not connected state */}
        {!wallet.connected && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 text-lg mb-2">🔒</div>
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-4">
                Please connect your wallet to see your ranking and compete with other bakers
              </p>
              <Link href="/">
                <Button>Connect Wallet</Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        {isConnected && (
          <Tabs defaultValue="xp" className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="xp">Top XP</TabsTrigger>
              <TabsTrigger value="streaks">Longest Streaks</TabsTrigger>
              <TabsTrigger value="bakes">Most Bakes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="xp" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> XP Leaderboard
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  <CardDescription>Bakers with the most experience points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 border-b bg-muted/50 py-3 px-4 text-sm font-medium">
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-5">Baker</div>
                      <div className="col-span-2 text-right">Level</div>
                      <div className="col-span-2 text-right">XP</div>
                      <div className="col-span-2 text-right">Title</div>
                    </div>
                    
                    {leaderboardData.xpLeaders.map((user) => (
                      <div 
                        key={user.address} 
                        className={`grid grid-cols-12 py-3 px-4 text-sm ${user.name === "You" ? "bg-primary/5 font-medium" : ""}`}
                      >
                        <div className="col-span-1">{user.rank}</div>
                        <div className="col-span-5 truncate">{user.name}</div>
                        <div className="col-span-2 text-right">{user.level}</div>
                        <div className="col-span-2 text-right">{user.xp.toLocaleString()}</div>
                        <div className="col-span-2 text-right text-primary">{user.title}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="streaks" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-rose-500" /> Streak Leaderboard
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  <CardDescription>Bakers with the longest active streaks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 border-b bg-muted/50 py-3 px-4 text-sm font-medium">
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-5">Baker</div>
                      <div className="col-span-3 text-right">Streak (Days)</div>
                      <div className="col-span-3 text-right">Title</div>
                    </div>
                    
                    {leaderboardData.streakLeaders.map((user) => (
                      <div 
                        key={user.address} 
                        className={`grid grid-cols-12 py-3 px-4 text-sm ${user.name === "You" ? "bg-primary/5 font-medium" : ""}`}
                      >
                        <div className="col-span-1">{user.rank}</div>
                        <div className="col-span-5 truncate">{user.name}</div>
                        <div className="col-span-3 text-right">{user.streak}</div>
                        <div className="col-span-3 text-right text-primary">{user.title}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bakes" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" /> Most Bakes
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  <CardDescription>Bakers with the highest total number of logged bakes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 border-b bg-muted/50 py-3 px-4 text-sm font-medium">
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-5">Baker</div>
                      <div className="col-span-3 text-right">Total Bakes</div>
                      <div className="col-span-3 text-right">Title</div>
                    </div>
                    
                    {leaderboardData.mostBakesLeaders.map((user) => (
                      <div 
                        key={user.address} 
                        className={`grid grid-cols-12 py-3 px-4 text-sm ${user.name === "You" ? "bg-primary/5 font-medium" : ""}`}
                      >
                        <div className="col-span-1">{user.rank}</div>
                        <div className="col-span-5 truncate">{user.name}</div>
                        <div className="col-span-3 text-right">{user.bakes}</div>
                        <div className="col-span-3 text-right text-primary">{user.title}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>About Rankings & Titles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">🏆 How Rankings Work</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Rankings are based on real blockchain data from your baking activities. 
                Your position updates automatically as you earn more XP, extend your streaks, or log more bakes.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">🎯 Baker Titles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div><strong>Baker</strong>: Levels 1-3</div>
                  <div><strong>Skilled Baker</strong>: Levels 4-5</div>
                  <div><strong>Pastry Chef</strong>: Levels 6-7</div>
                </div>
                <div className="space-y-1">
                  <div><strong>Master Baker</strong>: Levels 8-9</div>
                  <div><strong>Legendary Baker</strong>: Level 10+</div>
                  <div><strong>Special Titles</strong>: Earned through achievements</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📊 Real-Time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Your stats and ranking update in real-time as you log bakes and earn XP on the blockchain. 
                Keep baking to climb the leaderboards!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
