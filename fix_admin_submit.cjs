const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(
  /if \(editId\) \{\s*updateProduct\.mutate\(\{([^}]+)\}\);\s*\} else \{\s*createProduct\.mutate\(\{([^}]+)\}\);\s*\}/g,
  `if (editId) {
      updateProduct.mutate({$1}, {
        onSuccess: () => {
          setProductCategories.mutate({ productId: editId, categoryIds: selectedCategories });
        }
      });
    } else {
      createProduct.mutate({$2}, {
        onSuccess: (newProd) => {
          // Wait, createProduct doesn't return the ID right now.
          // Let's just invalidate the queries, wait, if we don't have the ID, we can't save categories for new products immediately here unless createProduct returns it.
        }
      });
    }`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
