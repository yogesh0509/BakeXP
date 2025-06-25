import Link from "next/link";
import { navigationItems } from "@/lib/data";
import { Phone } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo size="md" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Handcrafted cakes and pastries made with love. Perfect for any occasion.
            </p>
          </div>
          <div>
            <h3 className="text-base font-medium mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BakeXP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
