import { useState, useRef, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, Package, Users, CreditCard, LayoutTemplate, ShieldCheck, ShoppingBag, LogOut, Truck, List, FileText } from "lucide-react";

type Tab = "general" | "products" | "catalog" | "orders" | "shipping" | "payment" | "checkout" | "receipt" | "privacy" | "admins";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [weightGrams, setWeightGrams] = useState(0);
  const [lengthCm, setLengthCm] = useState(0);
  const [widthCm, setWidthCm] = useState(0);
  const [heightCm, setHeightCm] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  
  const [impactEnabled, setImpactEnabled] = useState(true);
  const [impactEyebrow, setImpactEyebrow] = useState("Il tuo acquisto sostiene");
  const [impactTitle, setImpactTitle] = useState("Progetti e iniziative A-Tono ETS");
  const [impactDescription, setImpactDescription] = useState("Il ricavato del merchandising contribuisce a sostenere il programma di progetti e iniziative dell’ETS rivolto alle persone e ai territori.");
  const [impactHref, setImpactHref] = useState("https://ets.a-tono.com/progetti.html");
  const [impactLinkLabel, setImpactLinkLabel] = useState("Scopri il programma sostenuto");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");

  const utils = trpc.useUtils();
  
  const { data: products, isLoading: isLoadingProducts, error: productsError } = trpc.admin.listProducts.useQuery(undefined, { enabled: isAdmin });
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
    setWeightGrams(0);
    setLengthCm(0);
    setWidthCm(0);
    setHeightCm(0);
    setImageUrl("");
    setDescription("");
    setDescriptionHtml("");
    setImpactEnabled(true);
    setImpactEyebrow("Il tuo acquisto sostiene");
    setImpactTitle("Progetti e iniziative A-Tono ETS");
    setImpactDescription("Il ricavato del merchandising contribuisce a sostenere il programma di progetti e iniziative dell’ETS rivolto alle persone e ai territori.");
    setImpactHref("https://ets.a-tono.com/progetti.html");
    setImpactLinkLabel("Scopri il programma sostenuto");
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
      toast.success("Prodotto eliminato!");
      utils.admin.listProducts.invalidate();
      utils.commerce.listProducts.invalidate();
    },
    onError: (err) => toast.error(`Errore: ${err.message}`)
  });

  const reorderProducts = trpc.admin.reorderProducts.useMutation({
    onSuccess: () => {
      utils.admin.listProducts.invalidate();
      utils.commerce.listProducts.invalidate();
    },
    onError: (err) => toast.error(`Errore: ${err.message}`)
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
    const impactConfig = JSON.stringify({
      enabled: impactEnabled,
      eyebrow: impactEyebrow,
      title: impactTitle,
      description: impactDescription,
      href: impactHref,
      linkLabel: impactLinkLabel,
    });
    
    if (editId) {
      updateProduct.mutate({ id: editId, title, priceAmount, imageUrl, description, descriptionHtml, weightGrams, lengthCm, widthCm, heightCm, impactConfig });
    } else {
      createProduct.mutate({ title, priceAmount, imageUrl, description, descriptionHtml, weightGrams, lengthCm, widthCm, heightCm, impactConfig });
    }
  };

  const handleEditClick = (p: any) => {
    setActiveTab("products");
    setEditId(p.id);
    setTitle(p.title);
    setPriceAmount(p.priceAmount);
    setWeightGrams(p.weightGrams || 0);
    setLengthCm(p.lengthCm || 0);
    setWidthCm(p.widthCm || 0);
    setHeightCm(p.heightCm || 0);
    setImageUrl(p.imageUrl || "");
    setDescription(p.description || "");
    setDescriptionHtml(p.descriptionHtml || "");
    
    try {
      if (p.impactConfig) {
        const config = JSON.parse(p.impactConfig);
        setImpactEnabled(config.enabled ?? true);
        setImpactEyebrow(config.eyebrow || "Il tuo acquisto sostiene");
        setImpactTitle(config.title || "Progetti e iniziative A-Tono ETS");
        setImpactDescription(config.description || "Il ricavato del merchandising contribuisce a sostenere il programma di progetti e iniziative dell’ETS rivolto alle persone e ai territori.");
        setImpactHref(config.href || "https://ets.a-tono.com/progetti.html");
        setImpactLinkLabel(config.linkLabel || "Scopri il programma sostenuto");
      } else {
        setImpactEnabled(true);
        setImpactEyebrow("Il tuo acquisto sostiene");
        setImpactTitle("Progetti e iniziative A-Tono ETS");
        setImpactDescription("Il ricavato del merchandising contribuisce a sostenere il programma di progetti e iniziative dell’ETS rivolto alle persone e ai territori.");
        setImpactHref("https://ets.a-tono.com/progetti.html");
        setImpactLinkLabel("Scopri il programma sostenuto");
      }
    } catch (e) {
      // Ignore
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const moveUp = (index: number) => {
    if (!products || index === 0) return;
    const newArr = [...products];
    const temp = newArr[index];
    newArr[index] = newArr[index - 1];
    newArr[index - 1] = temp;
    
    // Save to server
    const payload = newArr.map((p, i) => ({ id: p.id, sortOrder: i }));
    reorderProducts.mutate(payload);
  };

  const moveDown = (index: number) => {
    if (!products || index === products.length - 1) return;
    const newArr = [...products];
    const temp = newArr[index];
    newArr[index] = newArr[index + 1];
    newArr[index + 1] = temp;
    
    // Save to server
    const payload = newArr.map((p, i) => ({ id: p.id, sortOrder: i }));
    reorderProducts.mutate(payload);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">CMS Admin</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => setActiveTab("general")} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === "general" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <LayoutTemplate size={18} /> Impostazioni Shop
          </button>
          <button onClick={() => setActiveTab("products")} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === "products" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <Package size={18} /> Aggiungi Prodotto
          </button>
          <button onClick={() => setActiveTab("catalog")} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === "catalog" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <List size={18} /> Catalogo
          </button>
          <button onClick={() => setActiveTab("orders")} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === "orders" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <ShoppingBag size={18} /> Ordini
          </button>
          <button onClick={() => setActiveTab("shipping")} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === "shipping" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <Truck size={18} /> Costi Spedizione
          </button>
          <button onClick={() => setActiveTab("payment")} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === "payment" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <CreditCard size={18} /> Pagamenti
          </button>
          <button onClick={() => setActiveTab("checkout")} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === "checkout" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <LayoutTemplate size={18} /> Campi Checkout
          </button>
          <button onClick={() => setActiveTab("receipt")} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === "receipt" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <FileText size={18} /> Ricevuta PDF
          </button>
          <button onClick={() => setActiveTab("privacy")} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === "privacy" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <ShieldCheck size={18} /> Privacy & Policy
          </button>
          <button onClick={() => setActiveTab("admins")} className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeTab === "admins" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
            <Users size={18} /> Amministratori
          </button>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800">
          <button onClick={() => setIsAdmin(false)} className="flex items-center w-full gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium">
            <LogOut size={18} /> Esci dal CMS
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {activeTab === "general" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Impostazioni Shop</h2>
              <div className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <ShopSettingsSection />
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Gestione Prodotti</h2>
              <div className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">{editId ? "Modifica prodotto" : "Aggiungi nuovo prodotto"}</h3>
                  {editId && <Button variant="ghost" onClick={resetForm}>Annulla Modifica</Button>}
                </div>
                <form onSubmit={handleProductSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Titolo Prodotto</label>
                      <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Es. Maglietta Logo" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Prezzo (€)</label>
                      <Input required value={priceAmount} onChange={(e) => setPriceAmount(e.target.value)} placeholder="Es. 19.99" type="number" step="0.01" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Descrizione breve (Appare nel listato in Home)</label>
                      <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Es. T-shirt in cotone organico..." />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Descrizione lunga HTML (Appare nella pagina di dettaglio del prodotto)</label>
                      <Textarea value={descriptionHtml} onChange={(e) => setDescriptionHtml(e.target.value)} placeholder="<p>Questa t-shirt <strong>comoda</strong> e traspirante...</p>" rows={5} />
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
                    <h4 className="font-semibold text-sm text-slate-700">Dimensioni e Peso per Spedizione</h4>
                    <p className="text-xs text-slate-500 mb-2">Dati non visibili al cliente, usati per calcolare l'ingombro del pacco e i costi di spedizione.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">Peso (grammi)</label>
                        <Input required type="number" min="0" value={weightGrams} onChange={(e) => setWeightGrams(parseInt(e.target.value) || 0)} placeholder="100" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">Lunghezza (cm)</label>
                        <Input required type="number" min="0" value={lengthCm} onChange={(e) => setLengthCm(parseInt(e.target.value) || 0)} placeholder="20" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">Larghezza (cm)</label>
                        <Input required type="number" min="0" value={widthCm} onChange={(e) => setWidthCm(parseInt(e.target.value) || 0)} placeholder="20" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700">Altezza (cm)</label>
                        <Input required type="number" min="0" value={heightCm} onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)} placeholder="5" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 bg-blue-50 p-3 rounded border border-blue-100">
                      <strong>Come viene calcolata la spedizione nel carrello:</strong><br/>
                      Quando l'utente inserisce più pezzi o articoli diversi nel carrello, il sistema crea una "scatola virtuale":
                      <ul className="list-disc ml-4 mt-1 space-y-1">
                        <li><strong>Peso Totale:</strong> Viene sommato il peso di tutti gli articoli moltiplicato per la loro quantità.</li>
                        <li><strong>Volume:</strong> Viene calcolato il volume totale sommando le dimensioni.</li>
                        <li><strong>Dimensioni Virtuali:</strong> Si assume come Lato Massimo la lunghezza (L) più grande tra i prodotti e come Lato Medio la larghezza (P) più grande.</li>
                        <li><strong>Altezza impilata (H):</strong> Si calcola dividendo il Volume totale per (Lato Massimo × Lato Medio).</li>
                        <li><strong>Standard o Non Standard:</strong> Se la somma Lato Massimo + Lato Medio + Altezza impilata (L+P+H) è ≤ 80cm, la spedizione è Standard. Altrimenti è Non Standard.</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Immagine (carica dal PC)</label>
                    <div className="flex items-center gap-4">
                      <Input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="flex-1 cursor-pointer" />
                      {imageUrl && (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-slate-200 shadow-sm">
                          <img src={imageUrl} alt="Anteprima" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-slate-700">Banner Impatto (Solidale)</h4>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={impactEnabled} onChange={e => setImpactEnabled(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        Mostra banner su questo prodotto
                      </label>
                    </div>
                    
                    {impactEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700">Occhiello (Eyebrow)</label>
                          <Input value={impactEyebrow} onChange={e => setImpactEyebrow(e.target.value)} placeholder="Il tuo acquisto sostiene" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700">Titolo</label>
                          <Input value={impactTitle} onChange={e => setImpactTitle(e.target.value)} placeholder="Progetti e iniziative A-Tono ETS" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-medium text-slate-700">Descrizione</label>
                          <Textarea value={impactDescription} onChange={e => setImpactDescription(e.target.value)} rows={2} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700">Testo del Link</label>
                          <Input value={impactLinkLabel} onChange={e => setImpactLinkLabel(e.target.value)} placeholder="Scopri il programma sostenuto" />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700">URL del Link</label>
                          <Input value={impactHref} onChange={e => setImpactHref(e.target.value)} placeholder="https://ets.a-tono.com/progetti.html" />
                        </div>
                      </div>
                    )}
                  </div>
                  <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="mt-2 w-full sm:w-auto self-start">
                    {createProduct.isPending || updateProduct.isPending ? "Salvataggio..." : (editId ? "Aggiorna Prodotto" : "Salva Prodotto")}
                  </Button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "catalog" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Catalogo Attuale</h2>
              <div>
                {isLoadingProducts ? (
                  <p className="text-slate-500">Caricamento prodotti...</p>
                ) : productsError ? (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                    <p className="font-semibold mb-1">Errore nel caricamento del catalogo</p>
                    <p className="text-sm">Assicurati di aver pubblicato le ultime modifiche su Render. (Errore: {productsError.message})</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {products?.map((p, index) => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1 mr-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => moveUp(index)} disabled={index === 0 || reorderProducts.isPending}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => moveDown(index)} disabled={index === products.length - 1 || reorderProducts.isPending}>
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="h-14 w-14 rounded-md object-cover border border-slate-100" />
                          ) : (
                            <div className="h-14 w-14 rounded-md bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-200">
                              <Package size={24} />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900">{p.title}</div>
                            <div className="text-sm font-medium text-slate-500">€{p.priceAmount}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(p)}>Modifica</Button>
                          <Button variant="destructive" size="sm" onClick={() => { if(window.confirm("Sicuro di voler eliminare?")) deleteProduct.mutate({ id: p.id })}}>Elimina</Button>
                        </div>
                      </div>
                    ))}
                    {(!products || products.length === 0) && <p className="text-slate-500 p-4 border border-dashed rounded-xl text-center">Nessun prodotto presente nel catalogo.</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Ordini Ricevuti</h2>
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <OrdersSection />
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Costi di Spedizione</h2>
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <ShippingSettingsSection />
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Impostazioni Pagamento</h2>
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <PaymentSettingsSection />
              </div>
            </div>
          )}

          {activeTab === "checkout" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Personalizzazione Checkout</h2>
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <CheckoutFieldsSection />
              </div>
            </div>
          )}

          {activeTab === "receipt" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Configurazione Ricevuta PDF</h2>
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <ReceiptSettingsSection />
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Privacy e Informative</h2>
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <PrivacyDisclaimersSection />
              </div>
            </div>
          )}

          {activeTab === "admins" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Gestione Amministratori</h2>
              <div className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <h3 className="mb-4 text-xl font-semibold">Crea nuovo amministratore</h3>
                <form onSubmit={(e) => { e.preventDefault(); createAdmin.mutate({ username: newAdminUser, password: newAdminPass }); }} className="flex flex-col gap-4 max-w-sm">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
                    <Input required minLength={3} value={newAdminUser} onChange={(e) => setNewAdminUser(e.target.value)} placeholder="Es. mario.rossi" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                    <Input required minLength={6} type="password" value={newAdminPass} onChange={(e) => setNewAdminPass(e.target.value)} placeholder="Minimo 6 caratteri" />
                  </div>
                  <Button type="submit" disabled={createAdmin.isPending} className="mt-2 w-full">
                    {createAdmin.isPending ? "Creazione..." : "Crea Amministratore"}
                  </Button>
                </form>
              </div>

              <div>
                <h3 className="mb-4 text-xl font-semibold">Amministratori Registrati</h3>
                {isLoadingAdmins ? (
                  <p className="text-slate-500">Caricamento...</p>
                ) : (
                  <div className="flex flex-col gap-3 max-w-xl">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50">
                      <div className="font-medium text-slate-900">admin <span className="text-xs text-slate-500 ml-2 font-normal">(Account Principale - Non eliminabile)</span></div>
                    </div>
                    {admins?.map(a => (
                      <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="font-medium text-slate-900">{a.username}</div>
                        <Button variant="destructive" size="sm" onClick={() => { if(window.confirm("Sicuro di voler revocare l'accesso a questo utente?")) deleteAdmin.mutate({ id: a.id })}}>Revoca Accesso</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function PrivacyDisclaimersSection() {
  const utils = trpc.useUtils();
  const { data: disclaimers, isLoading } = trpc.admin.listPrivacyDisclaimers.useQuery();
  
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [isRequired, setIsRequired] = useState(true);

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setText("");
    setLink("");
    setIsRequired(true);
  };

  const createDisclaimer = trpc.admin.createPrivacyDisclaimer.useMutation({
    onSuccess: () => {
      toast.success("Disclaimer aggiunto!");
      resetForm();
      utils.admin.listPrivacyDisclaimers.invalidate();
      utils.commerce.listPrivacyDisclaimers.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const updateDisclaimer = trpc.admin.updatePrivacyDisclaimer.useMutation({
    onSuccess: () => {
      toast.success("Disclaimer aggiornato!");
      resetForm();
      utils.admin.listPrivacyDisclaimers.invalidate();
      utils.commerce.listPrivacyDisclaimers.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteDisclaimer = trpc.admin.deletePrivacyDisclaimer.useMutation({
    onSuccess: () => {
      toast.success("Disclaimer eliminato");
      utils.admin.listPrivacyDisclaimers.invalidate();
      utils.commerce.listPrivacyDisclaimers.invalidate();
    }
  });

  const handleEdit = (d: any) => {
    setEditId(d.id);
    setTitle(d.title);
    setText(d.text);
    setLink(d.link || "");
    setIsRequired(d.isRequired === 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={(e) => {
        e.preventDefault();
        if (editId !== null) {
          updateDisclaimer.mutate({ id: editId, title, text, link, isRequired });
        } else {
          createDisclaimer.mutate({ title, text, link, isRequired });
        }
      }} className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{editId !== null ? "Modifica Disclaimer" : "Aggiungi nuovo Disclaimer"}</h3>
          {editId !== null && <Button variant="ghost" onClick={resetForm}>Annulla</Button>}
        </div>
        <div>
          <label className="text-sm font-medium">Titolo interno (es. Accettazione Privacy)</label>
          <Input required value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Testo da mostrare all'utente (es. "Accetto il trattamento dei dati...")</label>
          <Input required value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Allega documento PDF (opzionale)</label>
          <Input type="file" accept="application/pdf" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setLink(reader.result as string);
              };
              reader.readAsDataURL(file);
            } else {
              setLink("");
            }
          }} />
          {link && link.startsWith('data:') && <p className="text-xs text-green-600 mt-1">PDF caricato e pronto per il salvataggio.</p>}
        </div>
        <label className="flex items-center gap-2 mt-2">
          <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} />
          <span className="text-sm font-medium">Obbligatorio per procedere con l'ordine</span>
        </label>
        <Button type="submit" disabled={createDisclaimer.isPending || updateDisclaimer.isPending} className="mt-2 w-auto self-start">
          {editId !== null ? "Aggiorna Disclaimer" : "Aggiungi"}
        </Button>
      </form>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Disclaimer Attivi al Checkout</h3>
        {isLoading ? <p>Caricamento...</p> : (
          <div className="flex flex-col gap-3">
            {disclaimers?.map(d => (
              <div key={d.id} className="border p-4 rounded bg-white flex justify-between items-start">
                <div>
                  <p className="font-bold">{d.title} {d.isRequired ? <span className="text-red-500">*</span> : ""}</p>
                  <p className="text-sm text-gray-600">{d.text}</p>
                  {d.link && <a href={d.link} target="_blank" rel="noreferrer" download={d.link.startsWith('data:') ? `${d.title}.pdf` : undefined} className="text-blue-500 text-xs mt-1 block">Vedi documento allegato</a>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(d)}>Modifica</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteDisclaimer.mutate({ id: d.id })}>Elimina</Button>
                </div>
              </div>
            ))}
            {disclaimers?.length === 0 && <p className="text-sm text-gray-500">Nessun disclaimer configurato. Non apparirà nulla al checkout.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersSection() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.admin.listOrders.useQuery();

  const deleteOrder = trpc.admin.deleteOrder.useMutation({
    onSuccess: () => {
      toast.success("Ordine eliminato.");
      utils.admin.listOrders.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteAllOrders = trpc.admin.deleteAllOrders.useMutation({
    onSuccess: () => {
      toast.success("Tutti gli ordini sono stati eliminati.");
      utils.admin.listOrders.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const updateReceipt = trpc.admin.updateOrderReceipt.useMutation({
    onSuccess: () => {
      toast.success("Distinta allegata e ordine aggiornato a Pagato.");
      utils.admin.listOrders.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const downloadCsv = () => {
    if (!orders || orders.length === 0) return;
    
    // Header
    const rows = [
      ["Data Ordine", "Data Pagamento", "Nome Cliente", "Email", "Totale", "Articoli Acquistati", "Stato", "Campi Aggiuntivi"]
    ];
    
    // Rows
    orders.forEach(o => {
      const dataOrd = new Date(o.createdAt).toLocaleString("it-IT");
      const dataPag = o.paymentDate ? new Date(o.paymentDate).toLocaleString("it-IT") : "";
      
      // escape quotes in itemsSummary
      const summary = `"${(o.itemsSummary || "").replace(/"/g, '""')}"`;
      
      let customFieldsStr = "";
      if (o.customFields) {
        try {
          const parsed = JSON.parse(o.customFields);
          customFieldsStr = `"${Object.entries(parsed).map(([k,v]) => `${k}: ${v}`).join('; ')}"`;
        } catch(e) {}
      }

      rows.push([dataOrd, dataPag, `"${o.customerName}"`, o.customerEmail, o.totalAmount, summary, o.status, customFieldsStr]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ordini_Sito_ETS_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAll = () => {
    if (window.confirm("SEI SICURO? Questa operazione eliminerà permanentemente TUTTI gli ordini dal database!")) {
      deleteAllOrders.mutate();
    }
  };

  const handleAdminReceiptUpload = (orderId: number, file: File) => {
    if (file.size > 1024 * 1024) {
      alert("Il file PDF supera la dimensione massima di 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updateReceipt.mutate({ id: orderId, paymentReceipt: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) return <p>Caricamento ordini...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Elenco Ordini Effettuati</h3>
        <div className="flex gap-2">
          <Button onClick={downloadCsv} disabled={!orders || orders.length === 0} variant="outline">
            Scarica CSV (Excel)
          </Button>
          <Button onClick={handleDeleteAll} disabled={!orders || orders.length === 0} variant="destructive">
            Elimina Tutti
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b">Data</th>
              <th className="p-3 border-b">Cliente</th>
              <th className="p-3 border-b max-w-[200px]">Articoli</th>
              <th className="p-3 border-b">Dettagli Extra</th>
              <th className="p-3 border-b">Pagamento</th>
              <th className="p-3 border-b">Totale</th>
              <th className="p-3 border-b text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map(o => {
              let customFieldsStr = "";
              if (o.customFields) {
                try {
                  const parsed = JSON.parse(o.customFields);
                  customFieldsStr = Object.entries(parsed).map(([k,v]) => `${k}: ${v}`).join(', ');
                } catch(e) {}
              }

              return (
                <tr key={o.id} className="border-b bg-white hover:bg-gray-50">
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium">Ordine:</div>
                    <div>{new Date(o.createdAt).toLocaleDateString("it-IT")}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{o.customerName}</div>
                    <div className="text-xs text-gray-500">{o.customerEmail}</div>
                  </td>
                  <td className="p-3 text-gray-600 text-xs">{o.itemsSummary}</td>
                  <td className="p-3 text-gray-600 text-xs italic">{customFieldsStr || "-"}</td>
                  <td className="p-3 text-xs">
                    {o.status === "paid" ? (
                      <span className="text-green-600 font-bold">Pagato</span>
                    ) : (
                      <span className="text-orange-500 font-bold">In attesa</span>
                    )}
                    {o.paymentDate && <div className="text-gray-500 mt-1">il {new Date(o.paymentDate).toLocaleDateString("it-IT")}</div>}
                    {o.paymentReceipt && (
                      <a href={o.paymentReceipt} download={`Distinta_${o.customerName.replace(/\s+/g, '_')}.pdf`} className="text-blue-500 hover:underline mt-1 block">
                        Scarica Distinta
                      </a>
                    )}
                    {!o.paymentReceipt && (
                      <div className="mt-2">
                        <label className="text-[10px] text-gray-500 block mb-1">Allega distinta da Email</label>
                        <input 
                          type="file" 
                          accept="application/pdf" 
                          className="max-w-[120px] text-[10px]"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleAdminReceiptUpload(o.id, e.target.files[0]);
                          }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-bold">{o.totalAmount}€</td>
                  <td className="p-3 text-right">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        if(window.confirm("Eliminare questo ordine?")) deleteOrder.mutate({ id: o.id });
                      }}
                    >
                      Elimina
                    </Button>
                  </td>
                </tr>
              );
            })}
            {orders?.length === 0 && (
              <tr>
                <td colSpan={7} className="p-5 text-center text-gray-500">Nessun ordine ricevuto.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentSettingsSection() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.admin.getSettings.useQuery();
  
  const [provider, setProvider] = useState("nessuno");
  const [stripePublic, setStripePublic] = useState("");
  const [stripeSecret, setStripeSecret] = useState("");
  const [paypalClient, setPaypalClient] = useState("");
  const [iban, setIban] = useState("");

  const updateSettings = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Impostazioni di pagamento salvate!");
      utils.admin.getSettings.invalidate();
      utils.commerce.settings.invalidate();
    },
    onError: (err) => toast.error(`Errore: ${err.message}`)
  });

  useEffect(() => {
    if (settings) {
      setProvider(settings.paymentProvider);
      setStripePublic(settings.stripePublicKey || "");
      setStripeSecret(settings.stripeSecretKey || "");
      setPaypalClient(settings.paypalClientId || "");
      setIban(settings.bankIban || "");
    }
  }, [settings]);

  if (isLoading) return <p>Caricamento impostazioni...</p>;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      updateSettings.mutate({
        paymentProvider: provider,
        stripePublicKey: stripePublic,
        stripeSecretKey: stripeSecret,
        paypalClientId: paypalClient,
        bankIban: iban
      });
    }} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Provider di Pagamento Attivo</label>
        <select 
          value={provider} 
          onChange={(e) => setProvider(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="nessuno">Nessuno (Checkout disabilitato)</option>
          <option value="stripe">Stripe (Carte di credito)</option>
          <option value="paypal">PayPal</option>
          <option value="bonifico">Bonifico Bancario</option>
        </select>
      </div>

      {provider === "stripe" && (
        <div className="space-y-4 p-4 border rounded bg-white">
          <h4 className="font-semibold text-sm">Configurazione Stripe</h4>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Chiave Pubblica (Publishable key)</label>
            <Input value={stripePublic} onChange={e => setStripePublic(e.target.value)} placeholder="pk_test_..." />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Chiave Segreta (Secret key)</label>
            <Input type="password" value={stripeSecret} onChange={e => setStripeSecret(e.target.value)} placeholder="sk_test_..." />
          </div>
        </div>
      )}

      {provider === "paypal" && (
        <div className="space-y-4 p-4 border rounded bg-white">
          <h4 className="font-semibold text-sm">Configurazione PayPal</h4>
          <div>
            <label className="mb-1 block text-xs text-gray-600">Client ID</label>
            <Input value={paypalClient} onChange={e => setPaypalClient(e.target.value)} placeholder="Inserisci il Client ID di PayPal" />
          </div>
        </div>
      )}

      {provider === "bonifico" && (
        <div className="space-y-4 p-4 border rounded bg-white">
          <h4 className="font-semibold text-sm">Coordinate Bancarie</h4>
          <div>
            <label className="mb-1 block text-xs text-gray-600">IBAN dell'Associazione</label>
            <Input value={iban} onChange={e => setIban(e.target.value)} placeholder="IT00A0000000000000000000000" />
          </div>
        </div>
      )}

      <Button type="submit" disabled={updateSettings.isPending} className="mt-2 w-full sm:w-auto self-start">
        {updateSettings.isPending ? "Salvataggio..." : "Salva Impostazioni"}
      </Button>
    </form>
  );
}

function CheckoutFieldsSection() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.admin.getSettings.useQuery();
  
  const [fields, setFields] = useState<Array<{ id: string, label: string, required: boolean, validationType?: string, width?: "full" | "half" }>>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newRequired, setNewRequired] = useState(false);

  const updateSettings = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Campi checkout aggiornati!");
      utils.admin.getSettings.invalidate();
      utils.commerce.settings.invalidate();
    },
    onError: (err) => toast.error(`Errore: ${err.message}`)
  });

  useEffect(() => {
    if (settings?.checkoutFields) {
      try {
        setFields(JSON.parse(settings.checkoutFields));
      } catch (e) {
        setFields([]);
      }
    } else {
      setFields([]);
    }
  }, [settings]);

  if (isLoading) return <p>Caricamento campi...</p>;

  const saveFields = (newFields: any[]) => {
    setFields(newFields);
    updateSettings.mutate({
      paymentProvider: settings?.paymentProvider || "nessuno",
      checkoutFields: JSON.stringify(newFields)
    });
  };

  const addField = () => {
    if (!newLabel.trim()) return;
    const newField = {
      id: "field_" + Date.now().toString(),
      label: newLabel,
      required: newRequired
    };
    saveFields([...fields, newField]);
    setNewLabel("");
    setNewRequired(false);
  };

  const removeField = (idToRemove: string) => {
    saveFields(fields.filter(f => f.id !== idToRemove));
  };

  const toggleRequired = (idToToggle: string) => {
    saveFields(fields.map(f => f.id === idToToggle ? { ...f, required: !f.required } : f));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Aggiungi nuovo campo al Checkout</h3>
        <p className="text-sm text-gray-600">Attenzione: Assicurati di avere almeno un campo con regola 'Email' e campi per 'Nome' e 'Cognome' per permettere il salvataggio corretto degli ordini.</p>
        <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded border">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium mb-1 block">Nome Campo (es. Telefono, Indirizzo di spedizione, Partita IVA)</label>
            <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Inserisci il nome del campo" />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input type="checkbox" checked={newRequired} onChange={e => setNewRequired(e.target.checked)} id="req-cb" />
            <label htmlFor="req-cb" className="text-sm">Obbligatorio</label>
          </div>
          <Button onClick={addField} type="button">Aggiungi Campo</Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Campi Aggiuntivi Attuali</h3>
        {fields.length === 0 ? (
          <p className="text-sm text-red-500 font-bold">Nessun campo configurato. Attenzione: il form di checkout sarà vuoto e gli ordini potrebbero fallire! Aggiungi subito i campi per Nome, Cognome ed Email.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {fields.map((f, i) => (
              <div key={f.id} className="flex flex-col gap-3 p-4 border rounded bg-white shadow-sm">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-slate-500 mb-1 block">Nome Campo</label>
                    <Input 
                      value={f.label} 
                      onChange={(e) => {
                        const newFields = [...fields];
                        newFields[i].label = e.target.value;
                        setFields(newFields);
                      }} 
                      onBlur={() => saveFields(fields)}
                    />
                  </div>
                  
                  <div className="w-[200px]">
                    <label className="text-xs text-slate-500 mb-1 block">Regola di Validazione</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={f.validationType || "none"}
                      onChange={(e) => {
                        const newFields = [...fields];
                        newFields[i].validationType = e.target.value;
                        saveFields(newFields);
                      }}
                    >
                      <option value="none">Testo Libero (Alfanumerico)</option>
                      <option value="name">Nome (di battesimo)</option>
                      <option value="surname">Cognome</option>
                      <option value="email">Email</option>
                      <option value="cap">CAP (Esattamente 5 cifre)</option>
                    </select>
                  </div>

                  <div className="w-[150px]">
                    <label className="text-xs text-slate-500 mb-1 block">Larghezza</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={f.width || "full"}
                      onChange={(e) => {
                        const newFields = [...fields];
                        newFields[i].width = e.target.value as "full" | "half";
                        saveFields(newFields);
                      }}
                    >
                      <option value="full">Riga Intera</option>
                      <option value="half">Metà Riga</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input 
                      type="checkbox" 
                      checked={f.required} 
                      onChange={(e) => {
                        const newFields = [...fields];
                        newFields[i].required = e.target.checked;
                        saveFields(newFields);
                      }}
                      id={`req-${f.id}`}
                    />
                    <label htmlFor={`req-${f.id}`} className="text-sm cursor-pointer">Obbligatorio</label>
                  </div>

                  <div className="pt-5 pl-4 ml-auto border-l flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (i === 0) return;
                        const newFields = [...fields];
                        [newFields[i - 1], newFields[i]] = [newFields[i], newFields[i - 1]];
                        saveFields(newFields);
                      }}
                      disabled={i === 0}
                    >
                      ↑
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (i === fields.length - 1) return;
                        const newFields = [...fields];
                        [newFields[i], newFields[i + 1]] = [newFields[i + 1], newFields[i]];
                        saveFields(newFields);
                      }}
                      disabled={i === fields.length - 1}
                    >
                      ↓
                    </Button>
                    <Button variant="ghost" className="text-red-500 ml-2" size="sm" onClick={() => removeField(f.id)}>
                      Elimina
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export type ShippingTier = {
  id: string;
  minWeight: number;
  maxWeight: number;
  standardPrice: string;
  nonStandardPrice: string;
};

const DEFAULT_TIERS: ShippingTier[] = [
  { id: "1", minWeight: 0, maxWeight: 3000, standardPrice: "10.30", nonStandardPrice: "15.30" },
  { id: "2", minWeight: 3000, maxWeight: 5000, standardPrice: "12.20", nonStandardPrice: "18.30" },
  { id: "3", minWeight: 5000, maxWeight: 10000, standardPrice: "14.30", nonStandardPrice: "21.30" },
  { id: "4", minWeight: 10000, maxWeight: 20000, standardPrice: "18.30", nonStandardPrice: "23.30" },
];

function ShippingSettingsSection() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.admin.getSettings.useQuery();
  
  const [tiers, setTiers] = useState<ShippingTier[]>([]);

  const updateSettings = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Regole di spedizione salvate!");
      utils.admin.getSettings.invalidate();
      utils.commerce.settings.invalidate();
    },
    onError: (err) => toast.error(`Errore: ${err.message}`)
  });

  useEffect(() => {
    if (settings) {
      if (settings.shippingConfig) {
        try {
          setTiers(JSON.parse(settings.shippingConfig));
        } catch (e) {
          setTiers(DEFAULT_TIERS);
        }
      } else {
        setTiers(DEFAULT_TIERS);
      }
    }
  }, [settings]);

  if (isLoading) return <p>Caricamento...</p>;

  const saveTiers = (newTiers: ShippingTier[]) => {
    setTiers(newTiers);
    updateSettings.mutate({
      paymentProvider: settings?.paymentProvider || "nessuno",
      shippingConfig: JSON.stringify(newTiers)
    });
  };

  const addTier = () => {
    const newTier: ShippingTier = {
      id: Date.now().toString(),
      minWeight: 0,
      maxWeight: 1000,
      standardPrice: "0.00",
      nonStandardPrice: "0.00"
    };
    saveTiers([...tiers, newTier]);
  };

  const removeTier = (id: string) => {
    saveTiers(tiers.filter(t => t.id !== id));
  };

  const updateTier = (id: string, field: keyof ShippingTier, value: string | number) => {
    const newTiers = tiers.map(t => t.id === id ? { ...t, [field]: value } : t);
    setTiers(newTiers);
  };

  return (
    <div>
      <p className="text-sm text-slate-600 mb-6">
        Qui puoi definire gli scaglioni di prezzo in base al peso totale del carrello e alle dimensioni calcolate. 
        Il pacco è considerato <b>Standard</b> se la somma virtuale dei lati (L+H+P) è ≤ 80cm, altrimenti è <b>Non Standard</b>.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
          <div className="col-span-3">Peso Minimo (g)</div>
          <div className="col-span-3">Peso Massimo (g)</div>
          <div className="col-span-2">Prezzo Standard (€)</div>
          <div className="col-span-2">Prezzo Non-Standard (€)</div>
          <div className="col-span-2 text-right">Azioni</div>
        </div>

        {tiers.map(t => (
          <div key={t.id} className="grid grid-cols-12 gap-4 items-center bg-slate-50 p-2 rounded-lg border">
            <div className="col-span-3">
              <Input type="number" value={t.minWeight} onChange={e => updateTier(t.id, 'minWeight', parseInt(e.target.value) || 0)} />
            </div>
            <div className="col-span-3">
              <Input type="number" value={t.maxWeight} onChange={e => updateTier(t.id, 'maxWeight', parseInt(e.target.value) || 0)} />
            </div>
            <div className="col-span-2">
              <Input type="number" step="0.01" value={t.standardPrice} onChange={e => updateTier(t.id, 'standardPrice', e.target.value)} />
            </div>
            <div className="col-span-2">
              <Input type="number" step="0.01" value={t.nonStandardPrice} onChange={e => updateTier(t.id, 'nonStandardPrice', e.target.value)} />
            </div>
            <div className="col-span-2 text-right">
              <Button variant="ghost" size="sm" onClick={() => removeTier(t.id)} className="text-red-500 hover:text-red-700">Rimuovi</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" onClick={addTier}>+ Aggiungi Scaglione</Button>
        <Button onClick={() => saveTiers(tiers)} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Salvataggio..." : "Salva Modifiche"}
        </Button>
      </div>
    </div>
  );
}

function ShopSettingsSection() {
  const [title, setTitle] = useState("Oggetti con un\\nsignificato.");
  const [description, setDescription] = useState("Scegli un oggetto da portare con te ogni giorno. Il tuo acquisto contribuisce a sostenere il lavoro e le iniziative di A-Tono ETS.");
  const utils = trpc.useUtils();
  
  const { data: settings } = trpc.commerce.settings.useQuery();

  useEffect(() => {
    if (settings?.shopTitle) setTitle(settings.shopTitle);
    if (settings?.shopDescription) setDescription(settings.shopDescription);
  }, [settings]);

  const updateSettings = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      alert("Testi dello shop salvati!");
      utils.commerce.settings.invalidate();
    }
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <p className="text-sm text-slate-600 mb-2">
        Modifica il testo introduttivo che appare in alto nella pagina dello shop.
      </p>
      
      <div>
        <label className="mb-2 block font-medium">Titolo (puoi usare \n per andare a capo)</label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Es. Oggetti con un\nsignificato."
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Testo di descrizione</label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Descrizione dello shop..."
          rows={4}
        />
      </div>

      <Button onClick={() => updateSettings.mutate({ shopTitle: title, shopDescription: description })} disabled={updateSettings.isPending}>
        {updateSettings.isPending ? "Salvataggio in corso..." : "Salva Testi"}
      </Button>
    </div>
  );
}

function ReceiptSettingsSection() {
  const [config, setConfig] = useState({
    logoUrl: "",
    bgImageUrl: "",
    title: "Riepilogo Ordine",
    introText: "",
    thankYouText: "Grazie per aver sostenuto A-Tono ETS!",
    tableColor: "#2b3e52",
    qrCodeUrl: "",
    logoWidth: 40,
    logoHeight: 20,
    qrCodeText: "Scopri di più sui nostri progetti inquadrando il QR Code!",
    contactsText: "Email: info@a-tono.com | Tel: +39 012 3456789",
    footerText: "A-Tono ETS - Tutti i diritti riservati",
    legalBlocks: [
      { title: "Termini e Condizioni", text: "I resi sono accettati entro 14 giorni. La spedizione..." }
    ]
  });
  
  const utils = trpc.useUtils();
  
  const { data: settings } = trpc.commerce.settings.useQuery();

  useEffect(() => {
    if (settings?.receiptConfig) {
      try {
        setConfig(prev => ({ ...prev, ...JSON.parse(settings.receiptConfig) }));
      } catch (e) {}
    }
  }, [settings]);

  const updateSettings = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      alert("Configurazione ricevuta PDF salvata!");
      utils.commerce.settings.invalidate();
    }
  });

  const handleSave = () => {
    updateSettings.mutate({ receiptConfig: JSON.stringify(config) });
  };

  const handleChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("L'immagine supera i 2MB. Scegli un'immagine più piccola.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange(field, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Logo (Opzionale)</label>
        <div className="flex flex-col gap-2">
          <input 
            type="file" 
            accept="image/png, image/jpeg"
            onChange={(e) => handleImageUpload("logoUrl", e)} 
            className="text-sm"
          />
          <p className="text-xs text-slate-500">Apparirà in alto nella ricevuta. (Scegli un'immagine, non incollare un URL web)</p>
          {config.logoUrl && config.logoUrl.startsWith("data:image") && (
             <div className="mt-2">
               <img src={config.logoUrl} alt="Preview Logo" className="h-12 object-contain border p-1 rounded bg-white" />
               <div className="flex gap-4 mt-3">
                 <div>
                   <label className="text-xs text-slate-600 block mb-1">Larghezza nel PDF (mm)</label>
                   <Input type="number" value={config.logoWidth} onChange={(e) => handleChange("logoWidth", e.target.value)} className="w-24 h-8 text-sm" />
                 </div>
                 <div>
                   <label className="text-xs text-slate-600 block mb-1">Altezza nel PDF (mm)</label>
                   <Input type="number" value={config.logoHeight} onChange={(e) => handleChange("logoHeight", e.target.value)} className="w-24 h-8 text-sm" />
                 </div>
               </div>
               <Button variant="ghost" size="sm" onClick={() => handleChange("logoUrl", "")} className="mt-2 text-red-500 hover:text-red-700">Rimuovi Logo</Button>
             </div>
          )}
        </div>
      </div>
      
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Immagine di Sfondo / Filigrana (Opzionale)</label>
        <div className="flex flex-col gap-2">
          <input 
            type="file" 
            accept="image/png, image/jpeg"
            onChange={(e) => handleImageUpload("bgImageUrl", e)} 
            className="text-sm"
          />
          {config.bgImageUrl && config.bgImageUrl.startsWith("data:image") && (
             <div className="mt-2">
               <img src={config.bgImageUrl} alt="Preview Sfondo" className="h-24 object-contain opacity-50 border p-1 rounded" />
               <Button variant="ghost" size="sm" onClick={() => handleChange("bgImageUrl", "")} className="mt-1 text-red-500 hover:text-red-700">Rimuovi Sfondo</Button>
             </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Titolo Documento</label>
        <Input 
          value={config.title} 
          onChange={(e) => handleChange("title", e.target.value)} 
          placeholder="Riepilogo Ordine" 
        />
      </div>
      
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Testo Introduttivo (Opzionale)</label>
        <Textarea 
          value={config.introText} 
          onChange={(e) => handleChange("introText", e.target.value)} 
          placeholder="Inserisci un testo introduttivo..." 
          rows={3} 
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Colore Principale Tabella Ordine</label>
        <div className="flex items-center gap-3">
          <input 
            type="color" 
            value={config.tableColor} 
            onChange={(e) => handleChange("tableColor", e.target.value)} 
            className="w-10 h-10 rounded cursor-pointer"
          />
          <Input 
            value={config.tableColor} 
            onChange={(e) => handleChange("tableColor", e.target.value)} 
            className="w-32 uppercase" 
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Testo di Ringraziamento (Fondo Pagina)</label>
        <Textarea 
          value={config.thankYouText} 
          onChange={(e) => handleChange("thankYouText", e.target.value)} 
          rows={2} 
        />
      </div>
      
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">URL per QR Code (Opzionale)</label>
        <Input 
          value={config.qrCodeUrl} 
          onChange={(e) => handleChange("qrCodeUrl", e.target.value)} 
          placeholder="Es. https://a-tono.org" 
        />
        <p className="text-xs text-slate-500 mt-1">Se inserito, verrà stampato in fondo al PDF.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Testo di accompagnamento al QR Code</label>
        <Textarea 
          value={config.qrCodeText} 
          onChange={(e) => handleChange("qrCodeText", e.target.value)} 
          placeholder="Scopri di più sui nostri progetti inquadrando il QR Code!" 
          rows={2} 
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Contatti (Email, Telefono...)</label>
        <Input 
          value={config.contactsText} 
          onChange={(e) => handleChange("contactsText", e.target.value)} 
          placeholder="Email: info@a-tono.com | Tel: +39 012 3456789" 
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Testo a Piè di Pagina (Footer)</label>
        <Input 
          value={config.footerText} 
          onChange={(e) => handleChange("footerText", e.target.value)} 
          placeholder="A-Tono ETS - Tutti i diritti riservati" 
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Blocchi Note Legali (Titolo in grassetto + Testo)</label>
        {config.legalBlocks?.map((block, index) => (
          <div key={index} className="flex flex-col gap-2 p-3 border rounded-md mb-3 bg-slate-50">
            <Input 
              value={block.title} 
              onChange={(e) => {
                const newBlocks = [...(config.legalBlocks || [])];
                newBlocks[index].title = e.target.value;
                handleChange("legalBlocks", newBlocks);
              }} 
              placeholder="Titolo (es: Termini e Condizioni)" 
            />
            <Textarea 
              value={block.text} 
              onChange={(e) => {
                const newBlocks = [...(config.legalBlocks || [])];
                newBlocks[index].text = e.target.value;
                handleChange("legalBlocks", newBlocks);
              }} 
              placeholder="Testo del paragrafo. Usa **testo** oppure <b>testo</b> per il grassetto." 
              rows={3}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="text-red-500 self-end h-8"
              onClick={() => {
                const newBlocks = [...(config.legalBlocks || [])];
                newBlocks.splice(index, 1);
                handleChange("legalBlocks", newBlocks);
              }}
            >
              Rimuovi Blocco
            </Button>
          </div>
        ))}
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => {
            const newBlocks = [...(config.legalBlocks || []), { title: "", text: "" }];
            handleChange("legalBlocks", newBlocks);
          }}
        >
          + Aggiungi Blocco Note Legali
        </Button>
      </div>

      <div className="flex justify-start gap-4 mt-4">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Salvataggio..." : "Salva Configurazione"}
        </Button>
      </div>
    </div>
  );
}
