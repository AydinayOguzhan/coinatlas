import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const coins = sqliteTable("coins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  numistaId: text("numista_id"),
  title: text("title").notNull(),
  country: text("country").notNull(),
  issuer: text("issuer"),
  denomination: text("denomination"),
  currency: text("currency"),
  year: text("year"),
  minYear: integer("min_year"),
  maxYear: integer("max_year"),
  composition: text("composition"),
  weight: real("weight"),
  diameter: real("diameter"),
  thickness: real("thickness"),
  shape: text("shape"),
  edge: text("edge"),
  obverseDescription: text("obverse_description"),
  reverseDescription: text("reverse_description"),
  quantity: integer("quantity").notNull().default(1),
  condition: text("condition"),
  acquisitionDate: text("acquisition_date"),
  acquisitionPrice: real("acquisition_price"),
  storageLocation: text("storage_location"),
  notes: text("notes"),
  sourceUrl: text("source_url"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const coinImages = sqliteTable("coin_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  coinId: integer("coin_id")
    .notNull()
    .references(() => coins.id, { onDelete: "cascade" }),
  side: text("side", { enum: ["obverse", "reverse", "unknown"] }).notNull().default("unknown"),
  filePath: text("file_path").notNull(),
  originalFileName: text("original_file_name"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  ocrText: text("ocr_text"),
  aiDescription: text("ai_description"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const identificationSessions = sqliteTable("identification_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inputType: text("input_type", { enum: ["text", "image"] }).notNull(),
  inputText: text("input_text"),
  imagePath: text("image_path"),
  extractedText: text("extracted_text"),
  aiSummary: text("ai_summary"),
  normalizedQuery: text("normalized_query"),
  localResultsJson: text("local_results_json"),
  numistaResultsJson: text("numista_results_json"),
  selectedNumistaId: text("selected_numista_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const appSettings = sqliteTable("app_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const coinRelations = relations(coins, ({ many }) => ({
  images: many(coinImages)
}));

export const coinImageRelations = relations(coinImages, ({ one }) => ({
  coin: one(coins, {
    fields: [coinImages.coinId],
    references: [coins.id]
  })
}));
