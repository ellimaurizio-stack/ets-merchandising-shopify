const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

// 1. Add imports
if (!content.includes('RichTextEditor')) {
  content = content.replace(
    /import \{ Button \} from "\.\.\/components\/ui\/button";/,
    'import { Button } from "../components/ui/button";\nimport { RichTextEditor } from "../components/ui/RichTextEditor";'
  );
}

// 2. Add Tab type
content = content.replace(
  /type Tab = "general" \| "products" \| "catalog" \| "orders" \| "shipping" \| "payment" \| "checkout" \| "cart" \| "receipt" \| "privacy" \| "admins";/,
  'type Tab = "general" | "products" | "categories" | "catalog" | "orders" | "shipping" | "payment" | "checkout" | "cart" | "receipt" | "privacy" | "admins";'
);

// 3. Add sidebar button for categories
content = content.replace(
  /<button onClick=\{\(\) => setActiveTab\("products"\)\}[\s\S]*?<\/button>/,
  `$&
          <button onClick={() => setActiveTab("categories")} className={\`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium \${activeTab === "categories" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}\`}>
            <FolderTree size={20} className={activeTab === "categories" ? "text-blue-200" : "text-slate-400"} />
            Categorie
          </button>`
);

// Add FolderTree icon import if missing
if (!content.includes('FolderTree')) {
  content = content.replace(
    /import \{ ([^}]+) \} from "lucide-react";/,
    'import { $1, FolderTree } from "lucide-react";'
  );
}

// 4. Add CategoriesSection function definition
const categoriesSectionCode = `
function CategoriesSection() {
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.admin.listCategories.useQuery();
  const createCategory = trpc.admin.createCategory.useMutation({
    onSuccess: () => utils.admin.listCategories.invalidate()
  });
  const updateCategory = trpc.admin.updateCategory.useMutation({
    onSuccess: () => utils.admin.listCategories.invalidate()
  });
  const deleteCategory = trpc.admin.deleteCategory.useMutation({
    onSuccess: () => utils.admin.listCategories.invalidate()
  });
  const reorderCategories = trpc.admin.reorderCategories.useMutation({
    onSuccess: () => utils.admin.listCategories.invalidate()
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleEdit = (c: any) => {
    setEditId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setIsDefault(c.isDefault === 1);
  };

  const handleSave = () => {
    if (editId) {
      updateCategory.mutate({ id: editId, name, slug, isDefault });
    } else {
      createCategory.mutate({ name, slug, isDefault });
    }
    setEditId(null);
    setName("");
    setSlug("");
    setIsDefault(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Sicuro di voler eliminare questa categoria? I prodotti al suo interno non verranno eliminati.")) {
      deleteCategory.mutate({ id });
    }
  };

  const moveUp = (index: number) => {
    if (index === 0 || !categories) return;
    const newOrder = [...categories];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    reorderCategories.mutate(newOrder.map(c => c.id));
  };

  const moveDown = (index: number) => {
    if (!categories || index === categories.length - 1) return;
    const newOrder = [...categories];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    reorderCategories.mutate(newOrder.map(c => c.id));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-lg font-bold mb-4">{editId ? "Modifica Categoria" : "Nuova Categoria"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nome</label>
            <Input value={name} onChange={e => {
              setName(e.target.value);
              if (!editId) {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
              }
            }} placeholder="Es. Strenne di Natale" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Slug (URL)</label>
            <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="strenne-di-natale" />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} id="isDefaultCat" />
            <label htmlFor="isDefaultCat" className="text-sm cursor-pointer">Imposta come Categoria Predefinita (aperta all'avvio)</label>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleSave} disabled={!name || !slug}>{editId ? "Aggiorna" : "Crea"}</Button>
          {editId && <Button variant="outline" onClick={() => { setEditId(null); setName(""); setSlug(""); setIsDefault(false); }}>Annulla</Button>}
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {categories?.map((c, index) => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveUp(index)} disabled={index === 0}><ArrowUp className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveDown(index)} disabled={index === categories.length - 1}><ArrowDown className="h-3 w-3" /></Button>
              </div>
              <div>
                <h4 className="font-bold flex items-center gap-2">{c.name} {c.isDefault === 1 && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Default</span>}</h4>
                <p className="text-sm text-slate-500">/{c.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(c)}>Modifica</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>Elimina</Button>
            </div>
          </div>
        ))}
        {categories?.length === 0 && <p className="text-slate-500">Nessuna categoria creata.</p>}
      </div>
    </div>
  );
}
`;

if (!content.includes('function CategoriesSection()')) {
  content = content.replace(
    'export default function AdminDashboard() {',
    categoriesSectionCode + '\nexport default function AdminDashboard() {'
  );
}

// 5. Add activeTab === "categories"
if (!content.includes('activeTab === "categories"')) {
  content = content.replace(
    /\{activeTab === "products" && \([\s\S]*?<\/div>[\s]*\)}/,
    `$&
          {activeTab === "categories" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Categorie</h2>
              <CategoriesSection />
            </div>
          )}`
  );
}

// 6. Update ShopSettingsSection to include shopNotice and RichTextEditor
content = content.replace(
  /function ShopSettingsSection\(\) \{[\s\S]*?const \[description, setDescription\] = useState\([^)]*\);/,
  `function ShopSettingsSection() {
  const [title, setTitle] = useState("Oggetti con un\\nsignificato.");
  const [description, setDescription] = useState("Scegli un oggetto da portare con te ogni giorno. Il tuo acquisto contribuisce a sostenere il lavoro e le iniziative di A-Tono ETS.");
  const [shopNotice, setShopNotice] = useState("");
  const [noticeEnabled, setNoticeEnabled] = useState(false);`
);

content = content.replace(
  /if \(settings\?\.shopDescription\) setDescription\(settings\.shopDescription\);/,
  `$&
    if (settings?.shopNotice) {
      try {
        const parsed = JSON.parse(settings.shopNotice);
        setShopNotice(parsed.content || "");
        setNoticeEnabled(parsed.enabled || false);
      } catch(e) {
        setShopNotice(settings.shopNotice);
      }
    }`
);

content = content.replace(
  /updateSettings\.mutate\(\{([^}]+)\}\)/g,
  `updateSettings.mutate({$1, shopNotice: JSON.stringify({ enabled: noticeEnabled, content: shopNotice })})`
);

// We must also find the Save button click in ShopSettingsSection. 
// Wait, ShopSettingsSection uses a form or a button? Let's check how it saves.
// I will just modify the return statement of ShopSettingsSection.
content = content.replace(
  /<Button onClick=\{\(\) => updateSettings.mutate\([\s\S]*?<\/Button>/,
  `<Button onClick={() => updateSettings.mutate({ shopTitle: title, shopDescription: description, shopNotice: JSON.stringify({ enabled: noticeEnabled, content: shopNotice }) })} disabled={updateSettings.isPending} className="mt-4">
        {updateSettings.isPending ? "Salvataggio..." : "Salva Testi e Avviso"}
      </Button>`
);

content = content.replace(
  /<\/div>\s*<Button onClick/,
  `</div>
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">Avviso Negozio (Sopra ai prodotti)</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={noticeEnabled} onChange={e => setNoticeEnabled(e.target.checked)} className="rounded" />
            Mostra avviso
          </label>
        </div>
        <p className="text-sm text-slate-500 mb-4">Usa questo editor per formattare messaggi importanti (es. tempistiche, resi). Il testo apparirà sopra la lista dei prodotti.</p>
        <div className={!noticeEnabled ? "opacity-50 pointer-events-none" : ""}>
          <RichTextEditor value={shopNotice} onChange={setShopNotice} />
        </div>
      </div>
      <Button onClick`
);


fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
