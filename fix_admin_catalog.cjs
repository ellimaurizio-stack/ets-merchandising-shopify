const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

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

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
