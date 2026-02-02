import { Hono } from "hono";
import stripe from "../utils/stripe";
import Stripe from "stripe";
import { shouldBeUser } from "../middleware/auth";
import { CartItemType } from "@repo/types";
import { getStripeProduct } from "../utils/stripeProduct";
const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  const { cart }: { cart: CartItemType[] } = await c.req.json();

  const userId = c.get("userId");
  const lineItems = await Promise.all(
    cart.map(async (item) => {
      const product = await getStripeProduct(item.id);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
          },
          unit_amount:
            (product.default_price as Stripe.Price)?.unit_amount || 0,
        },

        quantity: item.quantity,
      };
    })
  );

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      client_reference_id: userId,

      mode: "payment",
      ui_mode: "custom",
      // The URL of your payment completion page
      return_url:
        "http://localhost:3003/return?session_id={CHECKOUT_SESSION_ID}",
    });

    return c.json({ checkoutSessionClientSecret: session.client_secret });
  } catch (error) {
    console.log(error);
    return c.json({ error: "Failed to create checkout session" }, 500);
  }
});

sessionRoute.get("/:session_id", async (c) => {
  const { session_id } = c.req.param();

  try {
    const session = await stripe.checkout.sessions.retrieve(
      session_id as string,
      { expand: ["line_items"] }
    );
    // console.log("sessionppp", session);
    return c.json({
      status: session.status,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    console.log(error);
    return c.json({ error: "Failed to retrieve checkout session" }, 500);
  }
});

export default sessionRoute;
