import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  readonly className?: string;
  readonly showText?: boolean;
  readonly size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { container: "h-8", image: 32, text: "text-lg" },
    md: { container: "h-10", image: 40, text: "text-xl" },
    lg: { container: "h-12", image: 48, text: "text-2xl" },
  };

  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <Image
        src="/images/logo.png"
        alt="BakeXP Logo"
        width={sizes[size].image}
        height={sizes[size].image}
        className="object-contain"
        priority
      />
      {showText && (
        <span className={cn("font-script text-primary", sizes[size].text)}>
          BakeXP
        </span>
      )}
    </Link>
  );
}
