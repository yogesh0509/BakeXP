"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Droplet, Clock, Sparkles, TrendingUp, Award, Flame } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/hooks/useContracts";
import { GardenStage } from '@/contexts/UserDataContext';
// Import both services but use Pixel Labs by default
import { GardenService, GardenData, STAGE_THRESHOLDS } from '@/services/GardenService';
import { PixelLabsService, PixelGardenData } from '@/services/PixelLabsService';
import Link from 'next/link';

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
      return 'Your garden journey is just beginning! Each bake you log will help water and nurture your garden.';
    case 'Seedling': 
      return 'Your first sprouts are showing! Keep logging bakes to provide the nutrients your garden needs.';
    case 'Sprout': 
      return 'Your garden is growing beautifully! Each baking session adds to your garden\'s strength and vitality.';
    case 'Plant': 
      return 'Your plants are thriving! Your consistent baking has created a wonderful foundation for growth.';
    case 'Tree': 
      return 'Your garden has grown into a magnificent tree! Your dedication to baking is truly paying off.';
    case 'Garden': 
      return 'Congratulations! Your garden is fully grown. You\'ve become a master baker and gardener through your dedication!';
    default: 
      return 'Keep baking to grow your garden!';
  }
}

// Helper function to format time until next water
function formatTimeUntilNextWater(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

// Helper function to get trait color
function getTraitColor(rarity: string): string {
  switch (rarity) {
    case 'legendary': return 'text-yellow-500';
    case 'epic': return 'text-purple-500';
    case 'rare': return 'text-blue-500';
    case 'uncommon': return 'text-green-500';
    default: return 'text-gray-500';
  }
}

export default function Garden() {
  const router = useRouter();
  const { wallet } = useWallet();
  const { getUserXPData, address } = useContracts();
  const [garden, setGarden] = useState<PixelGardenData | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilNextWater, setTimeUntilNextWater] = useState<number>(0);
  const [isWatering, setIsWatering] = useState(false);

  // Use Pixel Labs service
  const pixelService = PixelLabsService.getInstance();

  useEffect(() => {
    async function loadGarden() {
      if (wallet.address) {
        try {
          // Load both garden data and contract stats
          const [gardenData, contractStats] = await Promise.all([
            pixelService.getPixelGarden(wallet.address),
            getUserXPData()
          ]);
          
          setGarden(gardenData);
          setUserStats(contractStats);
          setTimeUntilNextWater(await pixelService.getTimeUntilNextWater(wallet.address));
        } catch (error) {
          console.error('Failed to load garden data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadGarden();
  }, [wallet.address]);

  // Update time until next water every minute
  useEffect(() => {
    if (!wallet.address) return;

    const interval = setInterval(async () => {
      setTimeUntilNextWater(await pixelService.getTimeUntilNextWater(wallet.address!));
    }, 60000);

    return () => clearInterval(interval);
  }, [wallet.address]);

  const handleWater = async () => {
    if (!wallet.address || !garden) return;

    setIsWatering(true);
    try {
      const updatedGarden = await pixelService.waterPixelGarden(wallet.address);
      setGarden(updatedGarden);
      setTimeUntilNextWater(await pixelService.getTimeUntilNextWater(wallet.address));
    } finally {
      setIsWatering(false);
    }
  };

  const [nextStageInfo, setNextStageInfo] = useState<{ nextStage: GardenStage | null; percentToNext: number; experienceToNext: number } | null>(null);
  const [canWater, setCanWater] = useState(false);

  useEffect(() => {
    async function updateInfo() {
      if (wallet.address) {
        const [nextInfo, waterStatus] = await Promise.all([
          pixelService.getNextStageInfo(wallet.address),
          pixelService.canWater(wallet.address)
        ]);
        setNextStageInfo(nextInfo);
        setCanWater(waterStatus);
      }
    }
    updateInfo();
  }, [wallet.address, garden]);

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
  if (isLoading || !garden || !nextStageInfo) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-16 px-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Growing your garden...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Pixel Garden</h1>
            <p className="text-muted-foreground">Your garden grows stronger with every bake you log</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="bg-primary/10 text-primary py-1 px-3 rounded-full text-sm font-medium flex items-center gap-1">
              <Droplet className="h-4 w-4" />
              <span>Health: {garden.health}%</span>
            </div>
            <div className="bg-amber-500/10 text-amber-500 py-1 px-3 rounded-full text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Level {garden.level}</span>
            </div>
            {userStats && (
              <div className="bg-green-500/10 text-green-500 py-1 px-3 rounded-full text-sm font-medium flex items-center gap-1">
                <Flame className="h-4 w-4" />
                <span>{userStats.totalBakes} Total Bakes</span>
              </div>
            )}
          </div>
        </div>

        {/* How Baking Affects Your Garden */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              How Baking Grows Your Garden
            </CardTitle>
            <CardDescription>Every bake you log contributes to your garden's growth and evolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <div className="text-3xl mb-2">🍰</div>
                <h3 className="font-medium mb-2">Log Bakes</h3>
                <p className="text-sm text-muted-foreground">
                  Each baking session you log adds XP that directly feeds your garden's growth
                </p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <div className="text-3xl mb-2">💧</div>
                <h3 className="font-medium mb-2">Automatic Watering</h3>
                <p className="text-sm text-muted-foreground">
                  Your garden gets automatically watered when you maintain an active baking streak
                </p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <div className="text-3xl mb-2">🌱</div>
                <h3 className="font-medium mb-2">Evolutionary Growth</h3>
                <p className="text-sm text-muted-foreground">
                  As you accumulate XP from baking, your garden evolves through 6 distinct stages
                </p>
              </div>
            </div>
            
            {userStats && (
              <div className="mt-6 p-4 bg-white/60 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Your Baking Impact</span>
                  <span className="text-sm text-muted-foreground">Based on your activity</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{userStats.totalBakes}</div>
                    <div className="text-xs text-muted-foreground">Total Bakes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{userStats.xp}</div>
                    <div className="text-xs text-muted-foreground">Garden XP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{userStats.streak}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{userStats.level}</div>
                    <div className="text-xs text-muted-foreground">Level</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Garden Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Stage: {garden.stage}</CardTitle>
                <CardDescription>Level {garden.level} Garden • {garden.experience} XP</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getTraitColor(garden.traits.rarity)}`}>
                  {garden.traits.rarity}
                </span>
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 rounded-lg p-8 w-full min-h-80 flex flex-col items-center justify-center mb-6">
              {/* Garden visualization */}
              <div className="text-8xl mb-10 transition-all duration-500 hover:scale-110">
                {renderGardenEmoji(garden.stage)}
              </div>
              <div className="text-center">
                <p className="text-muted-foreground max-w-md mb-4">
                  {getGardenDescription(garden.stage)}
                </p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="px-2 py-1 rounded bg-background border">
                    Color: {garden.traits.color}
                  </span>
                  <span className="px-2 py-1 rounded bg-background border">
                    Pattern: {garden.traits.pattern}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{garden.stage}</span>
                <span>{nextStageInfo.nextStage || 'Complete'}</span>
              </div>
              <Progress value={nextStageInfo.percentToNext} className="h-2" />
              <p className="text-xs text-muted-foreground text-center mt-1">
                {nextStageInfo.nextStage ? 
                  `${nextStageInfo.percentToNext.toFixed(0)}% progress to ${nextStageInfo.nextStage} (${nextStageInfo.experienceToNext} XP needed)` : 
                  'Garden fully grown!'}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleWater}
                disabled={!canWater || isWatering}
                className="gap-2"
              >
                {isWatering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Watering...
                  </>
                ) : !canWater ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Next water in {formatTimeUntilNextWater(timeUntilNextWater)}
                  </>
                ) : (
                  <>
                    <Droplet className="h-4 w-4" />
                    Water Garden
                  </>
                )}
              </Button>
              
              <Link href="/log">
                <Button variant="outline" className="gap-2">
                  <Award className="h-4 w-4" />
                  Log a Bake
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Garden Evolution Path */}
        <Card>
          <CardHeader>
            <CardTitle>Garden Evolution Path</CardTitle>
            <CardDescription>
              Each bake you log brings you closer to these amazing garden stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {Object.entries(STAGE_THRESHOLDS).map(([stage, { min }]) => {
                const isCurrentStage = garden.stage === stage;
                const isCompleted = garden.experience >= min;
                const bakesToReach = Math.max(0, Math.ceil((min - garden.experience) / 10)); // Assuming 10 XP per bake
                
                return (
                  <div
                    key={stage}
                    className={`bg-background rounded-md p-4 relative ${
                      isCurrentStage
                        ? 'border-2 border-primary ring-2 ring-primary/20'
                        : isCompleted
                        ? 'border border-primary/50 bg-primary/5'
                        : 'border border-border opacity-70'
                    }`}
                  >
                    <div className="text-3xl mb-2">{renderGardenEmoji(stage as GardenStage)}</div>
                    <h3 className="font-medium">{stage}</h3>
                    <p className="text-xs text-muted-foreground">{min} XP</p>
                    {!isCompleted && bakesToReach > 0 && (
                      <p className="text-xs text-primary mt-1">
                        ~{bakesToReach} bakes to go
                      </p>
                    )}
                    {isCurrentStage && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">•</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 p-6 bg-muted/20 rounded-lg">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Garden Growth Mechanics
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-3">🍰 Baking Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Each bake logged = +10 XP for your garden</li>
                    <li>• Milestone achievements give bonus XP</li>
                    <li>• Consistent baking maintains garden health</li>
                    <li>• Streak bonuses boost garden growth rate</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-3">🌟 Garden Traits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="text-yellow-500">• Legendary: +25 XP per water</li>
                    <li className="text-purple-500">• Epic: +20 XP per water</li>
                    <li className="text-blue-500">• Rare: +15 XP per water</li>
                    <li className="text-green-500">• Uncommon: +10 XP per water</li>
                    <li className="text-gray-500">• Common: +5 XP per water</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary mb-1">🎯 Pro Tip</p>
                <p className="text-sm text-muted-foreground">
                  The more you bake and maintain your streak, the faster your garden grows! 
                  Try to log at least one bake per day to keep your garden healthy and thriving.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
