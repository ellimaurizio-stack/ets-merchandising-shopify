const fs = require('fs');
let content = fs.readFileSync('server/routers/admin.ts', 'utf8');

// 1. Add missing imports
if (!content.includes('categories')) {
  content = content.replace(
    /import \{ ([^}]+) \} from "\.\.\/\.\.\/drizzle\/schema";/,
    'import { $1, categories, productCategories } from "../../drizzle/schema";'
  );
}

// 2. Add ensureSchema helper
const ensureSchemaCode = `
async function ensureSchema(db: any) {
  try { await db.execute(sql\`ALTER TABLE store_settings ADD COLUMN receiptConfig longtext\`); } catch(e) {}
  try { await db.execute(sql\`ALTER TABLE store_settings ADD COLUMN cartConfig longtext\`); } catch(e) {}
  try { await db.execute(sql\`ALTER TABLE store_settings ADD COLUMN bankEmail varchar(255)\`); } catch(e) {}
  try { await db.execute(sql\`ALTER TABLE store_settings ADD COLUMN shopNotice longtext\`); } catch(e) {}
  try {
    await db.execute(sql\`
      CREATE TABLE IF NOT EXISTS categories (
        id varchar(64) PRIMARY KEY,
        name varchar(255) NOT NULL,
        slug varchar(255) NOT NULL UNIQUE,
        isDefault int DEFAULT 0 NOT NULL,
        sortOrder int DEFAULT 0 NOT NULL,
        createdAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    \`);
  } catch(e) {}
  try {
    await db.execute(sql\`
      CREATE TABLE IF NOT EXISTS product_categories (
        id int AUTO_INCREMENT PRIMARY KEY,
        productId varchar(64) NOT NULL,
        categoryId varchar(64) NOT NULL
      )
    \`);
  } catch(e) {}
}
`;

if (!content.includes('ensureSchema')) {
  content = content.replace(
    'export const adminRouter = router({',
    ensureSchemaCode + '\nexport const adminRouter = router({'
  );
}

// 3. Update getSettings
content = content.replace(
  /getSettings: publicProcedure\.query\(async \(\{ ctx \}\) => \{[\s\S]*?return \{ paymentProvider: "nessuno"[\s\S]*?\}\);/g,
  `getSettings: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    await ensureSchema(db);
    try {
      const result = await db.select().from(storeSettings).where(eq(storeSettings.id, "default")).limit(1);
      if (result.length > 0) return result[0];
    } catch (err: any) {}
    return { paymentProvider: "nessuno", stripePublicKey: "", stripeSecretKey: "", paypalClientId: "", bankIban: "", checkoutFields: "", shippingConfig: "", receiptConfig: "", cartConfig: "", shopNotice: "" };
  }),`
);

// 4. Update updateSettings
content = content.replace(
  /updateSettings: publicProcedure[\s\S]*?\}\),[\s]*listPrivacyDisclaimers:/g,
  `updateSettings: publicProcedure
    .input(z.object({
      paymentProvider: z.string().optional(),
      stripePublicKey: z.string().optional(),
      stripeSecretKey: z.string().optional(),
      paypalClientId: z.string().optional(),
      bankIban: z.string().optional(),
      bankEmail: z.string().optional(),
      checkoutFields: z.string().optional(),
      shippingConfig: z.string().optional(),
      shopTitle: z.string().optional(),
      shopDescription: z.string().optional(),
      receiptConfig: z.string().optional(),
      cartConfig: z.string().optional(),
      shopNotice: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await ensureSchema(db);
      const existing = await db.select().from(storeSettings).where(eq(storeSettings.id, "default")).limit(1);
      if (existing.length > 0) {
        await db.update(storeSettings).set(input).where(eq(storeSettings.id, "default"));
      } else {
        await db.insert(storeSettings).values({ id: "default", paymentProvider: input.paymentProvider || "nessuno", ...input });
      }
      return { success: true };
    }),
    
  listPrivacyDisclaimers:`
);

// 5. Add categories routers
const categoriesRouterCode = `
  listCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    await ensureSchema(db);
    return await db.select().from(categories).orderBy(asc(categories.sortOrder));
  }),

  createCategory: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await ensureSchema(db);
      
      const id = crypto.randomUUID();
      
      if (input.isDefault) {
        await db.update(categories).set({ isDefault: 0 });
      }
      
      await db.insert(categories).values({
        id,
        name: input.name,
        slug: input.slug,
        isDefault: input.isDefault ? 1 : 0
      });
      return { id };
    }),

  updateCategory: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      slug: z.string().min(1),
      isDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await ensureSchema(db);
      
      if (input.isDefault) {
        await db.update(categories).set({ isDefault: 0 });
      }
      
      await db.update(categories)
        .set({
          name: input.name,
          slug: input.slug,
          isDefault: input.isDefault ? 1 : 0
        })
        .where(eq(categories.id, input.id));
      return { success: true };
    }),

  deleteCategory: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.delete(productCategories).where(eq(productCategories.categoryId, input.id));
      await db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),

  reorderCategories: publicProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      for (let i = 0; i < input.length; i++) {
        await db.update(categories)
          .set({ sortOrder: i })
          .where(eq(categories.id, input[i]));
      }
      return { success: true };
    }),
    
  assignCategoriesToProducts: publicProcedure
    .input(z.object({
      productIds: z.array(z.string()),
      categoryId: z.string()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      for (const productId of input.productIds) {
        // Check if already assigned
        const existing = await db.select().from(productCategories)
          .where(
            sql\`productId = '\${productId}' AND categoryId = '\${input.categoryId}'\`
          );
        
        if (existing.length === 0) {
          await db.insert(productCategories).values({
            productId,
            categoryId: input.categoryId
          });
        }
      }
      return { success: true };
    }),

  getProductCategories: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      await ensureSchema(db);
      
      return await db.select().from(productCategories).where(eq(productCategories.productId, input.productId));
    }),

  setProductCategories: publicProcedure
    .input(z.object({
      productId: z.string(),
      categoryIds: z.array(z.string())
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.delete(productCategories).where(eq(productCategories.productId, input.productId));
      
      for (const categoryId of input.categoryIds) {
        await db.insert(productCategories).values({
          productId: input.productId,
          categoryId
        });
      }
      return { success: true };
    }),
`;

if (!content.includes('listCategories: publicProcedure')) {
  content = content.replace(
    'export const adminRouter = router({',
    'export const adminRouter = router({\n' + categoriesRouterCode
  );
}

fs.writeFileSync('server/routers/admin.ts', content);
