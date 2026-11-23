import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeWhatsAppNumber,
  isValidWhatsAppNumber,
  buildWhatsAppLink,
  buildWhatsAppAppLink,
  buildWhatsAppWebFallback,
  buildWhatsAppWebLink,
} from "../src/utils/whatsapp.ts";

test("normalizes and validates Brazilian WhatsApp numbers", () => {
  assert.equal(normalizeWhatsAppNumber("(11) 91234-5678"), "5511912345678");
  assert.equal(isValidWhatsAppNumber("5511912345678"), true);
  assert.equal(isValidWhatsAppNumber("123"), false);
});

test("builds direct app and encoded web fallback URLs", () => {
  const appUrl = "whatsapp://send?phone=5511912345678&text=Ol%C3%A1%20%26%20equipe";
  const webUrl = "https://wa.me/5511912345678?text=Ol%C3%A1%20%26%20equipe";

  assert.equal(buildWhatsAppLink("11 91234-5678", "Olá & equipe"), appUrl);
  assert.equal(buildWhatsAppAppLink("5511912345678", "Olá & equipe"), appUrl);
  assert.equal(buildWhatsAppWebLink("11 91234-5678", "Olá & equipe"), webUrl);
  assert.equal(buildWhatsAppWebFallback(appUrl), webUrl);
  assert.equal(buildWhatsAppWebFallback("https://example.com"), "#contato");
});
