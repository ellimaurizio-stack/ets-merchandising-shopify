import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const adminRouter = router({
  listProducts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return await db.select().from(products);
  }),

  createProduct: protectedProcedure
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

  deleteProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});
