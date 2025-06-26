"use client";

import { GardenStage } from '@/contexts/UserDataContext';

export interface PixelGardenData {
  stage: GardenStage;
  lastWatered: string;
  health: number;
  experience: number;
  level: number;
  streak: number;
  pixelId: string; // Unique identifier for the pixel
  traits: {
    color: string;
    pattern: string;
    rarity: string;
  };
}

// Free version of Pixel Labs API service
export class PixelLabsService {
  private static instance: PixelLabsService;
  private readonly API_ENDPOINT = 'https://api.pixellabs.io/v1'; // Example endpoint

  private constructor() {}

  public static getInstance(): PixelLabsService {
    if (!PixelLabsService.instance) {
      PixelLabsService.instance = new PixelLabsService();
    }
    return PixelLabsService.instance;
  }

  // Generate a unique pixel ID based on user's address
  private generatePixelId(address: string): string {
    return `PIXEL_${address.slice(0, 8)}`;
  }

  // Generate random traits for the pixel
  private generateTraits(): PixelGardenData['traits'] {
    const colors = ['red', 'blue', 'green', 'purple', 'gold'];
    const patterns = ['solid', 'striped', 'dotted', 'gradient', 'sparkle'];
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      pattern: patterns[Math.floor(Math.random() * patterns.length)],
      rarity: rarities[Math.floor(Math.random() * rarities.length)]
    };
  }

  // Initialize or get existing pixel garden
  public async getPixelGarden(address: string): Promise<PixelGardenData> {
    // In a real implementation, this would make an API call
    // For the free version, we'll use localStorage but structure it like an API response
    if (typeof window === 'undefined') {
      return this.getInitialPixelData(address);
    }

    const storedData = localStorage.getItem(`pixel_${address.toLowerCase()}`);
    if (!storedData) {
      const initialData = this.getInitialPixelData(address);
      localStorage.setItem(`pixel_${address.toLowerCase()}`, JSON.stringify(initialData));
      return initialData;
    }

    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error('Error parsing pixel data:', e);
      return this.getInitialPixelData(address);
    }
  }

  private getInitialPixelData(address: string): PixelGardenData {
    return {
      stage: 'Seed',
      lastWatered: new Date().toISOString(),
      health: 100,
      experience: 0,
      level: 1,
      streak: 0,
      pixelId: this.generatePixelId(address),
      traits: this.generateTraits()
    };
  }

  private calculateStage(experience: number): GardenStage {
    if (experience >= 2000) return 'Garden';
    if (experience >= 1000) return 'Tree';
    if (experience >= 600) return 'Plant';
    if (experience >= 300) return 'Sprout';
    if (experience >= 100) return 'Seedling';
    return 'Seed';
  }

  // Water the pixel garden
  public async waterPixelGarden(address: string): Promise<PixelGardenData> {
    const garden = await this.getPixelGarden(address);
    const lastWatered = new Date(garden.lastWatered);
    const now = new Date();
    
    // Can only water once every 12 hours
    if (now.getTime() - lastWatered.getTime() < 12 * 60 * 60 * 1000) {
      return garden;
    }

    // Calculate bonuses based on traits
    const rarityBonus = this.calculateRarityBonus(garden.traits.rarity);
    const patternBonus = this.calculatePatternBonus(garden.traits.pattern);

    const updatedGarden: PixelGardenData = {
      ...garden,
      lastWatered: now.toISOString(),
      health: Math.min(100, garden.health + 20),
      experience: garden.experience + 50 + rarityBonus + patternBonus,
      level: Math.floor((garden.experience + 50 + rarityBonus + patternBonus) / 100) + 1,
    };

    updatedGarden.stage = this.calculateStage(updatedGarden.experience);

    // In a real implementation, this would be an API call
    localStorage.setItem(`pixel_${address.toLowerCase()}`, JSON.stringify(updatedGarden));

    return updatedGarden;
  }

  private calculateRarityBonus(rarity: string): number {
    switch (rarity) {
      case 'legendary': return 25;
      case 'epic': return 20;
      case 'rare': return 15;
      case 'uncommon': return 10;
      default: return 5;
    }
  }

  private calculatePatternBonus(pattern: string): number {
    switch (pattern) {
      case 'sparkle': return 15;
      case 'gradient': return 12;
      case 'dotted': return 10;
      case 'striped': return 8;
      default: return 5;
    }
  }

  public async getNextStageInfo(address: string) {
    const garden = await this.getPixelGarden(address);
    const stages: GardenStage[] = ['Seed', 'Seedling', 'Sprout', 'Plant', 'Tree', 'Garden'];
    const thresholds = [0, 100, 300, 600, 1000, 2000];
    
    const currentIndex = stages.indexOf(garden.stage);
    
    if (currentIndex === stages.length - 1) {
      return {
        nextStage: null,
        percentToNext: 100,
        experienceToNext: 0
      };
    }

    const nextStage = stages[currentIndex + 1];
    const nextThreshold = thresholds[currentIndex + 1];
    const currentThreshold = thresholds[currentIndex];
    
    const experienceToNext = nextThreshold - garden.experience;
    const totalExperienceNeeded = nextThreshold - currentThreshold;
    const currentProgress = garden.experience - currentThreshold;
    const percentToNext = (currentProgress / totalExperienceNeeded) * 100;

    return {
      nextStage,
      percentToNext: Math.min(100, Math.max(0, percentToNext)),
      experienceToNext
    };
  }

  public async canWater(address: string): Promise<boolean> {
    const garden = await this.getPixelGarden(address);
    const lastWatered = new Date(garden.lastWatered);
    const now = new Date();
    return now.getTime() - lastWatered.getTime() >= 12 * 60 * 60 * 1000;
  }

  public async getTimeUntilNextWater(address: string): Promise<number> {
    const garden = await this.getPixelGarden(address);
    const lastWatered = new Date(garden.lastWatered);
    const now = new Date();
    const timeSinceLastWater = now.getTime() - lastWatered.getTime();
    const waitTime = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    return Math.max(0, waitTime - timeSinceLastWater);
  }
} 