import { describe, expect, it } from "vitest";

import { customerSchema, loginSchema, quoteItemSchema } from "@/lib/validation";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("customerSchema", () => {
  it("accepts a valid customer with only required fields", () => {
    const result = customerSchema.safeParse({ name: "Jane Doe", phone: "+14155550132" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = customerSchema.safeParse({ name: "", phone: "+14155550132" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone number", () => {
    const result = customerSchema.safeParse({ name: "Jane Doe", phone: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("quoteItemSchema", () => {
  it("accepts a valid line item", () => {
    const result = quoteItemSchema.safeParse({
      description: "20A breaker",
      category: "material",
      quantity: 2,
      unit_price: 15.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a zero quantity", () => {
    const result = quoteItemSchema.safeParse({
      description: "20A breaker",
      category: "material",
      quantity: 0,
      unit_price: 15.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative unit price", () => {
    const result = quoteItemSchema.safeParse({
      description: "20A breaker",
      category: "material",
      quantity: 1,
      unit_price: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid category", () => {
    const result = quoteItemSchema.safeParse({
      description: "20A breaker",
      category: "invalid",
      quantity: 1,
      unit_price: 5,
    });
    expect(result.success).toBe(false);
  });
});
