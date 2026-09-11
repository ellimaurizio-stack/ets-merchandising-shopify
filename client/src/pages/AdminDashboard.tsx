import { useState, useRef, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { ArrowUp, ArrowDown } from "lucide-react";

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

  const reorderProducts = trpc.admin.reorderProducts.useMutation({
    onSuccess: () => {
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
            <div className="flex flex-col gap-4">
              {products?.map((p, index) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1 mr-2">
                      <Button variant="ghost" size="icon" onClick={() => moveUp(index)} disabled={index === 0 || reorderProducts.isPending}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveDown(index)} disabled={index === products.length - 1 || reorderProducts.isPending}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
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
      <hr />

      {/* SEZIONE IMPOSTAZIONI PAGAMENTO */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Impostazioni Pagamento</h2>
        <div className="rounded-xl bg-slate-50 p-6 shadow-sm border border-slate-100">
          <PaymentSettingsSection />
        </div>
      </section>
      {/* SEZIONE CAMPI CHECKOUT */}
      <hr />
      <section>
        <h2 className="mb-4 text-2xl font-bold">Personalizzazione Checkout</h2>
        <div className="rounded-xl bg-slate-50 p-6 shadow-sm border border-slate-100 mb-6">
          <CheckoutFieldsSection />
        </div>
      </section>

      {/* SEZIONE PRIVACY E DISCLAIMER */}
      <hr />
      <section>
        <h2 className="mb-4 text-2xl font-bold">Privacy e Informative</h2>
        <div className="rounded-xl bg-slate-50 p-6 shadow-sm border border-slate-100 mb-6">
          <PrivacyDisclaimersSection />
        </div>
      </section>

      {/* SEZIONE ORDINI RICEVUTI */}
      <hr />
      <section>
        <h2 className="mb-4 text-2xl font-bold">Ordini Ricevuti</h2>
        <div className="rounded-xl bg-slate-50 p-6 shadow-sm border border-slate-100">
          <OrdersSection />
        </div>
      </section>
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
  
  const [fields, setFields] = useState<Array<{ id: string, label: string, required: boolean }>>([]);
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
        <p className="text-sm text-gray-600">Nota: Nome ed Email sono sempre richiesti per impostazione predefinita.</p>
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
          <p className="text-sm text-gray-500">Nessun campo aggiuntivo configurato. Verranno chiesti solo Nome ed Email.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {fields.map((f, i) => (
              <div key={f.id} className="flex justify-between items-center p-3 border rounded bg-white">
                <div>
                  <span className="font-medium">{f.label}</span>
                  {f.required ? <span className="ml-2 text-xs text-red-600 font-bold">Obbligatorio</span> : <span className="ml-2 text-xs text-gray-500">Opzionale</span>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleRequired(f.id)}>
                    {f.required ? "Rendi Opzionale" : "Rendi Obbligatorio"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removeField(f.id)}>Elimina</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
