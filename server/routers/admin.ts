import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { products, admins, storeSettings, privacyDisclaimers, orders } from "../../drizzle/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const adminRouter = router({
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // Controllo hardcoded di emergenza per il primo accesso
      if (input.username === "admin" && input.password === "admin123") {
        return { success: true, username: "admin" };
      }
      
      const result = await db.select().from(admins)
        .where(and(eq(admins.username, input.username), eq(admins.password, input.password)))
        .limit(1);
        
      if (result.length > 0) return { success: true, username: result[0].username };
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenziali non valide" });
    }),

  listAdmins: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const result = await db.select({ id: admins.id, username: admins.username }).from(admins);
    return result;
  }),

  createAdmin: publicProcedure
    .input(z.object({ username: z.string().min(3), password: z.string().min(6) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const existing = await db.select().from(admins).where(eq(admins.username, input.username));
      if (existing.length > 0) throw new TRPCError({ code: "CONFLICT", message: "Username già in uso" });
      
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
    return await db.select().from(products).orderBy(asc(products.sortOrder));
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
      priceAmount: z.string(),
      imageUrl: z.string().optional(),
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
        descriptionHtml: input.description || "",
        priceAmount: input.priceAmount,
        imageUrl: input.imageUrl || "",
      });
      
      return { id, handle };
    }),

  updateProduct: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      priceAmount: z.string(),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.update(products)
        .set({
          title: input.title,
          description: input.description || "",
          descriptionHtml: input.description || "",
          priceAmount: input.priceAmount,
          ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
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
    const result = await db.select().from(storeSettings).where(eq(storeSettings.id, "default")).limit(1);
    if (result.length > 0) return result[0];
    return { paymentProvider: "nessuno", stripePublicKey: "", stripeSecretKey: "", paypalClientId: "", bankIban: "", checkoutFields: "" };
  }),

  updateSettings: publicProcedure
    .input(z.object({
      paymentProvider: z.string(),
      stripePublicKey: z.string().optional(),
      stripeSecretKey: z.string().optional(),
      paypalClientId: z.string().optional(),
      bankIban: z.string().optional(),
      checkoutFields: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const existing = await db.select().from(storeSettings).where(eq(storeSettings.id, "default")).limit(1);
      
      if (existing.length > 0) {
        await db.update(storeSettings).set(input).where(eq(storeSettings.id, "default"));
      } else {
        await db.insert(storeSettings).values({ id: "default", ...input });
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

  listOrders: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    // We order by most recent first
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }),
});
