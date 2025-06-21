"use client"

import { useEffect, useRef } from "react";
import { Checkout } from "@freemius/checkout";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type PlanConfig = {
  productId: number;
  planId: number;
  publicKey: string;
  image: string;
};

export const useFreemiusCheckout = (config: PlanConfig) => {
  const checkoutRef = useRef<Checkout | null>(null);
  const storePurchase = useMutation(api.subscriptions.storePurchase);

  useEffect(() => {
    if (!checkoutRef.current) {
      checkoutRef.current = new Checkout({
        product_id: config.productId,
        plan_id: config.planId,
        public_key: config.publicKey,
        image: config.image,
      });
    }

  }, [config]);

  const openCheckout = () => {
    checkoutRef.current?.open({
      name: "Panda",
      licenses: 1,
      purchaseCompleted: async (response: any) => {
        console.log("✅ Purchase completed:", response);
        
        try {
          // Store the raw purchase response in Convex
          const subscriptionId = await storePurchase({ purchase: response });
          console.log("🎉 Purchase data stored in Convex:", subscriptionId);
          
          // You can add additional success handling here
          // e.g., redirect to dashboard, show success message, etc.
        } catch (error) {
          console.error("❌ Failed to store purchase data:", error);
          // Handle error - maybe show a toast notification
        }
      },
      success: (response: any) => {
        console.log("🎉 Checkout closed after successful purchase:", response);
      },
      cancel: () => {
        console.log("❌ Checkout cancelled by user");
      },
    });
  };

  return { openCheckout };
};