import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/format";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { Link, useRoute } from "wouter";

export default function Checkout() {
  const [, params] = useRoute("/checkout/:cartId");
  const { cart, loading } = useCart();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Caricamento checkout in corso...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-light mb-4">Il tuo carrello è vuoto</h2>
        <Link href="/shop" className="action-pill">Torna allo shop</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-12">
      <Link href="/shop" className="mb-8 inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft size={16} className="mr-2" /> Torna al negozio
      </Link>
      
      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Modulo di Checkout */}
        <div>
          <h1 className="font-display text-3xl font-light text-[#2b3e52] mb-8">Checkout</h1>
          
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ShieldCheck className="text-green-600" size={20} /> Pagamento Sicuro
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Questa è una pagina di Checkout preparatoria. Quando sarai pronto ad accettare pagamenti reali, collegheremo qui il tuo provider (es. Stripe, PayPal, o Bonifico Bancario).
            </p>
            
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="tu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome e Cognome</label>
                <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Mario Rossi" />
              </div>
              <div className="pt-4">
                <button type="button" className="action-pill w-full justify-center text-lg bg-[#2b3e52] hover:bg-[#1a2633]" onClick={() => alert("Il sistema di pagamento verrà attivato a breve!")}>
                  <CreditCard className="mr-2" size={20} /> Paga {formatMoney(cart.total)}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Riepilogo Ordine */}
        <div className="rounded-xl bg-gray-50 p-6 h-fit border border-gray-100">
          <h2 className="font-semibold text-lg mb-4">Riepilogo Ordine</h2>
          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
            {cart.items.map(item => (
              <div key={item.lineId} className="flex gap-4">
                <div className="h-16 w-16 shrink-0 rounded-md border border-gray-200 overflow-hidden bg-white">
                  {item.image ? (
                    <img src={item.image.url} alt={item.image.altText ?? item.productTitle} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.productTitle}</h3>
                  <p className="text-xs text-gray-500 mt-1">Qtà: {item.quantity}</p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatMoney(item.lineTotal)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotale</span>
              <span className="font-medium">{formatMoney(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Spedizione</span>
              <span className="text-gray-500 italic">Calcolata in seguito</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 mt-2">
              <span>Totale</span>
              <span>{formatMoney(cart.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
