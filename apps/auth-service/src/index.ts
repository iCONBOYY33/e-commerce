import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route";
import { clerkMiddleware } from "@clerk/express";
import helmet from "helmet";
import morgan from "morgan";
import { producer } from "./utils/kafka";

import { globalLimiter } from "./middleware/rate-limiter";
const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(morgan("dev"));
app.use(globalLimiter);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3002",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(clerkMiddleware());

app.use("/users", userRouter);
const start = async () => {
  try {
    await producer.connect();
    await app.listen(8004, "0.0.0.0");
    console.log("Server is running on port 8004");
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

start();
