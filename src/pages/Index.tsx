import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, Shield, Headphones, ArrowRight } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import smartphonesImg from "@/assets/products/smartphones.jpg";
import laptopsImg from "@/assets/products/laptops.jpg";
import headphonesImg from "@/assets/products/headphones.jpg";
import camerasImg from "@/assets/products/cameras.jpg";
import tvsImg from "@/assets/products/tvs.jpg";
import { ProductCard } from "@/components/ProductCard";
import { NFTCard } from "@/components/NFTCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProductsList, useProductCategories } from "@/hooks/useProducts";
import { useNFTsList } from "@/hooks/useNFTs";
import { apiProductToCartProduct, apiNFTToCardModel } from "@/types/commerce";
import { Skeleton } from "@/components/ui/skeleton";

const categoryFallbackImages = [smartphonesImg, laptopsImg, headphonesImg, camerasImg, tvsImg];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const trustBadges = [
  { icon: Truck, label: "Free Shipping", desc: "On orders over $99" },
  { icon: Shield, label: "Secure Checkout", desc: "256-bit SSL encryption" },
  { icon: Headphones, label: "Expert Support", desc: "24/7 dedicated team" },
];

const testimonials = [
  { name: "Sarah K.", text: "The quality of products and speed of delivery exceeded my expectations. Truly premium.", role: "Verified Buyer" },
  { name: "Marcus T.", text: "Found an amazing freelancer for my PCB design. The platform made it incredibly easy.", role: "Client" },
  { name: "Elena R.", text: "The NFT gallery is beautifully curated. Bought my first digital collectible here.", role: "Collector" },
];

function formatCategoryLabel(cat: string) {
  return cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Index() {
  const {
    data: featuredData,
    isLoading: productsLoading,
    isError: productsError,
    error: productsErrorDetail,
  } = useProductsList({
    featured: "true",
    limit: 4,
    page: 1,
  });
  const featuredProducts = featuredData?.products ?? [];

  const {
    data: catData,
    isLoading: catLoading,
    isError: categoriesError,
    error: categoriesErrorDetail,
  } = useProductCategories();
  const apiCategories = catData?.categories ?? [];

  const {
    data: nfts = [],
    isLoading: nftsLoading,
    isError: nftsError,
    error: nftsErrorDetail,
  } = useNFTsList();
  const featuredNFTs = nfts.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="relative overflow-hidden">
        <div className="section-padding py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="flex-1 max-w-xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Tech. Services.
              <br />
              Digital Art.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              One platform for premium products, expert freelancers, and curated NFT collections.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/nft"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Explore NFTs
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <img
              src={heroBanner}
              alt="Premium tech products floating in space"
              width={1920}
              height={960}
              className="w-full rounded-2xl"
            />
          </motion.div>
        </div>
      </section>

      <section className="section-padding py-20 bg-secondary/30">
        <motion.h2
          className="font-display text-2xl md:text-3xl font-bold text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          Shop by Category
        </motion.h2>
        {catLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : categoriesError ? (
          <p className="text-sm text-destructive text-center">
            {(categoriesErrorDetail as Error)?.message || "Could not load categories."}
          </p>
        ) : apiCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {apiCategories.slice(0, 10).map((cat, i) => (
              <motion.div
                key={cat}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(cat)}`}
                  className="group block rounded-xl overflow-hidden border border-border bg-card card-hover"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={categoryFallbackImages[i % categoryFallbackImages.length]}
                      alt={formatCategoryLabel(cat)}
                      loading="lazy"
                      width={400}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-display text-sm font-semibold">{formatCategoryLabel(cat)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">No product categories available yet.</p>
        )}
      </section>

      <section className="section-padding py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Featured Products</h2>
          <Link to="/shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : productsError ? (
          <p className="text-sm text-destructive">
            {(productsErrorDetail as Error)?.message || "Could not load featured products."}
          </p>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id || product._id} product={apiProductToCartProduct(product)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No featured products available yet.</p>
        )}
      </section>

      <section className="section-padding py-16 border-y border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustBadges.map((badge, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <badge.icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold">{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="nft-section">
        <div className="section-padding py-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-nft-text">NFT Gallery</h2>
              <p className="text-sm text-nft-muted mt-2">Curated digital collectibles</p>
            </div>
            <Link to="/nft" className="text-sm font-medium text-nft-muted hover:text-nft-text transition-colors flex items-center gap-1">
              View Gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {nftsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl bg-nft-card" />
              ))}
            </div>
          ) : nftsError ? (
            <p className="text-sm text-destructive">
              {(nftsErrorDetail as Error)?.message || "Could not load NFTs."}
            </p>
          ) : featuredNFTs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNFTs.map((nft) => (
                <NFTCard key={String(nft._id)} nft={apiNFTToCardModel(nft)} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-nft-muted">No NFTs available yet.</p>
          )}
        </div>
      </section>

      <section className="section-padding py-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="font-display text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
