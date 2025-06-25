import { products, categories } from "@/lib/data";
import { Layout } from "@/components/layout/layout";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/components/ui/product-card";
import { Check } from "lucide-react";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<any>
}) {
  const resolvedSearchParams: { [key: string]: string | string[] | undefined } | undefined = searchParams ? await searchParams : undefined;
  // Filter products by category if provided in the URL
  const categoryFilter = resolvedSearchParams?.category;
  const filteredProducts = (categoryFilter ? products.filter((product) => product.category === categoryFilter) : products).slice().sort((a, b) => a.name.localeCompare(b.name));

  // Find the selected category info
  const selectedCategory = categoryFilter
    ? categories.find((cat) => cat.value === categoryFilter)
    : null;

  return (
    <Layout>
      <Section
        title={selectedCategory ? `${selectedCategory.name}` : "Our Products"}
        description={
          selectedCategory
            ? selectedCategory.description
            : "Explore our delicious range of handcrafted cakes and pastries"
        }
      >
        {/* Cake-themed notice */}
        <div className="mb-6">
          <div className="rounded-lg border border-accent-blue bg-accent-blue/20 p-4 flex flex-col sm:flex-row items-center gap-3 shadow-sm text-center sm:text-left">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4m0 0C7.582 4 4 7.582 4 12s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 0v4m0 4h.01" /></svg>
            <span className="text-sm text-foreground-strong font-semibold">
              The product images show cakes with special decorations.<br />
              Decoration charges are extra—please confirm the cost on call or WhatsApp.
            </span>
          </div>
        </div>
        {/* Category filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <a
              href="/products"
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors border ${
                !categoryFilter
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted hover:bg-muted/80 border-transparent"
              }`}
            >
              {!categoryFilter && <Check className="mr-1 h-4 w-4" />}
              All Products
            </a>
            {categories.map((category) => (
              <a
                key={category.value}
                href={`/products?category=${category.value}`}
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors border ${
                  categoryFilter === category.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted hover:bg-muted/80 border-transparent"
                }`}
              >
                {categoryFilter === category.value && <Check className="mr-1 h-4 w-4" />}
                {category.name}
              </a>
            ))}
          </div>
        </div>

        {/* Products grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </Section>
    </Layout>
  );
}
