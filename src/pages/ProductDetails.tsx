import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct, useSimilarProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { apiProductToCartProduct } from "@/types/commerce";
import { resolvePublicAssetUrl } from "@/lib/publicAssetUrl";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { submitProductRating, ApiError } from "@/services/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError, error } = useProduct(id);
  const { data: similar = [] } = useSimilarProducts(id);
  const { addItem } = useCart();
  const { user } = useAuth();
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingBusy, setRatingBusy] = useState(false);

  const handleRate = async () => {
    if (!user || !id) return;
    setRatingBusy(true);
    try {
      await submitProductRating(id, ratingVal);
      toast.success("Thanks for your rating!");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not submit rating");
    } finally {
      setRatingBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="section-padding py-12 flex-1">
          <Skeleton className="h-96 max-w-4xl mx-auto rounded-xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="section-padding py-20 flex-1 text-center">
          <p className="text-destructive mb-4">{(error as Error)?.message || "Product not found"}</p>
          <Button asChild variant="outline">
            <Link to="/shop">Back to shop</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const cartProduct = apiProductToCartProduct(product);
  const stock = typeof product.stock === "number" ? product.stock : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-10 flex-1">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <img
              src={resolvePublicAssetUrl(product.image)}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{product.brand || "Brand"}</p>
            <h1 className="font-display text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 fill-foreground text-foreground" />
              <span className="text-sm font-medium">{product.rating ?? 0}</span>
              {product.numReviews != null && (
                <span className="text-sm text-muted-foreground">({product.numReviews} reviews)</span>
              )}
            </div>
            <Badge variant="secondary" className="mb-4">
              {product.category}
            </Badge>
            <p className="font-display text-3xl font-bold mb-6">${product.price.toLocaleString()}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
            <p className="text-sm mb-6">
              <span className="text-muted-foreground">Stock: </span>
              <span className="font-medium">{stock > 0 ? `${stock} available` : "Out of stock"}</span>
            </p>
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2"
              disabled={stock <= 0}
              onClick={() => {
                addItem(cartProduct);
                toast.success(`${product.name} added to cart`);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </Button>

            {user && (
              <div className="mt-10 pt-10 border-t border-border space-y-3">
                <Label>Rate this product (1–5)</Label>
                <div className="flex gap-2 items-center flex-wrap">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={ratingVal}
                    onChange={(e) => setRatingVal(Number(e.target.value))}
                    className="w-24"
                  />
                  <Button type="button" variant="outline" onClick={handleRate} disabled={ratingBusy}>
                    Submit rating
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-20 max-w-6xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-8">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar
                .filter((p) => String(p._id || p.id) !== String(product._id || product.id))
                .slice(0, 3)
                .map((p) => (
                  <ProductCard key={p.id || p._id} product={apiProductToCartProduct(p)} />
                ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
