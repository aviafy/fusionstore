import type { CartProduct } from "@/types/commerce";

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

let cartItems: CartItem[] = [];
let listeners: Array<() => void> = [];

function emit() {
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return cartItems;
  },
  addItem(product: CartProduct) {
    const existing = cartItems.find((i) => i.product.id === product.id);
    if (existing) {
      cartItems = cartItems.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      cartItems = [...cartItems, { product, quantity: 1 }];
    }
    emit();
  },
  removeItem(productId: string) {
    cartItems = cartItems.filter((i) => i.product.id !== productId);
    emit();
  },
  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      cartStore.removeItem(productId);
      return;
    }
    cartItems = cartItems.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    emit();
  },
  clear() {
    if (cartItems.length === 0) return;
    cartItems = [];
    emit();
  },
  getTotal() {
    return cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  },
  getCount() {
    return cartItems.reduce((sum, i) => sum + i.quantity, 0);
  },
};
