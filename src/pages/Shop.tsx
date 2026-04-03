import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSearchParams } from "react-router-dom";
import { useProductsList, useProductCategories } from "@/hooks/useProducts";
import { apiProductToCartProduct } from "@/types/commerce";
import { Skeleton } from "@/components/ui/skeleton";

const priceRanges = [
  { label: "All Prices", min: undefined as number | undefined, max: undefined as number | undefined },
  { label: "Under $500", min: undefined, max: 500 },
  { label: "$500 – $1,000", min: 500, max: 1000 },
  { label: "$1,000 – $2,000", min: 1000, max: 2000 },
  { label: "Over $2,000", min: 2000, max: undefined },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  const [priceRange, setPriceRange] = useState(0);

  const { data: catData } = useProductCategories();
  const categories = catData?.categories ?? [];

  const listQuery = useMemo(() => {
    const pr = priceRanges[priceRange];
    const q: Record<string, string | number> = { limit: 100, page: 1 };
    if (activeCategory !== "all") {
      q.category = activeCategory;
    }
    if (searchQuery.trim()) {
      q.search = searchQuery.trim();
    }
    if (pr.min !== undefined) q.minPrice = pr.min;
    if (pr.max !== undefined) q.maxPrice = pr.max;
    return q;
  }, [activeCategory, priceRange, searchQuery]);

  const { data, isLoading, isError, error } = useProductsList(listQuery);
  const products = data?.products ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1">
        <h1 className="font-display text-3xl font-bold mb-8">Shop</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 shrink-0 space-y-8">
            <div>
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Category
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setSearchParams({})}
                    className={`text-sm transition-colors ${
                      activeCategory === "all" ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => setSearchParams({ category: cat })}
                      className={`text-sm transition-colors text-left w-full ${
                        activeCategory === cat ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Price
              </h3>
              <ul className="space-y-2">
                {priceRanges.map((range, i) => (
                  <li key={range.label}>
                    <button
                      type="button"
                      onClick={() => setPriceRange(i)}
                      className={`text-sm transition-colors ${
                        priceRange === i ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {range.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1">
            {isError && (
              <p className="text-sm text-destructive mb-4">
                {(error as Error)?.message || "Could not load products."}
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              {isLoading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id || p._id} product={apiProductToCartProduct(p)} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-muted-foreground">No products match your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
