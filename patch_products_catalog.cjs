const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

// For ProductsSection, we need to add Categories multiselect.
// Since it's inside `export default function AdminDashboard`, we need to find where the impact banner is in `ProductsSection` and add categories before it.
if (!content.includes('const { data: categories } = trpc.admin.listCategories.useQuery()')) {
  content = content.replace(
    /const createProduct = trpc\.admin\.createProduct\.useMutation/,
    `const { data: categories } = trpc.admin.listCategories.useQuery();\n  const getProductCategories = trpc.admin.getProductCategories.useQuery({ productId: editId || "" }, { enabled: !!editId });\n  const setProductCategories = trpc.admin.setProductCategories.useMutation();\n  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);\n\n  // sync selected categories when editId changes\n  useEffect(() => {\n    if (editId && getProductCategories.data) {\n      setSelectedCategories(getProductCategories.data.map(pc => pc.categoryId));\n    } else if (!editId) {\n      setSelectedCategories([]);\n    }\n  }, [editId, getProductCategories.data]);\n\n  $&`
  );
}

// When product saves, save categories too
if (!content.includes('setProductCategories.mutate')) {
  content = content.replace(
    /createProduct\.mutate\([\s\S]*?onSuccess: \(\) => \{/g,
    `$&
            if (selectedCategories.length > 0) {
              // Wait for product creation then set categories. 
              // To be safe we should actually just do it in the router, but here we can do it assuming id is same.
            }`
  );
  // Actually, createProduct takes the ID we give it (input.id).
  // So we can just call setProductCategories immediately after.
}

content = content.replace(
  /const handleSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?e\.preventDefault\(\);/g,
  `$&
    const handleSaveCategories = (prodId: string) => {
      setProductCategories.mutate({ productId: prodId, categoryIds: selectedCategories });
    };`
);

content = content.replace(
  /createProduct\.mutate\(\{([^}]+)\}, \{[\s]*onSuccess: \(\) => \{/g,
  `createProduct.mutate({$1}, { onSuccess: () => { handleSaveCategories(id); `
);

content = content.replace(
  /updateProduct\.mutate\(\{([^}]+)\}, \{[\s]*onSuccess: \(\) => \{/g,
  `updateProduct.mutate({$1}, { onSuccess: () => { handleSaveCategories(editId || id); `
);

// Render category checkboxes
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

// For CatalogSection, we want a bulk action dropdown.
content = content.replace(
  /const \{ data: products, error: productsError, isLoading: isLoadingProducts \} = trpc\.admin\.listProducts\.useQuery\(\);/,
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

// Add bulk action UI above catalog
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

// Add checkboxes to catalog items
content = content.replace(
  /<div className="flex flex-col gap-1 mr-2">/,
  `<input 
                              type="checkbox" 
                              className="mr-3 h-5 w-5 rounded border-slate-300"
                              checked={selectedProductIds.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                                else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                              }}
                            />$&`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
