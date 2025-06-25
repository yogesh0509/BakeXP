"use client";

import Link from "next/link";
import { Layout } from "@/components/layout/layout";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Flame, Flower, Users } from "lucide-react";
import WalletButton from "@/components/wallet/WalletButton";

export default function Home() {
  // We'll use the WalletButton component that handles connection via context
  
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-background to-muted/30 px-4 py-20 md:py-32 flex flex-col items-center text-center">
        <div className="container max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-5xl">🧁</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">BakeXP</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Track your baking XP, maintain streaks, earn NFT milestones, and grow your pixel garden!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WalletButton />
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <Section 
        title="Gamified Baking Experience"
        description="Transforming your baking hobby into a rewarding adventure"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Daily Streaks</h3>
              <p className="text-sm text-muted-foreground">
                Maintain your baking streak and watch your rewards multiply!
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">XP & Levels</h3>
              <p className="text-sm text-muted-foreground">
                Earn XP with every bake and level up your baker rank!
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flower className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Pixel Garden</h3>
              <p className="text-sm text-muted-foreground">
                Watch your garden grow and evolve as you bake more often!
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">BakePods</h3>
              <p className="text-sm text-muted-foreground">
                Join group challenges with friends and earn special rewards!
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>
      
      {/* How It Works */}
      <Section 
        title="How BakeXP Works"
        description="Your journey from casual baker to master"
        className="bg-muted/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white mb-4">
              1
            </div>
            <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground">
              Sign in with your Starknet wallet to track your progress securely on-chain
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white mb-4">
              2
            </div>
            <h3 className="text-lg font-medium mb-2">Log Your Bakes</h3>
            <p className="text-muted-foreground">
              Upload photos of your bakes daily to earn XP and maintain your streak
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white mb-4">
              3
            </div>
            <h3 className="text-lg font-medium mb-2">Collect Rewards</h3>
            <p className="text-muted-foreground">
              Earn milestone NFTs, grow your garden, and climb the leaderboard
            </p>
          </div>
        </div>
      </Section>
      
      {/* NFT Showcase Section */}
      <Section>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold mb-4">Milestone NFTs</h2>
            <p className="mt-2 text-muted-foreground">
              Each milestone in your baking journey is commemorated with a unique NFT stored on Starknet.
              From your first bake to impressive streaks, these digital collectibles celebrate your progress.
            </p>
            <p className="mt-4 text-muted-foreground">
              Show off your achievements, trade with other bakers, or simply admire your growing collection
              as you continue to perfect your baking skills!
            </p>
            <Button asChild className="mt-6">
              <Link href="/milestones">Preview Milestone NFTs</Link>
            </Button>
          </div>
          <div className="flex justify-center order-1 md:order-2">
            <div className="grid grid-cols-2 gap-4 max-w-xs">
              <div className="bg-primary/10 aspect-square rounded-lg flex items-center justify-center text-4xl shadow-sm">
                🏆
              </div>
              <div className="bg-primary/10 aspect-square rounded-lg flex items-center justify-center text-4xl shadow-sm">
                🔥
              </div>
              <div className="bg-primary/10 aspect-square rounded-lg flex items-center justify-center text-4xl shadow-sm">
                🌱
              </div>
              <div className="bg-primary/10 aspect-square rounded-lg flex items-center justify-center text-4xl shadow-sm">
                🥖
              </div>
            </div>
          </div>
        </div>
      </Section>
      
      {/* Call to Action */}
      <Section className="text-center bg-primary/5 rounded-lg">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Start Your Baking Journey?</h2>
        <p className="mt-4 text-xl text-muted-foreground max-w-[600px] mx-auto">
          Turn your passion for baking into a rewarding experience with BakeXP.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <WalletButton />
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Try Demo</Link>
          </Button>
        </div>
      </Section>
    </Layout>
  );
}
