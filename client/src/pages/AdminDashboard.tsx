import { useState, useRef } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");

  const utils = trpc.useUtils();
  
  const { data: products, isLoading: isLoadingProducts } = trpc.admin.listProducts.useQuery(undefined, { enabled: isAdmin });
  const { data: admins, isLoading: isLoadingAdmins } = trpc.admin.listAdmins.useQuery(undefined, { enabled: isAdmin });
  
  const login = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      setIsAdmin(true);
      toast.success(`Accesso effettuato come ${data.username}`);
    },
    onError: (err) => {
      toast.error(err.message || "Credenziali errate");
    }
  });

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setPriceAmount("");
    setImageUrl("");
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const createProduct = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      toast.success("Prodotto creato con successo!");
      resetForm();
      utils.admin.listProducts.invalidate();
      utils.commerce.listProducts.invalidate();
    },
    onError: (err) => toast.error(`Errore: ${err.message}`)
  });

  const updateProduct = trpc.admin.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Prodotto aggiornato!");
      resetForm();
      utils.admin.listProducts.invalidate();
      utils.commerce.listProducts.invalidate();
    },
    onError: (err) => toast.error(`Errore: ${err.message}`)
  });

  const deleteProduct = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Prodotto eliminato");
      utils.admin.listProducts.invalidate();
      utils.commerce.listProducts.invalidate();
    }
  });

  const createAdmin = trpc.admin.createAdmin.useMutation({
    onSuccess: () => {
      toast.success("Amministratore creato!");
      setNewAdminUser("");
      setNewAdminPass("");
      utils.admin.listAdmins.invalidate();
    },
    onError: (err) => toast.error(`Errore: ${err.message}`)
  });

  const deleteAdmin = trpc.admin.deleteAdmin.useMutation({
    onSuccess: () => {
      toast.success("Amministratore eliminato");
      utils.admin.listAdmins.invalidate();
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ username: usernameInput, password: passwordInput });
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4 mt-20">
        <h2 className="text-xl font-bold">Area Riservata</h2>
        <p>Inserisci le tue credenziali per accedere.</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-2">
          <Input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} placeholder="Username" />
          <Input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Password" />
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateProduct.mutate({ id: editId, title, priceAmount, imageUrl, description });
    } else {
      createProduct.mutate({ title, priceAmount, imageUrl, description });
    }
  };

  const handleEditClick = (p: any) => {
    setEditId(p.id);
    setTitle(p.title);
    setPriceAmount(p.priceAmount);
    setImageUrl(p.imageUrl || "");
    setDescription(p.description || "");
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pannello di Controllo</h1>
        <Button variant="outline" onClick={() => setIsAdmin(false)}>Esci</Button>
      </div>
      
      {/* SEZIONE PRODOTTI */}
      <section>
        <div className="mb-6 rounded-xl bg-slate-50 p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{editId ? "Modifica prodotto" : "Aggiungi nuovo prodotto"}</h2>
            {editId && <Button variant="ghost" onClick={resetForm}>Annulla Modifica</Button>}
          </div>
          <form onSubmit={handleProductSubmit} className="flex flex-col gap-4">
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
              <label className="mb-1 block text-sm font-medium">Immagine (carica dal PC)</label>
              <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="flex-1" />
                {imageUrl && (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded border">
                    <img src={imageUrl} alt="Anteprima" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="mt-2 w-full sm:w-auto self-start">
              {createProduct.isPending || updateProduct.isPending ? "Salvataggio..." : (editId ? "Aggiorna Prodotto" : "Salva Prodotto")}
            </Button>
          </form>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Catalogo Attuale</h2>
          {isLoadingProducts ? (
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(p)}>Modifica</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteProduct.mutate({ id: p.id })}>Elimina</Button>
                  </div>
                </div>
              ))}
              {products?.length === 0 && <p className="text-gray-500">Nessun prodotto presente.</p>}
            </div>
          )}
        </div>
      </section>

      <hr />

      {/* SEZIONE AMMINISTRATORI */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Gestione Utenti (Amministratori)</h2>
        <div className="mb-6 rounded-xl bg-slate-50 p-6 shadow-sm border border-slate-100">
          <h3 className="mb-4 text-lg font-semibold">Crea nuovo amministratore</h3>
          <form onSubmit={(e) => { e.preventDefault(); createAdmin.mutate({ username: newAdminUser, password: newAdminPass }); }} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Username</label>
              <Input required minLength={3} value={newAdminUser} onChange={(e) => setNewAdminUser(e.target.value)} placeholder="Es. mario.rossi" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <Input required minLength={6} type="password" value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} placeholder="Minimo 6 caratteri" />
            </div>
            <Button type="submit" disabled={createAdmin.isPending} className="mt-2 w-full sm:w-auto self-start">
              {createAdmin.isPending ? "Creazione..." : "Crea Amministratore"}
            </Button>
          </form>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Amministratori Registrati</h3>
          {isLoadingAdmins ? (
            <p>Caricamento...</p>
          ) : (
            <div className="flex flex-col gap-2 max-w-sm">
              <div className="flex items-center justify-between rounded-lg border p-3 bg-gray-50">
                <div className="font-medium">admin (Account Principale)</div>
              </div>
              {admins?.map(a => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="font-medium">{a.username}</div>
                  <Button variant="destructive" size="sm" onClick={() => deleteAdmin.mutate({ id: a.id })}>Rimuovi</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
