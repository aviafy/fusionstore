import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20 section-padding">
          <h1 className="font-display text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Browse our catalog and find something you love.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
          >
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="section-padding py-12 flex-1">
        <h1 className="font-display text-3xl font-bold mb-8">Cart</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items */}
          <div className="flex-1 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-4 rounded-xl border border-border bg-card p-4"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {product.brand}
                  </p>
                  <h3 className="font-display font-semibold text-sm truncate">
                    {product.name}
                  </h3>
                  <p className="font-display font-bold mt-1">
                    ${product.price.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 rounded-lg border border-border">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-2 hover:bg-secondary transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="p-2 hover:bg-secondary transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 shrink-0">
            <div className="rounded-xl border border-border bg-card p-6 sticky top-24">
              <h2 className="font-display font-semibold text-lg mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {total >= 99 ? "Free" : "$9.99"}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-display font-semibold">Total</span>
                  <span className="font-display font-bold text-lg">
                    ${(total + (total >= 99 ? 0 : 9.99)).toLocaleString()}
                  </span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-foreground py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
              >
                Checkout
              </Link>
              <Link
                to="/shop"
                className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
