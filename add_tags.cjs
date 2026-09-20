const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

// 1. Add hook call if missing
if (!content.includes('const { data: allProductCategories } = trpc.commerce.getAllProductCategories.useQuery();')) {
  content = content.replace(
    /const \[bulkCategoryId, setBulkCategoryId\] = useState<string>\(""\);/,
    `$&
  const { data: allProductCategories } = trpc.commerce.getAllProductCategories.useQuery();`
  );
}

// 2. Inject category pills into the product row
if (!content.includes('className="flex flex-wrap gap-1 mt-1"')) {
  content = content.replace(
    /<div className="font-semibold text-slate-900">\{p\.title\}<\/div>[\s]*<div className="text-sm font-medium text-slate-500">€\{p\.priceAmount\}<\/div>/,
    `$&
                            <div className="flex flex-wrap gap-1 mt-1">
                              {allProductCategories?.filter((pc: any) => pc.productId === p.id).map((pc: any) => {
                                const cat = categories?.find(c => c.id === pc.categoryId);
                                return cat ? <span key={pc.categoryId} className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{cat.name}</span> : null;
                              })}
                            </div>`
  );
}

// 3. Make sure assignCategories invalidates it
content = content.replace(
  /assignCategoriesToProducts\.useMutation\(\{[\s\S]*?onSuccess: \(\) => \{/,
  `$&
      utils.commerce.getAllProductCategories.invalidate();`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
