import { useEffect, useRef } from "react";
import { Checkout } from "@freemius/checkout";

type PlanConfig = {
  productId: number;
  planId: number;
  publicKey: string;
  image: string;
};

export const useFreemiusCheckout = (config: PlanConfig) => {
  const checkoutRef = useRef<any>(null);

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
      purchaseCompleted: (response: any) => {
        console.log("✅ Purchase completed:", response);
        // You can add additional success handling here
        // e.g., redirect to dashboard, show success message, etc.
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