const fs = require('fs');
let content = fs.readFileSync('server/routers/commerce.ts', 'utf8');

if (!content.includes('getAllProductCategories:')) {
  content = content.replace(
    /getProductCategories:/,
    `getAllProductCategories: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try { return await db.select().from(productCategories); } catch(e) { return []; }
    }),
    $&`
  );
  fs.writeFileSync('server/routers/commerce.ts', content);
}
