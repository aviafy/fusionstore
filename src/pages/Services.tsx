import { useMemo, useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useFreelancerServicesList } from "@/hooks/useFreelancerServices";
import { apiServiceToCardModel } from "@/types/commerce";
import { Skeleton } from "@/components/ui/skeleton";

export default function Services() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: services = [], isLoading, isError, error } = useFreelancerServicesList();

  const categories = useMemo(() => {
    const set = new Set(services.map((s) => s.category).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [services]);

  const filtered =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1">
        <h1 className="font-display text-3xl font-bold mb-2">Freelancer Services</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Expert digital services from verified professionals
        </p>

        <div className="flex flex-wrap gap-2 mb-10">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isError && (
          <p className="text-sm text-destructive mb-4">
            {(error as Error)?.message || "Could not load services."}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service) => (
              <ServiceCard key={String(service._id)} service={apiServiceToCardModel(service)} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
