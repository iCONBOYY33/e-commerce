import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { clerkMiddleware, getAuth } from "@clerk/express";
import helmet from "helmet";
import morgan from "morgan";
import { shouldBeAdmin, shouldBeUser } from "./middleware/auth";

import productRouter from "./routes/product.route";
import categoryRouter from "./routes/category.route";
import { consumer, producer } from "./utils/kafka";
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
      "http://localhost:3003",
    ],
    credentials: true,
  }),
);
app.use(clerkMiddleware());
app.use(express.json({ limit: "10kb" }));

app.get("/test", shouldBeUser, (req, res) => {});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/health", shouldBeAdmin, (req, res) => {
  return res
    .status(200)
    .json({ status: "ok", uptime: process.uptime(), userId: req.userId });
});

const start = async () => {
  try {
    await Promise.all([consumer.connect(), producer.connect()]);
    app.listen(8000, "0.0.0.0", () => {
      console.log("Server is running on port 8000");
    });
  } catch (error) {
    console.log(error);
  }
};

start();

app.use("/products", productRouter);
app.use("/categories", categoryRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});
