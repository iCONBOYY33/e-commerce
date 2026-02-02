import { Hono } from "hono";
import stripe from "../utils/stripe";
import Stripe from "stripe";
import { producer } from "../utils/kafka";

const webhookRouter = new Hono();
const webhookSecret = process.env.WEBHOOK_SECRET as string;

webhookRouter.post("/stripe", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("stripe-signature");
  console.log("webhook signature", signature);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (error) {
    return c.json({ error: "Invalid signature" }, 400);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );
      console.log("webhook received", session);
      console.log("Line items", lineItems);

      // TODO: create order
      producer.send("payment.successful", {
        value: {
          userId: session.client_reference_id,
          email: session.customer_details?.email,
          amount: session.amount_total,
          status: session.payment_status === "paid" ? "success" : "failed",
          products: lineItems.data.map((item) => {
            return {
              name: item.description,
              price: item.price?.unit_amount,
              quantity: item.quantity,
              address: session.customer_details?.address,
            };
          }),
        },
      });
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }
  return c.json({ received: true });
});

export default webhookRouter;
