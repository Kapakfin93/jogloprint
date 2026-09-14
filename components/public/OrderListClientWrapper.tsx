"use client";

import React from "react";
import { OrderListProvider } from "@/context/OrderListContext";
import OrderListFloatingBadge from "./OrderListFloatingBadge";
import OrderListDrawer from "./OrderListDrawer";

interface OrderListClientWrapperProps {
  readonly children: React.ReactNode;
  readonly whatsappNumber?: string;
}

export default function OrderListClientWrapper({
  children,
  whatsappNumber = "6281390286826",
}: OrderListClientWrapperProps) {
  return (
    <OrderListProvider>
      {children}
      <OrderListFloatingBadge />
      <OrderListDrawer whatsappNumber={whatsappNumber} />
    </OrderListProvider>
  );
}
