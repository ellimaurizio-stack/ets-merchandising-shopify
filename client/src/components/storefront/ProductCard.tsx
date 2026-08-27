import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/format";
import type { Product } from "@shared/commerce/types";
import { ArrowUpRight, Loader2, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addItem, loading } = useCart();
  const primaryImage = product.images[0];
  const primaryVariant = product.variants[0];

  const addToCart = async () => {
    if (!primaryVariant?.availableForSale) return;
    try {
      await addItem(primaryVariant.id);
    } catch {
      toast.error("Non è stato possibile aggiornare il carrello. Riprova tra poco.");
    }
  };

  return (
    <article className={compact ? "product-card product-card-compact" : "product-card"}>
      <Link href={`/prodotto/${product.handle}`} className="product-image-link">
        {primaryImage ? (
          <img src={primaryImage.url} alt={primaryImage.altText ?? product.title} className="product-image" loading="lazy" />
        ) : (
          <div className="product-image grid place-items-center bg-[#e9f0f4] text-xs font-bold uppercase tracking-[0.18em] text-[#607287]">Immagine in arrivo</div>
        )}
        <span className="product-view" aria-hidden="true"><ArrowUpRight size={16} /></span>
      </Link>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7a9cbf]">Merchandising solidale</p>
        <Link href={`/prodotto/${product.handle}`} className="mt-2 font-display text-[1.7rem] font-light leading-[1.04] text-[#2b3e52] transition-colors hover:text-[#7a9cbf]">{product.title}</Link>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#607287]">{product.description || "Un gesto quotidiano per sostenere i progetti e le iniziative dell’ETS."}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-base font-bold text-[#2b3e52]">{formatMoney(product.priceRange.min)}</span>
          <button type="button" className="product-add" onClick={addToCart} disabled={!primaryVariant?.availableForSale || loading} aria-label={`Aggiungi ${product.title} al carrello`}>
            {loading ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
            <span className="hidden sm:inline">Aggiungi</span>
          </button>
        </div>
      </div>
    </article>
  );
}
