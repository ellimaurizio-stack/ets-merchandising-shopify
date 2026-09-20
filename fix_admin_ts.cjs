const fs = require('fs');
let content = fs.readFileSync('server/routers/admin.ts', 'utf8');

content = content.replace(
  /try \{\s*const existing = await db\.select\(\)\.from\(storeSettings\)[\s\S]*?return \{ success: true \};\s*\}\),/g,
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
    }),`
);

fs.writeFileSync('server/routers/admin.ts', content);
