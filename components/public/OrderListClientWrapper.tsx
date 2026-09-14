"use client";

import React from "react";
import { OrderListProvider } from "@/context/OrderListContext";
import { DEFAULT_WHATSAPP_NUMBER } from "@/lib/services/whatsapp-message.service";
import OrderListFloatingBadge from "./OrderListFloatingBadge";
import OrderListDrawer from "./OrderListDrawer";

interface OrderListClientWrapperProps {
  readonly children: React.ReactNode;
  readonly whatsappNumber?: string;
}

export default function OrderListClientWrapper({
  children,
  whatsappNumber = DEFAULT_WHATSAPP_NUMBER,
}: OrderListClientWrapperProps) {
  return (
    <OrderListProvider>
      {children}
      <OrderListFloatingBadge />
      <OrderListDrawer whatsappNumber={whatsappNumber} />
    </OrderListProvider>
  );
}
