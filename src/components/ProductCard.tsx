import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import type { CartProduct } from "@/types/commerce";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface ProductCardProps {
  product: CartProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="group card-hover rounded-xl border border-border bg-card overflow-hidden">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-secondary/50">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={800}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {product.brand}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display font-semibold text-sm leading-tight mb-2 hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
          <span className="text-xs font-medium">{product.rating}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold">
            ${product.price.toLocaleString()}
          </span>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.inStock ? "Add" : "Sold Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
