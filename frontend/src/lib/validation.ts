import { z } from "zod";

/**
 * Client-side validation schemas. These mirror (but do not replace) the
 * backend's authoritative validation in app/lib_validation.py and the
 * Pydantic schemas — the server is always the source of truth; these exist
 * purely for fast inline form feedback.
 */

export const phoneSchema = z
  .string()
  .min(7, "Enter a valid phone number")
  .regex(/^\+?[0-9\s\-().]{7,20}$/, "Enter a valid phone number");

export const emailSchema = z.string().email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Must be at least 8 characters")
  .regex(/[A-Za-z]/, "Must contain at least one letter")
  .regex(/[0-9]/, "Must contain at least one number");

export const registerSchema = z
  .object({
    email: emailSchema.optional().or(z.literal("")),
    phone: phoneSchema.optional().or(z.literal("")),
    password: passwordSchema.optional().or(z.literal("")),
    business_name: z.string().min(1, "Business name is required").max(255),
  })
  .refine((data) => data.email || data.phone, {
    message: "Enter an email or phone number",
    path: ["email"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  address: z.string().max(1000).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const quoteItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(200),
  category: z.enum(["labor", "material", "callout", "other"]),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unit_price: z.coerce.number().min(0, "Unit price cannot be negative"),
});

export const jobDescriptionSchema = z
  .string()
  .min(3, "Describe the job in a few words")
  .max(4000, "Description is too long");

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type CustomerFormValues = z.infer<typeof customerSchema>;
export type QuoteItemFormValues = z.infer<typeof quoteItemSchema>;
