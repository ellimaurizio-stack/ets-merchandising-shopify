import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth } from "../_core/hooks/useAuth";

import { startLogin } from "../const";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.admin.listProducts.useQuery();
  const createProduct = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      toast.success("Prodotto creato con successo!");
      setTitle("");
      setPriceAmount("");
      setImageUrl("");
      setDescription("");
      utils.admin.listProducts.invalidate();
      utils.commerce.listProducts.invalidate();
    },
    onError: (err) => {
      toast.error(`Errore: ${err.message}`);
    }
  });

  const deleteProduct = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Prodotto eliminato");
      utils.admin.listProducts.invalidate();
      utils.commerce.listProducts.invalidate();
    }
  });

  if (!user) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4 mt-20">
        <h2 className="text-xl font-bold">Area Riservata</h2>
        <p>Esegui l'accesso per visualizzare l'area amministratore.</p>
        <Button onClick={startLogin}>Accedi come Amministratore</Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({ title, priceAmount, imageUrl, description });
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="mb-8 text-3xl font-bold">Gestione Prodotti (Admin)</h1>
      
      <div className="mb-12 rounded-xl bg-slate-50 p-6 shadow-sm border border-slate-100">
        <h2 className="mb-4 text-xl font-semibold">Aggiungi nuovo prodotto</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Titolo Prodotto</label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Maglietta Logo" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Prezzo (€)</label>
            <Input required value={priceAmount} onChange={(e) => setPriceAmount(e.target.value)} placeholder="Es. 19.99" type="number" step="0.01" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Descrizione</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrizione..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">URL Immagine</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <Button type="submit" disabled={createProduct.isPending} className="mt-2 w-full sm:w-auto self-start">
            {createProduct.isPending ? "Salvataggio..." : "Salva Prodotto"}
          </Button>
        </form>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Catalogo Attuale</h2>
        {isLoading ? (
          <p>Caricamento prodotti...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {products?.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="h-12 w-12 rounded object-cover" />}
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-gray-500">€{p.priceAmount}</div>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deleteProduct.mutate({ id: p.id })}>
                  Elimina
                </Button>
              </div>
            ))}
            {products?.length === 0 && <p className="text-gray-500">Nessun prodotto presente.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
