import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/format";
import { getProductImpact } from "@/lib/productImpact";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ArrowLeft, ArrowUpRight, Loader2, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useRoute } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/prodotto/:handle");
  const handle = params?.handle ?? "";
  const { data: product, isLoading, isError } = trpc.commerce.products.byHandle.useQuery({ handle }, { enabled: Boolean(handle) });
  const { addItem, loading } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const visibleOptions = useMemo(
    () => product?.options.filter(option => !(option.name === "Title" && option.values.length === 1 && option.values[0] === "Default Title")) ?? [],
    [product]
  );

  useEffect(() => {
    if (!product) return;
    setSelectedOptions(Object.fromEntries(product.options.map(option => [option.name, option.values[0] ?? ""])));
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product) return undefined;
    return product.variants.find(variant => Object.entries(selectedOptions).every(([name, value]) => variant.selectedOptions.some(option => option.name === name && option.value === value))) ?? product.variants[0];
  }, [product, selectedOptions]);

  const impact = useMemo(() => getProductImpact(handle), [handle]);

  const addToCart = async () => {
    if (!selectedVariant?.availableForSale) return;
    try {
      await addItem(selectedVariant.id);
    } catch {
      toast.error("Non è stato possibile aggiornare il carrello. Riprova tra poco.");
    }
  };

  if (isLoading) return <main className="px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto grid max-w-[1280px] animate-pulse gap-10 lg:grid-cols-[1.06fr_.94fr] lg:gap-16"><div className="min-h-[390px] bg-[#edf2f5] sm:min-h-[520px]" /><div className="flex flex-col justify-center"><div className="h-3 w-36 bg-[#d7e4ec]" /><div className="mt-7 h-20 w-full max-w-lg bg-[#d7e4ec]" /><div className="mt-8 h-8 w-24 bg-[#d7e4ec]" /><div className="my-8 h-px bg-[#cad8e2]" /><div className="h-4 w-full bg-[#e0eaf0]" /><div className="mt-3 h-4 w-5/6 bg-[#e0eaf0]" /><div className="mt-10 h-12 w-full max-w-xs rounded-full bg-[#cbdbe6]" /></div></div></main>;
  if (isError || !product) return <main className="grid min-h-[62vh] place-items-center px-5"><div className="max-w-md text-center"><AlertCircle className="mx-auto text-[#7a9cbf]" size={34} /><h1 className="mt-5 font-display text-4xl font-light text-[#2b3e52]">Prodotto non disponibile</h1><Link href="/shop" className="action-pill mt-7">Torna allo shop</Link></div></main>;

  const image = product.images[0];
  return (
    <main>
      <div className="px-5 pt-9 sm:px-8 lg:px-12"><div className="mx-auto max-w-[1280px]"><Link href="/shop" className="back-link"><ArrowLeft size={14} aria-hidden="true" /> Torna allo shop</Link></div></div>
      <section className="px-5 pb-20 pt-9 sm:px-8 sm:pb-28 lg:px-12">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-16">
          <div className="product-detail-image bg-[#edf2f5]">
            {image ? <img src={image.url} alt={image.altText ?? product.title} className="h-full min-h-[390px] w-full object-cover sm:min-h-[520px]" /> : <div className="grid min-h-[390px] place-items-center text-sm text-[#607287]">Immagine in arrivo</div>}
          </div>
          <div className="flex flex-col justify-center py-2 lg:py-8">
            <p className="eyebrow">Merchandising solidale</p>
            <h1 className="mt-5 font-display text-5xl font-light leading-[0.95] tracking-[-0.04em] text-[#2b3e52] sm:text-6xl">{product.title}</h1>
            <p className="mt-6 font-display text-3xl font-light text-[#7a9cbf]">{selectedVariant ? formatMoney(selectedVariant.price) : formatMoney(product.priceRange.min)}</p>
            <div className="my-8 h-px bg-[#cad8e2]" />
            <p className="text-base font-light leading-8 text-[#51687e]">{product.description || "Un oggetto scelto per accompagnare i gesti quotidiani e sostenere le iniziative di A-Tono ETS."}</p>
            {visibleOptions.map(option => (
              <label key={option.name} className="mt-7 block max-w-xs text-xs font-bold uppercase tracking-[0.15em] text-[#456987]">
                {option.name}
                <select value={selectedOptions[option.name] ?? ""} onChange={event => setSelectedOptions(current => ({ ...current, [option.name]: event.target.value }))} className="mt-3 block w-full border-b border-[#91a8bc] bg-transparent px-0 py-3 text-base font-normal normal-case tracking-normal text-[#2b3e52] outline-none focus:border-[#2b3e52]">
                  {option.values.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
            ))}
            <button type="button" className="action-pill mt-9 w-full justify-center sm:w-auto" onClick={addToCart} disabled={!selectedVariant?.availableForSale || loading}>
              {loading ? <Loader2 className="animate-spin" size={17} aria-hidden="true" /> : <ShoppingBag size={17} aria-hidden="true" />}
              {selectedVariant?.availableForSale ? "Aggiungi al carrello" : "Non disponibile"}
            </button>
            <div className="impact-note mt-8"><span className="impact-mark">+</span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#52718b]">{impact.eyebrow}</p><p className="mt-2 font-display text-xl font-light text-[#2b3e52]">{impact.title}</p><p className="mt-2">{impact.description}</p></div></div>
            <a href={impact.href} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#456987] transition-colors hover:text-[#7a9cbf]">{impact.linkLabel} <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </section>
    </main>
  );
}
