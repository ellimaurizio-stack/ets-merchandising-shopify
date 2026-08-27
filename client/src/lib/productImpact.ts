export type ProductImpact = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
};

const projectsProgram: ProductImpact = {
  eyebrow: "Il tuo acquisto sostiene",
  title: "Progetti e iniziative A-Tono ETS",
  description: "Il ricavato del merchandising contribuisce a sostenere il programma di progetti e iniziative dell’ETS rivolto alle persone e ai territori.",
  href: "https://ets.a-tono.com/progetti.html",
  linkLabel: "Scopri il programma sostenuto",
};

const productImpactByHandle: Record<string, ProductImpact> = {
  "tote-bag-solidale-edizione-ets": projectsProgram,
  "borraccia-riutilizzabile-edizione-ets": projectsProgram,
};

export function getProductImpact(handle: string): ProductImpact {
  return productImpactByHandle[handle] ?? projectsProgram;
}
