import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import CheckoutForm from "./CheckoutForm";
import { CartItemsType } from "@repo/types";
import { useAuth } from "@clerk/nextjs";
import useCartStore from "@/stores/cartStore";
import { ShippingFormInputs } from "@repo/types";
const stripe = loadStripe(
  "pk_test_51SOfkYF8nV7ftYrBQhUO1sIOiS6aOwAd4fDiMSP7Mj8CRz7uiEoE7JtqlZRZhyEROI0n1AB9YkfWQwCdAv122gY000z72VDEw7",
);

const getClientSecret = async (
  token: string,
  cart: CartItemsType,
  email: string,
) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/session/create-checkout-session`;
    console.log("Fetching checkout session from:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cart,
        customerEmail: email,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Checkout session error:", response.status, errorText);
      throw new Error(
        `Failed to get client secret: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    console.log("Checkout session response:", data);

    if (!data.checkoutSessionClientSecret) {
      throw new Error("No client secret in response");
    }

    return data.checkoutSessionClientSecret;
  } catch (error) {
    console.error("getClientSecret error:", error);
    throw error;
  }
};

function StripePaymentForm({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) {
  const { getToken } = useAuth();
  const { cart } = useCartStore();
  const [clientSecret, setClientSecret] = useState<string | Promise<string>>(
    "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) return;
        const secret = await getClientSecret(token, cart, shippingForm?.email);
        setClientSecret(secret);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken, cart, shippingForm.email]);

  if (loading) return <div>Loading payment session...</div>;
  if (error) return <div className="text-red-500">sss{error}</div>;
  return (
    <CheckoutProvider stripe={stripe} options={{ clientSecret }}>
      <CheckoutForm shippingForm={shippingForm} />
    </CheckoutProvider>
  );
}

export default StripePaymentForm;
