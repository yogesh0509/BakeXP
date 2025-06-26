"use client";

import { GardenStage } from '@/contexts/UserDataContext';

export interface GardenData {
  stage: GardenStage;
  lastWatered: string; // ISO date string
  health: number;
  experience: number;
  level: number;
  streak: number;
}

// Experience thresholds for each stage
export const STAGE_THRESHOLDS: Record<GardenStage, { min: number; max: number }> = {
  Seed: { min: 0, max: 100 },
  Seedling: { min: 100, max: 300 },
  Sprout: { min: 300, max: 600 },
  Plant: { min: 600, max: 1000 },
  Tree: { min: 1000, max: 2000 },
  Garden: { min: 2000, max: 2000 }
};

export class GardenService {
  private static instance: GardenService;

  private constructor() {}

  public static getInstance(): GardenService {
    if (!GardenService.instance) {
      GardenService.instance = new GardenService();
    }
    return GardenService.instance;
  }

  private getStorageKey(address: string): string {
    return `garden_${address.toLowerCase()}`;
  }

  private getInitialGardenData(): GardenData {
    return {
      stage: 'Seed',
      lastWatered: new Date().toISOString(),
      health: 100,
      experience: 0,
      level: 1,
      streak: 0
    };
  }

  private calculateStage(experience: number): GardenStage {
    if (experience >= STAGE_THRESHOLDS.Garden.min) return 'Garden';
    if (experience >= STAGE_THRESHOLDS.Tree.min) return 'Tree';
    if (experience >= STAGE_THRESHOLDS.Plant.min) return 'Plant';
    if (experience >= STAGE_THRESHOLDS.Sprout.min) return 'Sprout';
    if (experience >= STAGE_THRESHOLDS.Seedling.min) return 'Seedling';
    return 'Seed';
  }

  public getGardenData(address: string): GardenData {
    if (typeof window === 'undefined') return this.getInitialGardenData();

    const savedData = localStorage.getItem(this.getStorageKey(address));
    if (!savedData) {
      const initialData = this.getInitialGardenData();
      localStorage.setItem(this.getStorageKey(address), JSON.stringify(initialData));
      return initialData;
    }

    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error('Error parsing garden data:', e);
      return this.getInitialGardenData();
    }
  }

  public waterGarden(address: string): GardenData {
    const garden = this.getGardenData(address);
    const lastWatered = new Date(garden.lastWatered);
    const now = new Date();
    
    // Can only water once every 12 hours
    if (now.getTime() - lastWatered.getTime() < 12 * 60 * 60 * 1000) {
      return garden;
    }

    const updatedGarden: GardenData = {
      ...garden,
      lastWatered: now.toISOString(),
      health: Math.min(100, garden.health + 20),
      experience: garden.experience + 50,
      level: Math.floor((garden.experience + 50) / 100) + 1,
    };

    updatedGarden.stage = this.calculateStage(updatedGarden.experience);

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.getStorageKey(address), JSON.stringify(updatedGarden));
    }

    return updatedGarden;
  }

  public getNextStageInfo(address: string) {
    const garden = this.getGardenData(address);
    const currentStage = STAGE_THRESHOLDS[garden.stage];
    const nextStages: GardenStage[] = ['Seed', 'Seedling', 'Sprout', 'Plant', 'Tree', 'Garden'];
    const currentIndex = nextStages.indexOf(garden.stage);
    
    if (currentIndex === nextStages.length - 1) {
      return {
        nextStage: null,
        percentToNext: 100,
        experienceToNext: 0
      };
    }

    const nextStage = nextStages[currentIndex + 1];
    const nextStageThreshold = STAGE_THRESHOLDS[nextStage].min;
    const experienceToNext = nextStageThreshold - garden.experience;
    const totalExperienceNeeded = nextStageThreshold - currentStage.min;
    const currentProgress = garden.experience - currentStage.min;
    const percentToNext = (currentProgress / totalExperienceNeeded) * 100;

    return {
      nextStage,
      percentToNext: Math.min(100, Math.max(0, percentToNext)),
      experienceToNext
    };
  }

  public canWater(address: string): boolean {
    const garden = this.getGardenData(address);
    const lastWatered = new Date(garden.lastWatered);
    const now = new Date();
    return now.getTime() - lastWatered.getTime() >= 12 * 60 * 60 * 1000;
  }

  public getTimeUntilNextWater(address: string): number {
    const garden = this.getGardenData(address);
    const lastWatered = new Date(garden.lastWatered);
    const now = new Date();
    const timeSinceLastWater = now.getTime() - lastWatered.getTime();
    const waitTime = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    return Math.max(0, waitTime - timeSinceLastWater);
  }
} 