import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HeroProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryAction?: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
}

export function Hero({
  title,
  description,
  children,
  className,
  imageSrc,
  imageAlt = "Hero image",
  primaryAction,
  secondaryAction,
}: Readonly<HeroProps>) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div className="container py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-display text-foreground-strong">
              {title}
            </h1>
            {description && (
              <p className="text-xl text-muted-foreground max-w-[600px]">
                {description}
              </p>
            )}
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-wrap gap-4 mt-4">
                {primaryAction && (
                  <Button asChild size="lg">
                    <a href={primaryAction.href}>{primaryAction.text}</a>
                  </Button>
                )}
                {secondaryAction && (
                  <Button asChild variant="outline" size="lg">
                    <a href={secondaryAction.href}>{secondaryAction.text}</a>
                  </Button>
                )}
              </div>
            )}
            {children}
          </div>
          {imageSrc && (
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-[3/2] rounded-lg overflow-hidden shadow-sm flex items-center justify-center p-4">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={400}
                height={400}
                className="object-contain max-h-full max-w-full"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
