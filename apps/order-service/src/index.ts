import fastify from "fastify";
import cors from "@fastify/cors";
import { clerkPlugin, clerkClient, getAuth } from "@clerk/fastify";
import { shouldBeAdmin, shouldBeUser } from "./middleware/auth";
import { orderRoute } from "./routes/order";
import { connectOrderDb } from "@repo/order-db";
import { consumer, producer } from "./utils/kafka";
import { runKafkaSubscriptions } from "./utils/subscreption";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import redis from "./utils/redis";

const app = fastify({
  logger: true,
  trustProxy: true,
});

app.register(helmet);
app.register(rateLimit, {
  max: 100,
  timeWindow: "15 minutes",
  redis: redis,
});

app.register(clerkPlugin);
app.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3002",
    "http://localhost:3003",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
});

const startServer = async () => {
  try {
    await Promise.all([
      connectOrderDb(),
      consumer.connect(),
      producer.connect(),
    ]);
    runKafkaSubscriptions();
    await app.listen({ port: 8001, host: "0.0.0.0" });
    console.log("Server is running on port 8001");
  } catch (error) {
    console.log(error);
  }
};

startServer();

app.get("/test", async (req, res) => {
  try {
    const { isAuthenticated, userId } = getAuth(req);

    if (!isAuthenticated) {
      return res.code(401).send({ error: "User not authenticated" });
    }

    const user = await clerkClient.users.getUser(userId);

    return res.send({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.code(500).send({ error: "Failed to retrieve user" });
  }
});

app.get("/health", { preHandler: shouldBeAdmin }, async (req, res) => {
  return res.send({
    status: "ok",
    uptime: process.uptime(),
    userId: req.userId,
  });
});

app.register(orderRoute);
