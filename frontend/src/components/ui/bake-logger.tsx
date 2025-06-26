"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { ImageUpload } from './image-upload';
import { useContracts } from '@/hooks/useContracts';

interface BakeLoggerProps {
  onBakeLogged?: (bakeId: string) => void;
  className?: string;
}

export const BakeLogger: React.FC<BakeLoggerProps> = ({ 
  onBakeLogged, 
  className = "" 
}) => {
  const { logBakeWithRewards, checkAndMintMilestones, isConnected, address } = useContracts();
  
  const [isLogging, setIsLogging] = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageData, setImageData] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newMilestones, setNewMilestones] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageSelect = (data: string, file: File) => {
    setImageData(data);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!description.trim()) {
      alert('Please add a description for your bake');
      return;
    }

    setIsLogging(true);
    setNewMilestones([]);
    
    try {
      // 1. Log the bake and earn rewards through contract
      const bakeResult = await logBakeWithRewards();
      
      if (!bakeResult) {
        throw new Error('Failed to log bake on blockchain');
      }

      // 2. Store bake data locally (including image)
      const bakeId = `bake-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const bakeEntry = {
        id: bakeId,
        timestamp: Date.now(),
        description: description.trim(),
        imageUrl: imageData,
        xpEarned: 25, // Standard XP per bake
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      // Save to localStorage
      const historyKey = `bakexp_history_${address}`;
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const updatedHistory = [bakeEntry, ...existingHistory];
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

      // 3. Check for new milestone NFTs
      const milestoneResult = await checkAndMintMilestones();
      if (milestoneResult) {
        // In a real implementation, you'd check which specific milestones were minted
        setNewMilestones(['New milestone unlocked!']);
      }

      // 4. Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // 5. Reset form
      setDescription('');
      setTags('');
      setImageData('');
      setSelectedFile(null);

      // 6. Notify parent component
      onBakeLogged?.(bakeId);

    } catch (error) {
      console.error('Failed to log bake:', error);
      alert('Failed to log your bake. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setTags('');
    setImageData('');
    setSelectedFile(null);
    setNewMilestones([]);
    setShowSuccess(false);
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">🔒</div>
          <p className="text-gray-600">Connect your wallet to log your bakes and earn NFTs</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🍰 Log Your Bake
          <Badge variant="secondary">+25 XP</Badge>
        </CardTitle>
        <p className="text-gray-600">
          Share your baking creation and earn XP + milestone NFTs!
        </p>
      </CardHeader>
      
      <CardContent>
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <span className="text-xl">🎉</span>
              <div>
                <p className="font-semibold">Bake logged successfully!</p>
                <p className="text-sm">You earned 25 XP for this bake.</p>
                {newMilestones.length > 0 && (
                  <p className="text-sm font-medium">🏆 New milestone NFT unlocked!</p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo of Your Bake
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              maxSize={5}
              preview={true}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              placeholder="Tell us about what you baked today..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <Input
              placeholder="bread, sourdough, weekend baking (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              Add tags to categorize your bake
            </p>
          </div>

          {/* XP Preview */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Rewards for this bake:</h4>
            <div className="space-y-1 text-sm text-purple-800">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>+25 XP (Base reward)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔥</span>
                <span>Streak bonus (if consecutive day)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏆</span>
                <span>Potential milestone NFT unlock</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLogging || !description.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isLogging ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging Bake...</span>
                </div>
              ) : (
                'Log My Bake & Earn Rewards'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLogging}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 