import { describe, it, expect } from "vitest";
import { displayPrice, formatRs } from "@/lib/pricing";

describe("formatRs", () => {
  it("formats with Rs prefix and thousands separators", () => {
    expect(formatRs(1500)).toBe("Rs 1,500");
  });
});

describe("displayPrice", () => {
  it("uses base price when no variants", () => {
    expect(displayPrice({ basePrice: 60, variants: [] })).toBe("Rs 60");
  });
  it("shows 'from' lowest variant when variants exist", () => {
    expect(displayPrice({ basePrice: null, variants: [{ price: 120 }, { price: 50 }, { price: 80 }] })).toBe("from Rs 50");
  });
  it("returns 'Price on request' when neither base nor variants", () => {
    expect(displayPrice({ basePrice: null, variants: [] })).toBe("Price on request");
  });
});
