import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { shouldBeAdmin, shouldBeUser } from "./middleware/auth";
import stripe from "./utils/stripe";
import sessionRouter from "./routes/sessionRoute";
import { cors } from "hono/cors";
import webhookRouter from "./routes/webhookRoute";
import { consumer, producer } from "./utils/kafka";
import { runKafkaSubscriptions } from "./utils/subscriptions";
import { rateLimiter } from "hono-rate-limiter";
import { secureHeaders } from "hono/secure-headers";

import { logger } from "hono/logger";
const app = new Hono();
app.use("*", logger());
app.use("*", secureHeaders());

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  keyGenerator: (c) => c.req.header("x-forwarded-for") || "",
});

app.use("*", limiter);
app.use("*", clerkMiddleware());

app.use(
  "*",
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3002",
      "http://localhost:3003",
    ],
  }),
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.get("/health", (c) => {
  return c.json({ status: "ok", uptime: process.uptime() });
});

app.get("/test", shouldBeUser, async (c) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({
      message: "You are not logged in.",
    });
  }

  return c.json({
    message: "You are logged in!",
    userId: auth.userId,
  });
});

// Example of using the shouldBeUser middleware
app.get("/protected", shouldBeAdmin, async (c) => {
  const auth = getAuth(c);

  return c.json({
    message: "This is a protected route!",
    userId: auth?.userId,
  });
});

// app.post("/create-stripe-product", shouldBeUser, async (c) => {
//   const res = await stripe.products.create({
//     name: "Test Product",
//     description: "Test Product Description",
//     default_price_data: {
//       currency: "usd",
//       unit_amount: 10 * 100,
//     },
//   });
//   return c.json(res);
// });

const start = async () => {
  try {
    Promise.all([consumer.connect(), producer.connect()]);
    await runKafkaSubscriptions();
    serve(
      {
        fetch: app.fetch,
        port: 8002,
        hostname: "0.0.0.0",
      },
      (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
      },
    );
  } catch (error) {
    console.log(error);
  }
};

start();

app.route("/session", sessionRouter);
app.route("/webhooks", webhookRouter);
