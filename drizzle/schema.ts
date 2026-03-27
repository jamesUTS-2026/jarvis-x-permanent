import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

/**
 * Neural Memory: Stores facts learned about the user
 */
export const neuralMemory = mysqlTable("neural_memory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  fact: text("fact").notNull(),
  importance: int("importance").default(1).notNull(), // 1-5 scale
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NeuralMemory = typeof neuralMemory.$inferSelect;
export type InsertNeuralMemory = typeof neuralMemory.$inferInsert;

/**
 * Chat History: Stores conversation messages
 */
export const chatHistory = mysqlTable("chat_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  thoughtProcess: text("thoughtProcess"), // Internal reasoning shown to user
  memoryUsed: text("memoryUsed"), // JSON array of memory IDs used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatHistory = typeof chatHistory.$inferSelect;
export type InsertChatHistory = typeof chatHistory.$inferInsert;

/**
 * User Preferences: Stores voice and UI settings
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  voicePitch: int("voicePitch").default(90).notNull(), // 0-200, default 90 (0.9)
  voiceRate: int("voiceRate").default(100).notNull(), // 0-200, default 100 (1.0)
  preferredVoice: varchar("preferredVoice", { length: 255 }),
  theme: varchar("theme", { length: 50 }).default("dark").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

/**
 * AI Models: Registry of available models (local and cloud)
 */
export const aiModels = mysqlTable("ai_models", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  engine: mysqlEnum("engine", ["local", "cloud"]).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  costPer1kTokens: int("costPer1kTokens").default(0).notNull(),
  avgLatencyMs: int("avgLatencyMs").default(0).notNull(),
  maxTokens: int("maxTokens").default(4096).notNull(),
  supportsVision: int("supportsVision").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIModel = typeof aiModels.$inferSelect;
export type InsertAIModel = typeof aiModels.$inferInsert;

/**
 * Interaction Traces: Logs for learning loop
 */
export const interactionTraces = mysqlTable("interaction_traces", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  modelId: int("modelId").notNull().references(() => aiModels.id),
  inputText: text("inputText").notNull(),
  outputText: text("outputText").notNull(),
  latencyMs: int("latencyMs").notNull(),
  costUsd: int("costUsd").default(0).notNull(),
  energyWh: int("energyWh").default(0).notNull(),
  qualityScore: int("qualityScore"),
  userFeedback: text("userFeedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InteractionTrace = typeof interactionTraces.$inferSelect;
export type InsertInteractionTrace = typeof interactionTraces.$inferInsert;

/**
 * Performance Metrics: Aggregated performance data
 */
export const performanceMetrics = mysqlTable("performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  modelId: int("modelId").references(() => aiModels.id),
  metricType: mysqlEnum("metricType", ["latency", "cost", "energy", "accuracy"]).notNull(),
  value: int("value").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;

/**
 * User Model Preferences: User's preferred models and engine settings
 */
export const userModelPreferences = mysqlTable("user_model_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  preferredModelId: int("preferredModelId").references(() => aiModels.id),
  enginePreference: mysqlEnum("enginePreference", ["local", "cloud", "auto"]).default("auto").notNull(),
  costOptimization: int("costOptimization").default(0).notNull(),
  latencyOptimization: int("latencyOptimization").default(0).notNull(),
  energyOptimization: int("energyOptimization").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserModelPreference = typeof userModelPreferences.$inferSelect;
export type InsertUserModelPreference = typeof userModelPreferences.$inferInsert;
