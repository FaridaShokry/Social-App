import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters"),
    username: z
      .string()
      .trim()
      .max(30, "Username is too long")
      .regex(/^[a-zA-Z0-9_.]*$/, "Only letters, numbers, _ and . are allowed"), // empty = optional
    email: z.email("Enter a valid email address"),
    gender: z.string().min(1, "Please select your gender"),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((v) => new Date(v) < new Date(), "Date must be in the past"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[a-z]/, "Add at least one lowercase letter")
      .regex(/\d/, "Add at least one number"),
    rePassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;