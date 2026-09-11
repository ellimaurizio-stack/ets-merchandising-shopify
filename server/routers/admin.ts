import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { products, admins } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
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
    return await db.select().from(products);
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
});
