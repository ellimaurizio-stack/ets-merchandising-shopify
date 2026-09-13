import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { products, carts, cartItems } from "../../drizzle/schema";
import { eq, inArray, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { Cart, Collection, Product } from "@shared/commerce/types";

// Helper to convert DB product to shared Product type
function mapProduct(p: any): Product {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description || "",
    descriptionHtml: p.descriptionHtml || p.description || "",
    priceRange: {
      min: { amount: p.priceAmount, currencyCode: p.currencyCode },
      max: { amount: p.priceAmount, currencyCode: p.currencyCode },
    },
    images: p.imageUrl ? [{ url: p.imageUrl, altText: p.title, width: 800, height: 800 }] : [],
    variants: [{
      id: p.id,
      title: "Default",
      availableForSale: p.availableForSale === 1,
      price: { amount: p.priceAmount, currencyCode: p.currencyCode },
      compareAtPrice: null,
      selectedOptions: [{ name: "Title", value: "Default Title" }]
    }],
    options: [{ name: "Title", values: ["Default Title"] }],
    tags: [],
    productType: "Merchandising",
    vendor: "A-Tono ETS",
    weightGrams: p.weightGrams,
    lengthCm: p.lengthCm,
    widthCm: p.widthCm,
    heightCm: p.heightCm,
    impactConfig: p.impactConfig,
  };
}

export async function listProducts(options: { first?: number } = {}): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(products).orderBy(asc(products.sortOrder));
  return results.map(mapProduct);
}

export async function getProductByHandle(handle: string): Promise<Product> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "NOT_FOUND" });
  const result = await db.select().from(products).where(eq(products.handle, handle)).limit(1);
  if (!result.length) throw new TRPCError({ code: "NOT_FOUND" });
  return mapProduct(result[0]);
}

export async function listCollections(first: number = 10): Promise<Collection[]> {
  return [{ id: "col-1", handle: "all", title: "Tutti i prodotti", description: "", image: null }];
}

export async function getCollectionByHandle(handle: string): Promise<Collection> {
  return (await listCollections())[0];
}

// CART LOGIC
export type CartLineInput = { variantId: string; quantity: number };
export type CartLineUpdate = { lineId: string; quantity: number };

async function buildCart(cartId: string): Promise<Cart | null> {
  const db = await getDb();
  if (!db) return null;
  const cartResult = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
  if (!cartResult.length) return null;

  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  const productIds = items.map(i => i.productId);
  let productsList: any[] = [];
  
  if (productIds.length > 0) {
    productsList = await db.select().from(products).where(inArray(products.id, productIds));
  }
  
  let totalAmount = 0;
  let totalQuantity = 0;
  
  const formattedItems = items.map(item => {
    const product = productsList.find(p => p.id === item.productId);
    if (!product) return null;
    const price = parseFloat(product.priceAmount) * item.quantity;
    totalAmount += price;
    totalQuantity += item.quantity;
    return {
      lineId: String(item.id),
      variantId: product.id,
      productHandle: product.handle,
      productTitle: product.title,
      variantTitle: "Default",
      image: product.imageUrl ? { url: product.imageUrl, altText: product.title, width: 800, height: 800 } : null,
      unitPrice: { amount: product.priceAmount, currencyCode: product.currencyCode },
      quantity: item.quantity,
      lineTotal: { amount: price.toFixed(2), currencyCode: product.currencyCode },
      weightGrams: product.weightGrams,
      lengthCm: product.lengthCm,
      widthCm: product.widthCm,
      heightCm: product.heightCm,
    };
  }).filter(Boolean) as any[];

  return {
    id: cartId,
    checkoutUrl: `/checkout/${cartId}`,
    itemCount: totalQuantity,
    items: formattedItems,
    subtotal: { amount: totalAmount.toFixed(2), currencyCode: "EUR" },
    total: { amount: totalAmount.toFixed(2), currencyCode: "EUR" }
  };
}

export async function createCart(lines: CartLineInput[]): Promise<Cart> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  
  const cartId = nanoid();
  await db.insert(carts).values({ id: cartId });
  
  if (lines.length > 0) {
    await db.insert(cartItems).values(lines.map(l => ({
      cartId,
      productId: l.variantId,
      quantity: l.quantity
    })));
  }
  
  return (await buildCart(cartId))!;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  return await buildCart(cartId);
}

export async function addCartLines(cartId: string, lines: CartLineInput[]): Promise<Cart> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  
  for (const l of lines) {
    const existing = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId)).limit(100);
    const item = existing.find(i => i.productId === l.variantId);
    if (item) {
      await db.update(cartItems).set({ quantity: item.quantity + l.quantity }).where(eq(cartItems.id, item.id));
    } else {
      await db.insert(cartItems).values({ cartId, productId: l.variantId, quantity: l.quantity });
    }
  }
  return (await buildCart(cartId))!;
}

export async function updateCartLines(cartId: string, updates: CartLineUpdate[]): Promise<Cart> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  for (const u of updates) {
    await db.update(cartItems).set({ quantity: u.quantity }).where(eq(cartItems.id, parseInt(u.lineId)));
  }
  return (await buildCart(cartId))!;
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  for (const id of lineIds) {
    await db.delete(cartItems).where(eq(cartItems.id, parseInt(id)));
  }
  return (await buildCart(cartId))!;
}
