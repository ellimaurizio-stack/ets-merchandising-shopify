import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/format";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

export function CartDrawer() {
  const {
    cart,
    isOpen,
    loading,
    itemCount,
    closeCart,
    openCart,
    updateQuantity,
    removeItem,
    proceedToCheckout,
  } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={open => (open ? openCart() : closeCart())}>
      <SheetContent side="right" className="flex w-full max-w-[430px] flex-col gap-0 border-0 bg-[#f7f9fa] p-0 text-[#334155] sm:max-w-[430px]">
        <SheetHeader className="border-b border-[#d9e1e7] px-6 pb-5 pt-7 text-left">
          <div className="mb-2 flex items-center gap-2 text-[#7a9cbf]">
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Merchandising solidale</span>
          </div>
          <SheetTitle className="font-display text-3xl font-light text-[#2b3e52]">Il tuo carrello</SheetTitle>
          <SheetDescription className="mt-1 text-sm leading-6 text-[#607287]">
            {itemCount === 0 ? "Aggiungi un oggetto per sostenere i progetti dell’ETS." : `${itemCount} ${itemCount === 1 ? "prodotto" : "prodotti"} selezionati.`}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {!cart?.items.length ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <div className="mb-5 rounded-full bg-[#dce8f2] p-4 text-[#456987]"><ShoppingBag size={25} strokeWidth={1.5} /></div>
              <p className="font-display text-2xl font-light text-[#2b3e52]">Il carrello è vuoto.</p>
              <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#607287]">Ogni acquisto contribuisce a rendere possibili le iniziative di A-Tono ETS.</p>
            </div>
          ) : (
            <ul className="space-y-5" aria-label="Prodotti nel carrello">
              {cart.items.map(item => (
                <li key={item.lineId} className="flex gap-4 border-b border-[#d9e1e7] pb-5">
                  <div className="h-[86px] w-[74px] shrink-0 overflow-hidden bg-white">
                    {item.image ? <img src={item.image.url} alt={item.image.altText ?? item.productTitle} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[#dce8f2]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold leading-5 text-[#2b3e52]">{item.productTitle}</p>
                        {item.variantTitle !== "Default Title" && <p className="mt-1 text-xs text-[#607287]">{item.variantTitle}</p>}
                      </div>
                      <button type="button" className="shrink-0 text-[#7890a6] transition-colors hover:text-[#2b3e52]" onClick={() => removeItem(item.lineId)} aria-label={`Rimuovi ${item.productTitle}`} disabled={loading}>
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center border border-[#c9d5df] bg-white">
                        <button type="button" className="grid h-8 w-8 place-items-center text-[#456987] hover:bg-[#eff5f8] disabled:opacity-40" onClick={() => updateQuantity(item.lineId, item.quantity - 1)} disabled={loading} aria-label="Riduci quantità"><Minus size={13} /></button>
                        <span className="grid h-8 w-8 place-items-center text-xs font-bold" aria-label={`Quantità ${item.quantity}`}>{item.quantity}</span>
                        <button type="button" className="grid h-8 w-8 place-items-center text-[#456987] hover:bg-[#eff5f8] disabled:opacity-40" onClick={() => updateQuantity(item.lineId, item.quantity + 1)} disabled={loading} aria-label="Aumenta quantità"><Plus size={13} /></button>
                      </div>
                      <span className="text-sm font-bold text-[#2b3e52]">{formatMoney(item.lineTotal)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SheetFooter className="border-t border-[#d9e1e7] bg-white p-6">
          <div className="mb-4 flex items-baseline justify-between text-[#2b3e52]">
            <span className="text-xs font-bold uppercase tracking-[0.16em]">Totale parziale</span>
            <span className="font-display text-2xl font-light">{cart ? formatMoney(cart.subtotal) : "—"}</span>
          </div>
          <button type="button" className="action-pill w-full justify-center disabled:cursor-not-allowed disabled:opacity-50" onClick={proceedToCheckout} disabled={!itemCount || loading}>
            {loading ? <Loader2 className="animate-spin" size={17} aria-hidden="true" /> : <ShoppingBag size={17} aria-hidden="true" />}
            Vai al checkout sicuro
          </button>
          <p className="mt-3 text-center text-xs leading-5 text-[#7890a6]">Pagamento, spedizione e ordine sono gestiti in modo sicuro da Shopify.</p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
