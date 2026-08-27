import { describe, expect, it } from "vitest";
import { getProductImpact } from "./productImpact";

describe("getProductImpact", () => {
  it("associa la tote bag di anteprima al programma ETS mostrato nella pagina prodotto", () => {
    const impact = getProductImpact("tote-bag-solidale-edizione-ets");

    expect(impact.title).toBe("Progetti e iniziative A-Tono ETS");
    expect(impact.href).toBe("https://ets.a-tono.com/progetti.html");
  });

  it("usa un programma di impatto trasparente come fallback per i prodotti futuri", () => {
    expect(getProductImpact("prodotto-futuro").linkLabel).toBe("Scopri il programma sostenuto");
  });
});
