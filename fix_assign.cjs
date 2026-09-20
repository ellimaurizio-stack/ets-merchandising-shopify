const fs = require('fs');
let content = fs.readFileSync('server/routers/admin.ts', 'utf8');

content = content.replace(
  /sql\`productId = '\$\{productId\}' AND categoryId = '\$\{input\.categoryId\}'\`/g,
  `and(eq(productCategories.productId, productId), eq(productCategories.categoryId, input.categoryId))`
);

fs.writeFileSync('server/routers/admin.ts', content);
