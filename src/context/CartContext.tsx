// src/context/CartContext.tsx
import React, { createContext, useContext, useState } from "react";
import { InventoryItem } from "../types/inventory";

// Define the shape of an item inside the cart
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  // Fix 1: Allow adding InventoryItem OR CartItem
  addToCart: (item: InventoryItem | CartItem, qty: number) => void;
  // Fix 2: Add the missing function definition
  decreaseCartQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: any) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: InventoryItem | CartItem, qty: number) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);

      if (exists) {
        // Update existing item quantity
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + qty } : c
        );
      }

      // Add new item
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          // Handle price safely for both types
          price: item.price ?? 0,
          quantity: qty,
        },
      ];
    });
  };

  // NEW: Safely decrease quantity without "flicker"
  const decreaseCartQuantity = (id: string) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // Remove item if quantity hits 0
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decreaseCartQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};