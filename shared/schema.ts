import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Перечисление ролей пользователей
export const UserRole = {
  ADMIN: "admin",
  PARTNER: "partner",
  ADVERTISER: "advertiser",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Перечисление статусов лидов
export const LeadStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type LeadStatusType = typeof LeadStatus[keyof typeof LeadStatus];

// Перечисление категорий офферов
export const OfferCategory = {
  FINANCE: "finance",
  INSURANCE: "insurance",
  LOANS: "loans",
  OTHER: "other",
} as const;

export type OfferCategoryType = typeof OfferCategory[keyof typeof OfferCategory];

// Пользователи
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  fullName: text("full_name").notNull(),
  avatarInitials: text("avatar_initials"),
  balance: real("balance").default(0).notNull(),
  trafficSources: text("traffic_sources"),
  isActive: boolean("is_active").default(true).notNull(),
  fraudScore: real("fraud_score").default(0).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  fullName: true,
  avatarInitials: true,
  trafficSources: true,
});

// Офферы
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  advertiserId: integer("advertiser_id").notNull(),
  paymentAmount: real("payment_amount").notNull(),
  paymentType: text("payment_type").notNull(),
  requirements: text("requirements"),
  conversionRate: real("conversion_rate"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertOfferSchema = createInsertSchema(offers).pick({
  title: true,
  description: true,
  category: true,
  advertiserId: true,
  paymentAmount: true,
  paymentType: true,
  requirements: true,
  isActive: true,
});

// Лиды
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").notNull(),
  partnerId: integer("partner_id").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  payoutAmount: real("payout_amount"),
  data: jsonb("data"),
  fraudFlags: jsonb("fraud_flags"),
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  offerId: true,
  partnerId: true,
  status: true,
  data: true,
});

// Платежи
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  method: text("method"),
  details: jsonb("details"),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  partnerId: true,
  amount: true,
  status: true,
  method: true,
  details: true,
});

// Мотивационные программы
export const motivationPrograms = pgTable("motivation_programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetLeads: integer("target_leads"),
  bonusAmount: real("bonus_amount"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertMotivationProgramSchema = createInsertSchema(motivationPrograms).pick({
  title: true,
  description: true,
  targetLeads: true,
  bonusAmount: true,
  startDate: true,
  endDate: true,
  isActive: true,
});

// Типы экспорта
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertMotivationProgram = z.infer<typeof insertMotivationProgramSchema>;
export type MotivationProgram = typeof motivationPrograms.$inferSelect;
