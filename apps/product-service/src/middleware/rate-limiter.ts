import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "../utils/redis";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable legacy headers
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  store: new RedisStore({
    // @ts-expect-error - ioredis types compatible with sendCommand
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute for sensitive endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message:
      "Sensitive endpoint rate limit exceeded. Please try again in a minute.",
  },
  store: new RedisStore({
    // @ts-expect-error - ioredis types compatible with sendCommand
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});
