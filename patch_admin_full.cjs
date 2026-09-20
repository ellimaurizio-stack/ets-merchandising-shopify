const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

// 1. Add categories to Tab type (if not already there)
if (!content.includes(' | "categories"')) {
  content = content.replace(
    /type Tab = "general" \| "products" /,
    'type Tab = "general" | "products" | "categories" '
  );
}

// 2. Add Categorie button in sidebar
if (!content.includes('setActiveTab("categories")')) {
  content = content.replace(
    /<button onClick=\{\(\) => setActiveTab\("products"\)\}[\s\S]*?<\/button>/,
    `$&
          <button onClick={() => setActiveTab("categories")} className={\`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium \${activeTab === "categories" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}\`}>
            <FolderTree size={20} className={activeTab === "categories" ? "text-blue-200" : "text-slate-400"} />
            Categorie
          </button>`
  );
}

// Add FolderTree icon import if missing
if (!content.includes('FolderTree')) {
  content = content.replace(
    /import \{ ([^}]+) \} from "lucide-react";/,
    'import { $1, FolderTree } from "lucide-react";'
  );
}

// 3. Add CategoriesSection logic
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

  const handleCatSave = () => {
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
          <Button onClick={handleCatSave} disabled={!name || !slug}>{editId ? "Aggiorna" : "Crea"}</Button>
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

// 4. Render Categories tab
if (!content.includes('<CategoriesSection />')) {
  content = content.replace(
    /\{activeTab === "products" && \([\s\S]*?<\/div>\s*\)\}/,
    `$&
          {activeTab === "categories" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="mb-6 text-3xl font-bold tracking-tight">Categorie</h2>
              <CategoriesSection />
            </div>
          )}`
  );
}

// 5. Add hooks to AdminDashboard main component
if (!content.includes('const { data: categories } = trpc.admin.listCategories.useQuery();')) {
  content = content.replace(
    /const createProduct = trpc\.admin\.createProduct\.useMutation/,
    `const { data: categories } = trpc.admin.listCategories.useQuery();
  const getProductCategories = trpc.admin.getProductCategories.useQuery({ productId: editId || "" }, { enabled: !!editId });
  const setProductCategories = trpc.admin.setProductCategories.useMutation({
    onSuccess: () => utils.admin.listProducts.invalidate()
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  useEffect(() => {
    if (editId && getProductCategories.data) {
      setSelectedCategories(getProductCategories.data.map(pc => pc.categoryId));
    } else if (!editId) {
      setSelectedCategories([]);
    }
  }, [editId, getProductCategories.data]);

  $&`
  );
}

// 6. Inject product edit checkboxes
if (!content.includes('h4 className="font-semibold text-sm text-slate-700 mb-2">Categorie</h4>')) {
  content = content.replace(
    /<div className="p-4 border rounded-lg bg-slate-50 space-y-3">[\s]*<div className="flex items-center justify-between">[\s]*<h4 className="font-semibold text-sm text-slate-700">Banner Impatto/,
    `<div className="p-4 border rounded-lg bg-white space-y-3">
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Categorie</h4>
                    {categories?.length === 0 ? <p className="text-xs text-slate-500">Nessuna categoria creata.</p> : (
                      <div className="flex flex-wrap gap-3">
                        {categories?.map(c => (
                          <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded hover:bg-slate-50">
                            <input 
                              type="checkbox" 
                              className="rounded"
                              checked={selectedCategories.includes(c.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedCategories([...selectedCategories, c.id]);
                                else setSelectedCategories(selectedCategories.filter(id => id !== c.id));
                              }}
                            />
                            {c.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  $&`
  );
}

// 7. Inject Catalog bulk action hooks and UI
if (!content.includes('const [selectedProductIds, setSelectedProductIds] = useState<string[]>')) {
  content = content.replace(
    /const \{ data: products, isLoading: isLoadingProducts, error: productsError \} = trpc\.admin\.listProducts\.useQuery\(undefined, \{ enabled: isAdmin \}\);/,
    `$&
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkCategoryId, setBulkCategoryId] = useState<string>("");
  const assignCategories = trpc.admin.assignCategoriesToProducts.useMutation({
    onSuccess: () => {
      alert("Categorie assegnate con successo!");
      setSelectedProductIds([]);
      setBulkCategoryId("");
    }
  });`
  );
  
  content = content.replace(
    /<h2 className="mb-6 text-3xl font-bold tracking-tight">Catalogo Attuale<\/h2>/,
    `$&
              {categories && categories.length > 0 && (
                <div className="mb-6 p-4 bg-slate-50 border rounded-lg flex items-center justify-between">
                  <div className="text-sm">
                    <strong>Azione Massiva:</strong> Seleziona i prodotti in basso e assegnali a una categoria.
                    <div className="text-xs text-slate-500 mt-1">{selectedProductIds.length} prodotti selezionati</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      className="border rounded px-3 py-2 text-sm"
                      value={bulkCategoryId}
                      onChange={e => setBulkCategoryId(e.target.value)}
                    >
                      <option value="">Seleziona Categoria...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Button 
                      disabled={!bulkCategoryId || selectedProductIds.length === 0 || assignCategories.isPending}
                      onClick={() => assignCategories.mutate({ productIds: selectedProductIds, categoryId: bulkCategoryId })}
                    >
                      Applica
                    </Button>
                  </div>
                </div>
              )}`
  );
  
  content = content.replace(
    /<div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">[\s]*<div className="flex items-center gap-4">[\s]*<div className="flex flex-col gap-1 mr-2">/,
    `<div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <input 
                              type="checkbox" 
                              className="mr-3 h-5 w-5 rounded border-slate-300"
                              checked={selectedProductIds.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                                else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                              }}
                            />
                            <div className="flex flex-col gap-1 mr-2">`
  );
}


fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
