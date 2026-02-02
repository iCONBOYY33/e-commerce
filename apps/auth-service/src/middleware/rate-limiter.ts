import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "../utils/redis";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again later.",
  },
  store: new RedisStore({
    // @ts-expect-error - ioredis types compatible
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 failed attempts/requests per hour for sensitive auth ops
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many authentication attempts, please try again in an hour.",
  },
  store: new RedisStore({
    // @ts-expect-error - ioredis types compatible
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});
