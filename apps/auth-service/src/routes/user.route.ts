import { Router } from "express";
import { shouldBeAdmin } from "../middleware/auth";
import { clerkClient } from "@clerk/express";

import { producer } from "../utils/kafka";

const router: Router = Router();

router.get("/", shouldBeAdmin, async (req, res) => {
  const usersResponse = await clerkClient.users.getUserList();
  const mappedUsers = usersResponse.data.map((user) => ({
    id: user.id,
    avatar: user.imageUrl,
    fullName:
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.username ||
      "Unknown",
    email: user.emailAddresses[0]?.emailAddress || "",
    role: (user.publicMetadata?.role as "user" | "admin") || "user",
    createdAt: new Date(user.createdAt).toISOString(),
  }));
  res.status(200).json(mappedUsers);
});

router.get("/:id", shouldBeAdmin, async (req, res) => {
  const { id } = req.params;
  const user = await clerkClient.users.getUser(id as string);
  const mappedUser = {
    id: user.id,
    avatar: user.imageUrl,
    fullName:
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.username ||
      "Unknown",
    email: user.emailAddresses[0]?.emailAddress || "",
    role: (user.publicMetadata?.role as "user" | "admin") || "user",
    createdAt: new Date(user.createdAt).toISOString(),
    phone: user.phoneNumbers[0]?.phoneNumber || "",
    address: user.locale,
  };
  res.status(200).json(mappedUser);
});

router.post("/", shouldBeAdmin, async (req, res) => {
  try {
    const { fullName, ...newUser } = req.body;
    const user = await clerkClient.users.createUser(newUser);
    await producer.send("user.created", {
      value: {
        username: user.username,
        email: user.emailAddresses[0]?.emailAddress,
      },
    });
    res.status(201).json(user);
  } catch (error: any) {
    console.error("Error creating user:", error);
    const message =
      error.errors?.[0]?.message || error.message || "Internal server error";
    res.status(error.status || 500).json({
      message,
      errors: error.errors,
    });
  }
});

router.delete("/:id", shouldBeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await clerkClient.users.deleteUser(id as string);
    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error deleting user:", error);
    const message =
      error.errors?.[0]?.message || error.message || "Internal server error";
    res.status(error.status || 500).json({
      message,
    });
  }
});

export default router;
