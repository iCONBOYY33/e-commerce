import { createMiddleware } from "hono/factory";
import { getAuth } from "@hono/clerk-auth";
import { CustomJwtClaims } from "@repo/types";

const userRole = {
  user: "user",
  admin: "admin",
};

export const shouldBeUser = createMiddleware<{ Variables: { userId: string } }>(
  async (c, next) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json(
        {
          error: "Unauthorized",
          message: "You must be logged in to access this resource.",
        },
        401
      );
    }

    // User is authenticated, continue to the next handler
    c.set("userId", auth.userId);

    await next();
  }
);

export const shouldBeAdmin = createMiddleware<{
  Variables: { userId: string };
}>(async (c, next) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json(
      {
        error: "Unauthorized",
        message: "You must be logged in to access this resource.",
      },
      401
    );
  }
  const seesionClaims = auth.sessionClaims as CustomJwtClaims;

  if (seesionClaims.metadata?.role !== userRole.admin) {
    return c.json(
      {
        error: "Unauthorized",
        message: "You must be an admin to access this resource.",
      },
      401
    );
  }

  c.set("userId", auth.userId);

  // User is authenticated, continue to the next handler
  await next();
});
