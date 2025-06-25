import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly title?: string;
  readonly description?: string;
}

export function Section({ children, className, title, description }: SectionProps) {
  return (
    <section className={cn("py-14 md:py-20", className)}>
      <div className="container w-full">
        {(title || description) && (
          <div className="mx-auto mb-12 md:mb-16 max-w-[800px] text-center">
            {title && <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground-strong">{title}</h2>}
            {description && (
              <p className="mt-5 text-lg text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
