"use client"

import Image from "next/image";
import { Product } from "@/types";
import { Clock, MessageCircle } from "lucide-react";
import { CategoryBadge } from "./category-badge";

interface ProductCardProps {
  readonly product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20">
      <div className="block overflow-hidden">
        <div className="aspect-square overflow-hidden">
          {product.images?.[0] ? (
            <div className="relative h-full w-full">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={product.featured}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <CategoryBadge category={product.category} />
          </div>
          {product.featured && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
              Featured
            </div>
          )}
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium text-lg leading-tight font-display">{product.name}</h3>
            <span className="font-medium text-primary font-display text-lg ml-2">
              {typeof product.price === 'number' ? `₹${product.price.toFixed(2)}` : product.price}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {product.description}
          </p>
          
          <div className="text-sm text-foreground-strong font-semibold mb-2">
            Quantity: {product.quantity}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.customizable && (
              <span className="text-xs bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full inline-flex items-center shadow-sm">
                Customizable
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-5 pt-0 text-foreground-strong">
        {product.seasonal && (
          <div className="text-xs text-primary font-medium mb-3">Seasonal item - Limited time only!</div>
        )}
        
        {/* WhatsApp Order Button */}
        <a 
          href={`https://wa.me/917979031093?text=${encodeURIComponent(
            `Hello! I would like to order:\n` +
            `*${product.name}*\n` +
            `Price: ₹${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}\n` +
            `Quantity: ${product.quantity}\n` +
            `Please confirm availability and decoration options.\n\n` +
            `${product.images?.[0] ? `Product image: https://thecakemakers.com${product.images[0]}` : ''}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full gap-2 bg-[#128C7E] hover:bg-[#075E54] text-white py-2 px-4 rounded-md font-medium transition-colors duration-300 mt-2"
        >
          <MessageCircle className="h-4 w-4" />
          Order on WhatsApp
        </a>
      </div>
    </div>
  );
}
