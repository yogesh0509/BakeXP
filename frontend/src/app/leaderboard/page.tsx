"use client";

import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Award, Flame, Trophy } from "lucide-react";

export default function Leaderboard() {
  // Mock data (would be from Starknet contracts in the future)
  const xpLeaders = [
    { rank: 1, address: "0x123...abc", name: "CakeWizard", xp: 1250, level: 8, title: "Master Baker" },
    { rank: 2, address: "0x456...def", name: "BreadArtist", xp: 980, level: 7, title: "Pastry Chef" },
    { rank: 3, address: "0x789...ghi", name: "SugarCrafter", xp: 845, level: 6, title: "Dessert Designer" },
    { rank: 4, address: "0xabc...jkl", name: "You", xp: 350, level: 3, title: "Baker" },
    { rank: 5, address: "0xdef...mno", name: "DoughMaster", xp: 330, level: 3, title: "Baker" },
  ];
  
  const streakLeaders = [
    { rank: 1, address: "0x123...abc", name: "DailyPastry", streak: 42, title: "Baking Devotee" },
    { rank: 2, address: "0x456...def", name: "MorningBaker", streak: 30, title: "Consistent Creator" },
    { rank: 3, address: "0x789...ghi", name: "FlourPower", streak: 22, title: "Streak Champion" },
    { rank: 4, address: "0xabc...jkl", name: "BreadHead", streak: 18, title: "Regular Baker" },
    { rank: 5, address: "0xdef...mno", name: "You", streak: 5, title: "Beginner Baker" },
  ];
  
  const mostBakesLeaders = [
    { rank: 1, address: "0x123...abc", name: "BakeMaster", bakes: 85, title: "Baking Machine" },
    { rank: 2, address: "0x456...def", name: "SweetTooth", bakes: 72, title: "Dedicated Baker" },
    { rank: 3, address: "0x789...ghi", name: "CookieFiend", bakes: 64, title: "Baking Enthusiast" },
    { rank: 4, address: "0xabc...jkl", name: "PastryLover", bakes: 53, title: "Consistent Baker" },
    { rank: 5, address: "0xdef...mno", name: "You", bakes: 12, title: "Novice Baker" },
  ];
  
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground">See how you rank in the BakeXP community</p>
          </div>
          <Badge variant="outline" className="gap-1 py-1.5 px-3">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Your Rank: #4</span>
          </Badge>
        </div>
        
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
                  
                  {xpLeaders.map((user) => (
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
                  
                  {streakLeaders.map((user) => (
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
                  
                  {mostBakesLeaders.map((user) => (
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
        
        <Card>
          <CardHeader>
            <CardTitle>About Titles</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Titles are earned based on your level and achievements in BakeXP. Continue baking 
              and maintaining your streaks to unlock more prestigious titles!
            </p>
            <ul className="list-inside list-disc">
              <li><strong>Baker</strong>: Levels 1-3</li>
              <li><strong>Skilled Baker</strong>: Levels 4-5</li>
              <li><strong>Pastry Chef</strong>: Levels 6-7</li>
              <li><strong>Master Baker</strong>: Levels 8-9</li>
              <li><strong>Legendary Baker</strong>: Level 10+</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
