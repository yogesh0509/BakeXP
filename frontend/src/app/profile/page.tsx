"use client";

import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Award, User, Calendar, History, Download, Star, Flame, Flower, Loader2 } from "lucide-react";
import Link from "next/link";
import { useContracts } from '@/hooks/useContracts';
import { useWallet } from '@/contexts/WalletContext';
import { useUserData } from '@/contexts/UserDataContext';

export default function Profile() {
  const { wallet } = useWallet();
  const { isConnected, address, getUserMilestones } = useContracts();
  const { userStats, isLoading, error } = useUserData();
  const [milestonesEarned, setMilestonesEarned] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Load additional profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!address) return;
      
      try {
        // Get milestones count
        const milestones = await getUserMilestones();
        setMilestonesEarned(milestones?.length || 0);
        
        // Generate recent activity from multiple sources
        const generateRecentActivity = () => {
          const activities = [];
          
          // Get localStorage bakes
          const userBakes = localStorage.getItem(`bakes_${address}`);
          const localBakes = userBakes ? JSON.parse(userBakes) : [];
          
          // Add recent bakes from localStorage
          localBakes.slice(0, 2).forEach((bake: any) => {
            activities.push({
              description: bake.description || 'Logged a baking session',
              timestamp: new Date(bake.timestamp).getTime(),
              xpEarned: bake.xpGained || 10
            });
          });
          
          // Add milestone activities if we have milestones
          if (milestones && milestones.length > 0) {
            const recentMilestone = milestones[milestones.length - 1];
            activities.push({
              description: `🏆 Earned ${recentMilestone.name} milestone NFT`,
              timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
              xpEarned: 0
            });
          }
          
          // Add level up activity if level > 1
          if (userStats?.level && userStats.level > 1) {
            activities.push({
              description: `🎉 Reached Level ${userStats.level}`,
              timestamp: Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000,
              xpEarned: 0
            });
          }

          // Add first bake activity for new users
          if (userStats?.totalBakes && userStats.totalBakes > 0 && activities.length === 0) {
            activities.push({
              description: '🎂 Logged your first bake on BakeXP',
              timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
              xpEarned: 10
            });
          }
          
          return activities
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3);
        };

        setRecentActivity(generateRecentActivity());
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    if (isConnected && address) {
      loadProfileData();
    }
  }, [isConnected, address]);

  const formatJoinDate = () => {
    // Use when the user first appears in localStorage or default
    if (!address) return 'Recently joined';
    
    const userKey = `bakexp_user_${address}`;
    const userData = localStorage.getItem(userKey);
    if (userData) {
      try {
        const data = JSON.parse(userData);
        if (data.joinedAt) {
          return new Date(data.joinedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const getDisplayName = () => {
    if (!userStats) return 'Baker';
    return userStats.nickname || 'Anonymous Baker';
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatLastActivity = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Not connected state
  if (!wallet.connected) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Please connect your wallet to view your profile and baking achievements.
          </p>
          <div className="flex justify-center">
            <Link href="/">
              <Button size="lg">Connect Wallet</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Loading state
  if (isLoading && !userStats) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-16 px-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error && !userStats) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto py-16 px-4 text-center">
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

  // Default values if userStats is not available
  const displayStats = userStats || {
    xp: 0,
    level: 1,
    title: 'Baker',
    streak: 0,
    totalBakes: 0,
    gardenStage: 'Seed'
  };
  
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-center">Profile</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{getDisplayName()}</h2>
                <p className="text-xs text-muted-foreground mb-4">{formatAddress(address || '')}</p>
                
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" /> Save Profile
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground">Level</p>
                    <p className="font-medium">{displayStats.level}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">XP</p>
                    <p className="font-medium">{Number(displayStats.xp)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Streak</p>
                    <p className="font-medium">{displayStats.streak} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Title</p>
                    <p className="font-medium text-primary">{displayStats.title}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="text-left text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Joined
                    </span>
                    <span>{formatJoinDate()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <History className="h-3 w-3" /> Total Bakes
                    </span>
                    <span>{displayStats.totalBakes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Award className="h-3 w-3" /> Milestones
                    </span>
                    <span>{milestonesEarned}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Link href="/dashboard" className="block w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-grow w-full md:w-2/3 lg:w-3/4 space-y-6">
            {/* Baking Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Baking Stats</CardTitle>
                <CardDescription>Your BakeXP journey so far</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                      <Flame className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Current Streak</div>
                      <div className="text-2xl font-bold">{displayStats.streak} days</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {displayStats.streak > 0 ? 'Keep baking to maintain your streak!' : 'Start baking to build a streak!'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Star className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Total XP</div>
                      <div className="text-2xl font-bold">{Number(displayStats.xp)}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Level {displayStats.level} • {displayStats.title}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Flower className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Garden Stage</div>
                      <div className="text-2xl font-bold">{displayStats.gardenStage}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Garden evolves with your streak
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest baking adventures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          🍰
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{activity.description}</h3>
                            <span className="text-xs text-muted-foreground">
                              {formatLastActivity(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            You earned {activity.xpEarned} XP for this bake!
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-lg mb-2">📋</div>
                      <h3 className="font-medium text-lg mb-1">No activity yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start logging your bakes to see your activity here!
                      </p>
                      <Link href="/log">
                        <Button>Log Your First Bake</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Shortcuts to common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Link href="/log" className="block">
                    <Button variant="outline" className="w-full h-auto py-4 px-6">
                      <div className="text-center">
                        <div className="text-2xl mb-1">📝</div>
                        <div className="font-medium">Log Bake</div>
                        <div className="text-xs text-muted-foreground">Share your creation</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/milestones" className="block">
                    <Button variant="outline" className="w-full h-auto py-4 px-6">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🏆</div>
                        <div className="font-medium">View NFTs</div>
                        <div className="text-xs text-muted-foreground">See achievements</div>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link href="/bakepods" className="block">
                    <Button variant="outline" className="w-full h-auto py-4 px-6">
                      <div className="text-center">
                        <div className="text-2xl mb-1">👥</div>
                        <div className="font-medium">Join Pods</div>
                        <div className="text-xs text-muted-foreground">Bake with friends</div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
