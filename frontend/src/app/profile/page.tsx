"use client";

import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Award, User, Calendar, History, Wallet, Download, Star, Flame, Flower } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Profile() {
  // Mock data (would be from Starknet contracts in the future)
  const userData = {
    address: "0xabc...jkl",
    nickname: "BreadHead",
    joinDate: "June 10, 2025",
    xp: 350,
    level: 3,
    title: "Baker",
    streak: 5,
    totalBakes: 12,
    milestonesEarned: 2,
    pods: ["Weekend Warriors"],
    gardenStage: "Seedling"
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
                <h2 className="text-xl font-bold">{userData.nickname}</h2>
                <p className="text-xs text-muted-foreground mb-4">{userData.address}</p>
                
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" /> Save Profile
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground">Level</p>
                    <p className="font-medium">{userData.level}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">XP</p>
                    <p className="font-medium">{userData.xp}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Streak</p>
                    <p className="font-medium">{userData.streak} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Title</p>
                    <p className="font-medium text-primary">{userData.title}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="text-left text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Joined
                    </span>
                    <span>{userData.joinDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <History className="h-3 w-3" /> Total Bakes
                    </span>
                    <span>{userData.totalBakes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Award className="h-3 w-3" /> Milestones
                    </span>
                    <span>{userData.milestonesEarned}</span>
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
                      <div className="text-2xl font-bold">{userData.streak} days</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep baking to maintain your streak!
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Star className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Total XP</div>
                      <div className="text-2xl font-bold">{userData.xp}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Level {userData.level} • {userData.title}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Flower className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Garden Stage</div>
                      <div className="text-2xl font-bold">{userData.gardenStage}</div>
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
                  {/* Sample Activity Items */}
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      🍪
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Chocolate Chip Cookies</h3>
                        <span className="text-xs text-muted-foreground">Today</span>
                      </div>
                      <p className="text-sm text-muted-foreground">You earned 25 XP for this bake!</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      🏆
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium">3-Day Streak Milestone</h3>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">You earned a new milestone NFT!</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      🥖
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium">French Baguette</h3>
                        <span className="text-xs text-muted-foreground">4 days ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground">You earned 25 XP for this bake!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Wallet & Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" /> Wallet Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{userData.address}</div>
                      <div className="text-xs text-muted-foreground">Starknet Wallet</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
