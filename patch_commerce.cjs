const fs = require('fs');
let content = fs.readFileSync('server/routers/commerce.ts', 'utf8');

if (!content.includes('categories')) {
  content = content.replace(
    /import \{ ([^}]+) \} from "\.\.\/\.\.\/drizzle\/schema";/,
    'import { $1, categories, productCategories } from "../../drizzle/schema";'
  );
}

if (!content.includes('shopNotice')) {
  content = content.replace(
    /cartConfig: z\.string\(\)\.nullable\(\),/,
    'cartConfig: z.string().nullable(),\n      shopNotice: z.string().nullable(),'
  );
  content = content.replace(
    /cartConfig: record\.cartConfig,/,
    'cartConfig: record.cartConfig,\n        shopNotice: record.shopNotice,'
  );
  content = content.replace(
    /cartConfig: "",/,
    'cartConfig: "", shopNotice: "",'
  );
}

const categoriesCode = `
  listCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      return await db.select().from(categories).orderBy(asc(categories.sortOrder));
    } catch(e) { return []; }
  }),
  
  getProductCategories: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        return await db.select().from(productCategories).where(eq(productCategories.productId, input.productId));
      } catch(e) { return []; }
    }),
`;

if (!content.includes('listCategories:')) {
  content = content.replace(
    'export const commerceRouter = router({',
    'export const commerceRouter = router({\n' + categoriesCode
  );
}

fs.writeFileSync('server/routers/commerce.ts', content);
