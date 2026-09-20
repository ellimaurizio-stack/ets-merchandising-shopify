import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { products, admins, storeSettings, privacyDisclaimers, orders, categories, productCategories } from "../../drizzle/schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";


async function ensureSchema(db: any) {
  try { await db.execute(sql`ALTER TABLE store_settings ADD COLUMN receiptConfig longtext`); } catch(e) {}
  try { await db.execute(sql`ALTER TABLE store_settings ADD COLUMN cartConfig longtext`); } catch(e) {}
  try { await db.execute(sql`ALTER TABLE store_settings ADD COLUMN bankEmail varchar(255)`); } catch(e) {}
  try { await db.execute(sql`ALTER TABLE store_settings ADD COLUMN shopNotice longtext`); } catch(e) {}
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id varchar(64) PRIMARY KEY,
        name varchar(255) NOT NULL,
        slug varchar(255) NOT NULL UNIQUE,
        isDefault int DEFAULT 0 NOT NULL,
        sortOrder int DEFAULT 0 NOT NULL,
        createdAt timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
  } catch(e) {}
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_categories (
        id int AUTO_INCREMENT PRIMARY KEY,
        productId varchar(64) NOT NULL,
        categoryId varchar(64) NOT NULL
      )
    `);
  } catch(e) {}
}

export const adminRouter = router({

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
            sql`productId = '${productId}' AND categoryId = '${input.categoryId}'`
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

  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      if (input.username === "admin" && input.password === "admin123") {
        return { success: true, username: "admin" };
      }
      
      try {
        const admin = await db.select().from(admins).where(eq(admins.username, input.username)).limit(1);
        if (!admin.length || admin[0].password !== input.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenziali non valide" });
        }
        return { success: true, username: admin[0].username };
      } catch (err: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database non inizializzato o tabelle mancanti." });
      }
    }),

  listAdmins: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const results = await db.select().from(admins);
    return results.map(a => ({ id: a.id, username: a.username }));
  }),

  createAdmin: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(admins).values({ username: input.username, password: input.password });
      return { success: true };
    }),

  deleteAdmin: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(admins).where(eq(admins.id, input.id));
      return { success: true };
    }),

  listProducts: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    try {
      return await db.select().from(products).orderBy(asc(products.sortOrder));
    } catch (err: any) {
      try {
        await db.execute(sql`ALTER TABLE products ADD COLUMN impactConfig longtext`);
        return await db.select().from(products).orderBy(asc(products.sortOrder));
      } catch (e) {
        throw err;
      }
    }
  }),

  reorderProducts: publicProcedure
    .input(z.array(z.object({ id: z.string(), sortOrder: z.number() })))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Update each product's sortOrder
      for (const item of input) {
        await db.update(products).set({ sortOrder: item.sortOrder }).where(eq(products.id, item.id));
      }
      return { success: true };
    }),

  createProduct: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      descriptionHtml: z.string().optional(),
      priceAmount: z.string(),
      imageUrl: z.string().optional(),
      weightGrams: z.number().optional().default(0),
      lengthCm: z.number().optional().default(0),
      widthCm: z.number().optional().default(0),
      heightCm: z.number().optional().default(0),
      impactConfig: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const id = nanoid();
      const handle = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + nanoid(4);
      
      await db.insert(products).values({
        id,
        handle,
        title: input.title,
        description: input.description || "",
        descriptionHtml: input.descriptionHtml || "",
        priceAmount: input.priceAmount,
        imageUrl: input.imageUrl || "",
        weightGrams: input.weightGrams,
        lengthCm: input.lengthCm,
        widthCm: input.widthCm,
        heightCm: input.heightCm,
        impactConfig: input.impactConfig || null,
      });
      
      return { id, handle };
    }),

  updateProduct: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      descriptionHtml: z.string().optional(),
      priceAmount: z.string(),
      imageUrl: z.string().optional(),
      weightGrams: z.number().optional(),
      lengthCm: z.number().optional(),
      widthCm: z.number().optional(),
      heightCm: z.number().optional(),
      impactConfig: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.update(products)
        .set({
          title: input.title,
          description: input.description || "",
          descriptionHtml: input.descriptionHtml || "",
          priceAmount: input.priceAmount,
          ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
          ...(input.weightGrams !== undefined ? { weightGrams: input.weightGrams } : {}),
          ...(input.lengthCm !== undefined ? { lengthCm: input.lengthCm } : {}),
          ...(input.widthCm !== undefined ? { widthCm: input.widthCm } : {}),
          ...(input.heightCm !== undefined ? { heightCm: input.heightCm } : {}),
          ...(input.impactConfig !== undefined ? { impactConfig: input.impactConfig || null } : {}),
        })
        .where(eq(products.id, input.id));
      
      return { success: true };
    }),

  deleteProduct: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  getSettings: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    await ensureSchema(db);
    try {
      const result = await db.select().from(storeSettings).where(eq(storeSettings.id, "default")).limit(1);
      if (result.length > 0) return result[0];
    } catch (err: any) {}
    return { paymentProvider: "nessuno", stripePublicKey: "", stripeSecretKey: "", paypalClientId: "", bankIban: "", checkoutFields: "", shippingConfig: "", receiptConfig: "", cartConfig: "", shopNotice: "" };
  }),
      
      updateSettings: publicProcedure
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

  listPrivacyDisclaimers: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(privacyDisclaimers).orderBy(asc(privacyDisclaimers.sortOrder));
  }),

  createPrivacyDisclaimer: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      text: z.string().min(1),
      link: z.string().optional(),
      isRequired: z.boolean()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.insert(privacyDisclaimers).values({
        title: input.title,
        text: input.text,
        link: input.link || "",
        isRequired: input.isRequired ? 1 : 0
      });
      return { success: true };
    }),

  updatePrivacyDisclaimer: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1),
      text: z.string().min(1),
      link: z.string().optional(),
      isRequired: z.boolean()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.update(privacyDisclaimers)
        .set({
          title: input.title,
          text: input.text,
          ...(input.link !== undefined ? { link: input.link } : {}),
          isRequired: input.isRequired ? 1 : 0
        })
        .where(eq(privacyDisclaimers.id, input.id));
      return { success: true };
    }),

  deletePrivacyDisclaimer: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(privacyDisclaimers).where(eq(privacyDisclaimers.id, input.id));
      return { success: true };
    }),

  reorderPrivacyDisclaimers: publicProcedure
    .input(z.array(z.number())) // Array of IDs in the new order
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Update sortOrder for each disclaimer based on its index in the array
      for (let i = 0; i < input.length; i++) {
        await db.update(privacyDisclaimers)
          .set({ sortOrder: i })
          .where(eq(privacyDisclaimers.id, input[i]));
      }
      
      return { success: true };
    }),

  listOrders: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    // We order by most recent first
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }),

  deleteOrder: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(orders).where(eq(orders.id, input.id));
      return { success: true };
    }),

  deleteAllOrders: publicProcedure
    .mutation(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(orders);
      return { success: true };
    }),

  updateOrderReceipt: publicProcedure
    .input(z.object({
      id: z.number(),
      paymentReceipt: z.string()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.update(orders)
        .set({
          paymentReceipt: input.paymentReceipt,
          paymentDate: new Date(),
          status: "paid"
        })
        .where(eq(orders.id, input.id));
      
      return { success: true };
    }),
});
