import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate, formatPhoneDisplay } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats a numeric string as USD currency", () => {
    expect(formatCurrency("1234.5")).toBe("$1,234.50");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency("0")).toBe("$0.00");
  });

  it("returns a safe fallback for invalid input", () => {
    expect(formatCurrency("not-a-number")).toBe("$0.00");
  });
});

describe("formatDate", () => {
  it("formats an ISO date string", () => {
    expect(formatDate("2026-07-13T00:00:00Z")).toMatch(/Jul 1[23], 2026/);
  });

  it("returns an em dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns an em dash for invalid date strings", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatPhoneDisplay", () => {
  it("formats a 10-digit US number", () => {
    expect(formatPhoneDisplay("4155550132")).toBe("(415) 555-0132");
  });

  it("returns the original string for non-10-digit numbers", () => {
    expect(formatPhoneDisplay("+27821234567")).toBe("+27821234567");
  });
});
