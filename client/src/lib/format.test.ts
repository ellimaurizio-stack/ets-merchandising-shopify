import { describe, expect, it } from "vitest";
import { formatMoney } from "./format";

describe("formatMoney", () => {
  it("formatta un importo Shopify in euro secondo la localizzazione italiana", () => {
    expect(formatMoney({ amount: "18.00", currencyCode: "EUR" })).toBe("18 €");
  });

  it("mantiene i centesimi quando il prezzo non è intero", () => {
    expect(formatMoney({ amount: "22.50", currencyCode: "EUR" })).toBe("22,50 €");
  });

  it("mostra un segnaposto per un importo non valido", () => {
    expect(formatMoney("non-disponibile", "EUR")).toBe("—");
  });
});
