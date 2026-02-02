import { getAuth } from "@clerk/fastify";
import { FastifyReply } from "fastify/types/reply";
import { FastifyRequest } from "fastify/types/request";
import { CustomJwtClaims } from "@repo/types";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}
export const shouldBeUser = async (req: FastifyRequest, res: FastifyReply) => {
  const auth = getAuth(req);

  if (!auth?.userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const sessionClaims = auth.sessionClaims as CustomJwtClaims;

  if (sessionClaims.metadata?.role !== "user") {
    return res.status(401).send({ error: "Unauthorized" });
  }

  req.userId = auth.userId;
  // Authentication successful - don't send response, let the route handler continue
};

export const shouldBeAdmin = async (req: FastifyRequest, res: FastifyReply) => {
  const auth = getAuth(req);

  if (!auth?.userId) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const sessionClaims = auth.sessionClaims as CustomJwtClaims;

  if (sessionClaims.metadata?.role !== "admin") {
    return res.status(401).send({ error: "Unauthorized you should be admin " });
  }

  req.userId = auth.userId;
  // Authentication successful - don't send response, let the route handler continue
};
