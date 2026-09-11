import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/format";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CreditCard, ShieldCheck, Download, CheckCircle2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState } from "react";

export default function Checkout() {
  const [, params] = useRoute("/checkout/:cartId");
  const { cart, loading, closeCart, clearCart } = useCart();
  const { data: settings } = trpc.commerce.settings.useQuery();
  const { data: disclaimers } = trpc.commerce.listPrivacyDisclaimers.useQuery();
  
  const createOrder = trpc.commerce.createOrder.useMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [receiptBase64, setReceiptBase64] = useState<string | undefined>();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const provider = settings?.paymentProvider || "nessuno";
  
  let customFieldsConfig: Array<{id: string, label: string, required: boolean}> = [];
  if (settings?.checkoutFields) {
    try {
      customFieldsConfig = JSON.parse(settings.checkoutFields);
    } catch(e) {}
  }

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Il file PDF supera la dimensione massima di 1 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Create a summary string for the DB
      const itemsSummary = cart!.items.map(item => `${item.quantity}x ${item.productTitle} (${formatMoney(item.unitPrice)})`).join(", ");
      
      const customFieldsJson = Object.keys(customValues).length > 0 ? JSON.stringify(customValues) : undefined;

      // Save order to DB
      await createOrder.mutateAsync({
        customerName: name,
        customerEmail: email,
        totalAmount: cart!.total.amount,
        itemsSummary,
        customFields: customFieldsJson,
        paymentReceipt: receiptBase64
      });

      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Riepilogo Ordine", 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Data: ${new Date().toLocaleDateString("it-IT")}`, 14, 30);
      doc.text(`Cliente: ${name}`, 14, 38);
      doc.text(`Email: ${email}`, 14, 46);

      let currentY = 54;
      customFieldsConfig.forEach(field => {
        const val = customValues[field.label] || "Non specificato";
        doc.text(`${field.label}: ${val}`, 14, currentY);
        currentY += 8;
      });

      if (provider === "bonifico") {
        doc.text("Metodo di pagamento: Bonifico Bancario", 14, currentY);
        doc.text(`IBAN: ${settings?.bankIban || "Non specificato"}`, 14, currentY + 8);
        currentY += 16;
      } else {
        currentY += 8;
      }

      const tableData = cart!.items.map(item => [
        item.productTitle,
        item.quantity.toString(),
        formatMoney(item.unitPrice),
        formatMoney(item.lineTotal)
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Prodotto', 'Quantità', 'Prezzo Unitario', 'Totale']],
        body: tableData,
      });

      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFontSize(14);
      doc.text(`Totale Ordine: ${formatMoney(cart!.total)}`, 14, finalY + 15);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Grazie per aver sostenuto A-Tono ETS!", 14, finalY + 30);

      doc.save(`Ordine_${name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
      
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error("Errore generazione PDF", error);
      alert("C'è stato un problema nella registrazione dell'ordine.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Caricamento checkout in corso...</p>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-5">
        <CheckCircle2 className="text-green-500 mb-6" size={64} />
        <h2 className="text-3xl font-light mb-4 text-[#2b3e52]">Ordine Confermato!</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Grazie {name.split(" ")[0]}! Il tuo ordine è stato registrato. 
          Hai scaricato il PDF con il riepilogo e le istruzioni per il pagamento.
        </p>
        <div className="flex gap-4">
          <Link href="/shop" className="action-pill">Torna allo shop</Link>
        </div>
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
              <ShieldCheck className="text-green-600" size={20} /> 
              {provider === "bonifico" ? "Istruzioni di Pagamento" : "Pagamento Sicuro"}
            </h2>
            
            {provider === "nessuno" && (
              <p className="text-gray-600 text-sm mb-6">
                I pagamenti non sono ancora attivi su questo sito. Stiamo configurando il nostro provider.
              </p>
            )}

            {provider === "bonifico" && (
              <div className="bg-slate-50 border p-4 rounded mb-6 text-sm">
                <p className="font-bold mb-2">Procedura per il Bonifico Bancario:</p>
                <p>1. Inserisci i tuoi dati qui sotto.</p>
                <p>2. Clicca su Conferma: <strong>scaricherai automaticamente il riepilogo in PDF</strong> con i dati per il pagamento.</p>
                <p className="mt-2"><strong>IBAN:</strong> {settings?.bankIban || "Non configurato"}</p>
                <p className="mt-2">3. Il tuo ordine verrà elaborato alla ricezione del bonifico, e della relativa distinta.</p>
                <p className="mt-2">4. Puoi inviare la distinta a <strong>info@ets.a-tono.com</strong> o caricarla direttamente in questa pagina cliccando qui sotto:</p>
                <div className="mt-3 bg-white p-3 border rounded border-dashed">
                  <label className="block font-medium mb-1 text-xs">Carica Distinta Bonifico (opzionale, formato PDF max 1MB)</label>
                  <input type="file" accept="application/pdf" onChange={handleReceiptUpload} className="text-xs" />
                  {receiptBase64 && <p className="text-xs text-green-600 mt-1">Distinta pronta per essere inviata insieme all'ordine.</p>}
                </div>
              </div>
            )}

            {provider === "stripe" && (
              <p className="text-gray-600 text-sm mb-6">
                Pagamento sicuro tramite Carta di Credito (Stripe è attualmente in fase di test).
              </p>
            )}
            
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); generatePdf(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="tu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome e Cognome</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Mario Rossi" />
              </div>
              
              {customFieldsConfig.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input 
                    type="text" 
                    required={field.required} 
                    value={customValues[field.label] || ""} 
                    onChange={e => setCustomValues({...customValues, [field.label]: e.target.value})} 
                    className="w-full rounded-md border border-gray-300 px-3 py-2" 
                  />
                </div>
              ))}

              {disclaimers && disclaimers.length > 0 && (
                <div className="pt-4 border-t border-gray-100 mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Informative e Privacy</h3>
                  {disclaimers.map(d => (
                    <label key={d.id} className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" required={d.isRequired === 1} className="mt-1" />
                      <div className="text-sm text-gray-600">
                        <strong>{d.title}: </strong>
                        {d.text} {d.isRequired === 1 && <span className="text-red-500">*</span>}
                        {d.link && (
                          <a href={d.link} target="_blank" rel="noreferrer" download={d.link.startsWith('data:') ? `${d.title}.pdf` : undefined} className="text-blue-500 ml-1 hover:underline">
                            Leggi il documento
                          </a>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="pt-4">
                <button type="submit" disabled={provider === "nessuno" || isGeneratingPdf} className="action-pill w-full justify-center text-lg bg-[#2b3e52] hover:bg-[#1a2633] disabled:opacity-50 disabled:cursor-not-allowed">
                  {isGeneratingPdf ? "Registrazione ordine..." : (provider === "bonifico" ? <><Download className="mr-2" size={20} /> Conferma Ordine e Scarica PDF</> : <><CreditCard className="mr-2" size={20} /> Paga {formatMoney(cart.total)}</>)}
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
