import { describe, it, expect } from "vitest";
import { buildWhatsAppLink } from "@/lib/whatsapp";

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with url-encoded prefilled product message", () => {
    const link = buildWhatsAppLink("94770000000", "Cotton Wick (Medium)");
    expect(link).toBe("https://wa.me/94770000000?text=Hi%2C%20I%27m%20interested%20in%3A%20Cotton%20Wick%20(Medium)");
  });
  it("strips non-digits from the number", () => {
    const link = buildWhatsAppLink("+94 77 000 0000", "Floating Wick");
    expect(link.startsWith("https://wa.me/94770000000?")).toBe(true);
  });
  it("uses a generic message when no product is given", () => {
    const link = buildWhatsAppLink("94770000000");
    expect(decodeURIComponent(link)).toContain("Hi, I'd like to ask about your wicks");
  });
});
