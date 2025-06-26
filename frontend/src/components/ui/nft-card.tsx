"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Badge } from './badge';

interface NFTCardProps {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  rewardXP: bigint;
  mintedAt: number;
  tokenId?: bigint;
  className?: string;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  id,
  name,
  description,
  imageUrl,
  rewardXP,
  mintedAt,
  tokenId,
  className = ""
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMilestoneEmoji = (name: string) => {
    if (name.toLowerCase().includes('first')) return '🍰';
    if (name.toLowerCase().includes('week') || name.toLowerCase().includes('streak')) return '🔥';
    if (name.toLowerCase().includes('xp') || name.toLowerCase().includes('hunter')) return '⭐';
    if (name.toLowerCase().includes('pod') || name.toLowerCase().includes('social')) return '👥';
    if (name.toLowerCase().includes('century') || name.toLowerCase().includes('100')) return '💯';
    if (name.toLowerCase().includes('level') || name.toLowerCase().includes('master')) return '👑';
    if (name.toLowerCase().includes('legend')) return '🏆';
    return '🎖️';
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            #{id}
          </Badge>
          {tokenId && (
            <Badge variant="outline" className="text-xs">
              Token #{tokenId.toString()}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* NFT Image */}
        <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-6xl">
              {getMilestoneEmoji(name)}
            </div>
          )}
        </div>

        {/* NFT Details */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-600">⚡</span>
              <span className="font-medium">{rewardXP.toString()} XP</span>
            </div>
            <span className="text-gray-500">
              {formatDate(mintedAt)}
            </span>
          </div>
        </div>

        {/* Rarity Indicator */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <Badge 
              variant={
                Number(rewardXP) >= 1000 ? "default" :
                Number(rewardXP) >= 500 ? "secondary" : "outline"
              }
              className="text-xs"
            >
              {Number(rewardXP) >= 1000 ? "Legendary" :
               Number(rewardXP) >= 500 ? "Rare" : "Common"}
            </Badge>
            <span className="text-xs text-gray-400">
              Milestone NFT
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 