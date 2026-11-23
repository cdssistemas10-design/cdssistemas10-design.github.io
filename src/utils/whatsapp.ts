export function normalizeWhatsAppNumber(rawNumber: string): string {
  const digits = (rawNumber || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function isValidWhatsAppNumber(rawNumber: string): boolean {
  const digits = normalizeWhatsAppNumber(rawNumber);
  return /^55\d{10,11}$/.test(digits);
}

export function buildWhatsAppLink(rawNumber: string, message?: string): string {
  return buildWhatsAppAppLink(rawNumber, message);
}

export function buildWhatsAppWebLink(rawNumber: string, message?: string): string {
  const digits = normalizeWhatsAppNumber(rawNumber);
  if (!isValidWhatsAppNumber(digits)) return "#contato";
  const text = encodeURIComponent(message || "");
  return `https://wa.me/${digits}${text ? `?text=${text}` : ""}`;
}

export function buildWhatsAppAppLink(rawNumber: string, message?: string): string {
  const digits = normalizeWhatsAppNumber(rawNumber);
  if (!isValidWhatsAppNumber(digits)) return "#contato";
  const text = encodeURIComponent(message || "");
  return `whatsapp://send?phone=${digits}${text ? `&text=${text}` : ""}`;
}

export function buildWhatsAppWebFallback(appUrl: string): string {
  try {
    const url = new URL(appUrl);
    if (url.protocol !== "whatsapp:" || url.hostname !== "send") return "#contato";
    const phone = url.searchParams.get("phone") || "";
    if (!isValidWhatsAppNumber(phone)) return "#contato";
    return buildWhatsAppWebLink(phone, url.searchParams.get("text") || "");
  } catch {
    return "#contato";
  }
}

export function launchWhatsApp(appUrl: string): void {
  if (!appUrl.startsWith("whatsapp://send?")) return;
  window.dispatchEvent(new CustomEvent("whatsapp:launch", { detail: { appUrl } }));
  window.location.assign(appUrl);
}
