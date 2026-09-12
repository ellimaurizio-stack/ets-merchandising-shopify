import { ProductCard } from "@/components/storefront/ProductCard";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

export default function Shop() {
  const { data: products = [], isLoading, isError } = trpc.commerce.products.list.useQuery({ first: 24 });
  const [activeType, setActiveType] = useState("Tutti");
  const types = useMemo<string[]>(() => {
    const productTypes = products
      .map(product => product.productType)
      .filter((type): type is string => typeof type === "string" && type.length > 0);
    return ["Tutti", ...Array.from(new Set(productTypes))];
  }, [products]);
  const filteredProducts = activeType === "Tutti" ? products : products.filter(product => product.productType === activeType);

  return (
    <main>
      <section className="shop-intro px-5 pb-14 pt-16 sm:px-8 sm:pb-18 sm:pt-24 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="mt-10 grid items-end gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="eyebrow">A-Tono ETS / Shop</p>
              <h1 className="mt-5 font-display text-5xl font-light leading-[0.91] tracking-[-0.045em] text-[#2b3e52] sm:text-7xl">Oggetti con un<br /><strong className="font-bold text-[#7a9cbf]">significato.</strong></h1>
            </div>
            <div className="max-w-[600px] border-l-2 border-[#7a9cbf] pl-6 text-lg font-light leading-8 text-[#51687e] sm:pl-8">
              Scegli un oggetto da portare con te ogni giorno. Il tuo acquisto contribuisce a sostenere il lavoro e le iniziative di A-Tono ETS.
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          {types.length > 2 && <div className="mb-10 flex flex-wrap gap-2" aria-label="Filtra il catalogo">{types.map(type => <button type="button" key={type} onClick={() => setActiveType(type)} className={activeType === type ? "filter-chip filter-chip-active" : "filter-chip"}>{type}</button>)}</div>}
          {isLoading ? (
            <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" aria-label="Caricamento catalogo">
              {[0, 1, 2].map(item => <div key={item} className="animate-pulse"><div className="aspect-[1/1.1] bg-[#e7eef3]" /><div className="mt-5 h-3 w-28 bg-[#d9e5ed]" /><div className="mt-3 h-8 w-4/5 bg-[#d9e5ed]" /><div className="mt-5 h-3 w-full bg-[#e0eaf0]" /></div>)}
            </div>
          ) : isError ? (
            <div className="rounded-sm border border-[#cbd8e2] bg-white px-7 py-12 text-center"><p className="font-display text-3xl font-light text-[#2b3e52]">Il catalogo non è disponibile.</p><p className="mt-3 text-sm text-[#607287]">Riprova tra qualche istante.</p></div>
          ) : filteredProducts.length ? (
            <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}</div>
          ) : (
            <div className="rounded-sm border border-dashed border-[#b9c9d6] bg-white px-7 py-12 text-center"><p className="font-display text-3xl font-light text-[#2b3e52]">Stiamo preparando nuovi oggetti.</p><p className="mt-3 text-sm text-[#607287]">Torna presto a trovarci.</p></div>
          )}
        </div>
      </section>
    </main>
  );
}
