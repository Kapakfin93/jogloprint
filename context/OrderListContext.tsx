"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useSyncExternalStore,
  useCallback,
} from "react";
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

const listeners = new Set<() => void>();
function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedRaw: string | null = null;
let cachedItems: OrderItem[] = [];

function getSnapshot(): OrderItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || "[]";
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const parsed = JSON.parse(raw);
      cachedItems = Array.isArray(parsed) ? parsed : [];
    }
    return cachedItems;
  } catch {
    return cachedItems;
  }
}

const SERVER_EMPTY_ITEMS: OrderItem[] = [];
function getServerSnapshot(): OrderItem[] {
  return SERVER_EMPTY_ITEMS;
}

function saveItemsToStorage(items: OrderItem[]) {
  try {
    const raw = JSON.stringify(items);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedItems = items;
    emitChange();
  } catch {
    // Ignore quota errors
  }
}

export function OrderListProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const addItem = useCallback(
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
      saveItemsToStorage([...items, item]);
    },
    [items]
  );

  const removeItem = useCallback(
    (id: string) => {
      saveItemsToStorage(items.filter((it) => it.id !== id));
    },
    [items]
  );

  const clearItems = useCallback(() => {
    saveItemsToStorage([]);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

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
