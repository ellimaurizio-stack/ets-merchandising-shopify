import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, longtext } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

export const products = mysqlTable("products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  handle: varchar("handle", { length: 128 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  descriptionHtml: text("descriptionHtml"),
  priceAmount: varchar("priceAmount", { length: 32 }).notNull(), // using varchar for decimals in this simple setup
  currencyCode: varchar("currencyCode", { length: 3 }).default("EUR").notNull(),
  imageUrl: longtext("imageUrl"),
  availableForSale: int("availableForSale").default(1).notNull(), // 1 true, 0 false
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull().default("Sconosciuto"),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  totalAmount: varchar("totalAmount", { length: 32 }).notNull(),
  itemsSummary: text("itemsSummary"),
  status: mysqlEnum("status", ["pending", "paid", "shipped"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  quantity: int("quantity").notNull(),
  priceAmount: varchar("priceAmount", { length: 32 }).notNull(),
});

export const privacyDisclaimers = mysqlTable("privacy_disclaimers", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  text: text("text").notNull(),
  link: varchar("link", { length: 500 }),
  isRequired: int("isRequired").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const carts = mysqlTable("carts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  cartId: varchar("cartId", { length: 64 }).notNull(),
  productId: varchar("productId", { length: 64 }).notNull(),
  quantity: int("quantity").notNull(),
});

export const admins = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
});

export const storeSettings = mysqlTable("store_settings", {
  id: varchar("id", { length: 32 }).primaryKey(),
  paymentProvider: varchar("paymentProvider", { length: 64 }).default("nessuno").notNull(),
  stripePublicKey: varchar("stripePublicKey", { length: 255 }),
  stripeSecretKey: varchar("stripeSecretKey", { length: 255 }),
  paypalClientId: varchar("paypalClientId", { length: 255 }),
  bankIban: varchar("bankIban", { length: 128 }),
});