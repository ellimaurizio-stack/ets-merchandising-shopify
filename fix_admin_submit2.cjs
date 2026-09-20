const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(
  /if \(editId\) \{[\s\S]*?\}\s*\}\);\s*\}/,
  `if (editId) {
      updateProduct.mutate({ id: editId, title, priceAmount, imageUrl, description, descriptionHtml, weightGrams, lengthCm, widthCm, heightCm, impactConfig }, {
        onSuccess: () => {
          setProductCategories.mutate({ productId: editId, categoryIds: selectedCategories });
        }
      });
    } else {
      createProduct.mutate({ title, priceAmount, imageUrl, description, descriptionHtml, weightGrams, lengthCm, widthCm, heightCm, impactConfig }, {
        onSuccess: (res) => {
          setProductCategories.mutate({ productId: res.id, categoryIds: selectedCategories });
        }
      });
    }`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
