const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Shop.tsx', 'utf8');

// Use custom categories instead of productType.
content = content.replace(
  /const { data: products = \[\], isLoading, isError } = trpc.commerce.products.list.useQuery\({ first: 24 }\);[\s\S]*?const filteredProducts = activeType === "Tutti" \? products : products.filter\(product => product.productType === activeType\);/,
  `const { data: products = [], isLoading, isError } = trpc.commerce.products.list.useQuery({ first: 100 });
  const { data: settings } = trpc.commerce.settings.useQuery();
  const { data: categories = [] } = trpc.commerce.listCategories.useQuery();
  const { data: productCategories = [] } = trpc.commerce.getAllProductCategories.useQuery();
  
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  
  // Set default category on load
  const { useEffect } = await import("react");
  useEffect(() => {
    if (categories.length > 0 && activeCategoryId === "all") {
      const defaultCat = categories.find(c => c.isDefault === 1);
      if (defaultCat) setActiveCategoryId(defaultCat.id);
    }
  }, [categories, activeCategoryId]);

  const filteredProducts = useMemo(() => {
    if (activeCategoryId === "all") return products;
    const allowedProductIds = new Set(productCategories.filter(pc => pc.categoryId === activeCategoryId).map(pc => pc.productId));
    return products.filter(p => allowedProductIds.has(p.id));
  }, [products, activeCategoryId, productCategories]);
  
  const rawTitle = settings?.shopTitle || "Oggetti con un\\nsignificato.";
  const titleParts = rawTitle.split("\\n");
  const description = settings?.shopDescription || "Scegli un oggetto da portare con te ogni giorno. Il tuo acquisto contribuisce a sostenere il lavoro e le iniziative di A-Tono ETS.";
  
  const noticeData = useMemo(() => {
    if (!settings?.shopNotice) return null;
    try {
      const parsed = JSON.parse(settings.shopNotice);
      return parsed.enabled ? parsed.content : null;
    } catch(e) { return null; }
  }, [settings?.shopNotice]);`
);

content = content.replace(
  /import \{ useMemo, useState \} from "react";/,
  'import { useMemo, useState, useEffect } from "react";'
);

content = content.replace(
  /const { data: settings } = trpc\.commerce\.settings\.useQuery\(\);/,
  '' // Already moved up
);

// We should remove the second `const rawTitle...` block since it's already generated above.
content = content.replace(
  /const rawTitle = settings\?\.shopTitle \|\| "Oggetti con un\\nsignificato\.";[\s\S]*?Scegli un oggetto da portare con te ogni giorno\. Il tuo acquisto contribuisce a sostenere il lavoro e le iniziative di A-Tono ETS\.";\s*const rawTitle/g,
  `const rawTitle`
);

// Update Categories pill bar
content = content.replace(
  /\{types\.length > 2 && <div className="mb-10 flex flex-wrap gap-2" aria-label="Filtra il catalogo">\{types\.map\(type => <button type="button" key=\{type\} onClick=\{\(\) => setActiveType\(type\)\} className=\{activeType === type \? "filter-chip filter-chip-active" : "filter-chip"\}>\{type\}<\/button>\)\}<\/div>\}/,
  `{categories.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2" aria-label="Filtra il catalogo">
              <button 
                type="button" 
                onClick={() => setActiveCategoryId("all")} 
                className={activeCategoryId === "all" ? "filter-chip filter-chip-active" : "filter-chip"}
              >
                Tutti
              </button>
              {categories.map(c => (
                <button 
                  type="button" 
                  key={c.id} 
                  onClick={() => setActiveCategoryId(c.id)} 
                  className={activeCategoryId === c.id ? "filter-chip filter-chip-active" : "filter-chip"}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
          
          {noticeData && (
            <div className="mb-10 p-6 bg-[#f7f9fa] border border-[#d9e5ed] rounded-lg prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-a:text-[#7a9cbf] text-[#2b3e52]" dangerouslySetInnerHTML={{ __html: noticeData }} />
          )}`
);

fs.writeFileSync('client/src/pages/Shop.tsx', content);
