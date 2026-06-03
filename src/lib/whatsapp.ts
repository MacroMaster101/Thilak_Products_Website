export function buildWhatsAppLink(rawNumber: string, productName?: string): string {
  const number = rawNumber.replace(/\D/g, "");
  const message = productName
    ? `Hi, I'm interested in: ${productName}`
    : "Hi, I'd like to ask about your wicks";
  return `https://wa.me/${number}?text=${encodeURIComponent(message).replace(/'/g, "%27")}`;
}
