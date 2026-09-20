const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

content = content.replace(
  /const setProductCategories = trpc\.admin\.setProductCategories\.useMutation\(\);/,
  `const setProductCategories = trpc.admin.setProductCategories.useMutation({
    onSuccess: () => {
      utils.commerce.getAllProductCategories.invalidate();
    }
  });`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content);
