import { z } from "zod";

export type CustomJwtClaims = {
  metadata?: {
    role?: "user" | "admin";
  };
};

export interface UserType {
  id: string;
  avatar?: string;
  fullName?: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export const UserFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters!" })
    .max(50),
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters!" })
    .max(50),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters!" })
    .max(50),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters!" })
    .max(30),
  emailAddress: z
    .array(
      z
        .string({ message: "Invalid email address!" })
        .email({ message: "Invalid email address!" })
    )
    .min(1, { message: "At least one email address is required!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters!" }),
});
