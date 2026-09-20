const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(
  /const handleProductSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?if \(editId\) \{[\s\S]*?updateProduct\.mutate\(\{([^}]+)\}\);[\s\S]*?\} else \{[\s\S]*?createProduct\.mutate\(\{([^}]+)\}\);[\s\S]*?\}[\s\S]*?\};/,
  `const handleProductSubmit = (e: React.FormEvent) => {
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
      updateProduct.mutate({ $1 }, {
        onSuccess: () => {
          setProductCategories.mutate({ productId: editId, categoryIds: selectedCategories });
        }
      });
    } else {
      createProduct.mutate({ $2 }, {
        onSuccess: (res) => {
          if (res && res.id) {
            setProductCategories.mutate({ productId: res.id, categoryIds: selectedCategories });
          }
        }
      });
    }
  };`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
