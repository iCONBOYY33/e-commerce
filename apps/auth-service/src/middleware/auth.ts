import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";

import { CustomJwtClaims } from "@repo/types";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const shouldBeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = getAuth(req);
  const userId = auth.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log(userId);
  return next();
};

export const shouldBeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = getAuth(req);
  const userId = auth.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const sessionClaims = auth.sessionClaims as CustomJwtClaims;
  if (sessionClaims.metadata?.role !== "admin") {
    return res.status(403).json({ message: "you should be admin" });
  }

  console.log(userId);
  req.userId = userId;
  return next();
};
