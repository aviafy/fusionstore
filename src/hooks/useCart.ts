import { useSyncExternalStore } from "react";
import { cartStore } from "@/data/cart";

export function useCart() {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot);
  return {
    items,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    updateQuantity: cartStore.updateQuantity,
    clear: cartStore.clear,
    total: items.reduce((s, i) => s + i.product.price * i.quantity, 0),
    count: items.reduce((s, i) => s + i.quantity, 0),
  };
}
