"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { OrderItem } from "@/lib/types/order-list";

const STORAGE_KEY = "joglo_order_list_v1";

interface OrderListContextType {
  items: OrderItem[];
  addItem: (item: Omit<OrderItem, "id" | "addedAt">) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  totalCount: number;
  totalAmount: number;
}

const OrderListContext = createContext<OrderListContextType | undefined>(undefined);

function getInitialItems(): OrderItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage parse errors
  }
  return [];
}

export function OrderListProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [items, setItems] = useState<OrderItem[]>(getInitialItems);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync to localStorage on item state change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota/storage errors
    }
  }, [items]);

  const addItem = React.useCallback(
    (newItem: Omit<OrderItem, "id" | "addedAt">) => {
      const uniqueId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${items.length + 1}`;

      const item: OrderItem = {
        ...newItem,
        id: uniqueId,
        addedAt: Date.now(),
      };
      setItems((prev) => [...prev, item]);
    },
    [items.length]
  );

  const removeItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const clearItems = React.useCallback(() => {
    setItems([]);
  }, []);

  const openDrawer = React.useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = React.useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = React.useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const totalCount = items.length;
  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (item.subtotal || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearItems,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      totalCount,
      totalAmount,
    }),
    [
      items,
      addItem,
      removeItem,
      clearItems,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      totalCount,
      totalAmount,
    ]
  );

  return (
    <OrderListContext.Provider value={value}>
      {children}
    </OrderListContext.Provider>
  );
}

export function useOrderList(): OrderListContextType {
  const context = useContext(OrderListContext);
  if (!context) {
    throw new Error("useOrderList must be used within an OrderListProvider");
  }
  return context;
}
