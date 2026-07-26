import { z } from "zod";

export const moneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3),
});

export const timeSchema = z.object({
  startMinute: z.number().int().min(0).max(1440),
  endMinute: z.number().int().min(0).max(1440),
  daysOfWeek: z.array(z.number().int().min(1).max(7)).min(1),
});

export type TimeWindow = z.infer<typeof timeSchema>;
export type Money = z.infer<typeof moneySchema>;

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  timezone: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type Location = z.infer<typeof locationSchema>;

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Category = z.infer<typeof categorySchema>;

export const itemVariationSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: moneySchema.nullable(),
});

export type ItemVariation = z.infer<typeof itemVariationSchema>;

export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  categoryId: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  variations: z.array(itemVariationSchema).min(1),
});

export type Item = z.infer<typeof itemSchema>;

export const aggregatedItemSchema = itemSchema.extend({
  servedAt: z.array(locationSchema).min(1),
});

export type AggregatedItem = z.infer<typeof aggregatedItemSchema>;

export const menuSchema = z.object({
  locationId: z.string(),
  locationName: z.string(),
  timezone: z.string(),
  generatedAt: z.string(),
  categories: z.array(categorySchema),
  items: z.array(itemSchema),
});

export type Menu = z.infer<typeof menuSchema>;

export const aggregatedMenuSchema = z.object({
  mode: z.literal("all"),
  generatedAt: z.string(),
  locations: z.array(locationSchema).min(1),
  timezone: z.string(),
  categories: z.array(categorySchema),
  items: z.array(aggregatedItemSchema),
});

export type AggregatedMenu = z.infer<typeof aggregatedMenuSchema>;

export const itemDetailSchema = itemSchema.extend({
  categoryName: z.string().nullable(),
});

export type ItemDetail = z.infer<typeof itemDetailSchema>;

export const aggregatedItemDetailSchema = aggregatedItemSchema.extend({
  categoryName: z.string().nullable(),
});

export type AggregatedItemDetail = z.infer<typeof aggregatedItemDetailSchema>;
