import { categories, Category } from "@/lib/data";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  readonly category: Category;
  readonly className?: string;
}

// Default color as fallback if a category doesn't have a color defined
const defaultColor = "bg-muted text-foreground border-muted";

// Create a mapping of category values to their colors
const getCategoryColor = (category: Category): string => {
  const categoryItem = categories.find(cat => cat.value === category);
  return categoryItem?.color ?? defaultColor;
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        getCategoryColor(category),
        className
      )}
    >
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}
