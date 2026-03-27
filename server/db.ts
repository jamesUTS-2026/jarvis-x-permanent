import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, neuralMemory, chatHistory, userPreferences, aiModels, interactionTraces, performanceMetrics, userModelPreferences } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Memory queries
export async function getUserMemory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(neuralMemory).where(eq(neuralMemory.userId, userId)).orderBy(desc(neuralMemory.createdAt));
}

export async function addMemoryFact(userId: number, fact: string, importance: number = 1) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(neuralMemory).values({ userId, fact, importance });
  return result;
}

// Chat history queries
export async function getChatHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatHistory).where(eq(chatHistory.userId, userId)).orderBy(desc(chatHistory.createdAt)).limit(limit);
}

export async function addChatMessage(userId: number, role: "user" | "assistant" | "system", content: string, thoughtProcess?: string, memoryUsed?: number[]) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(chatHistory).values({
    userId,
    role,
    content,
    thoughtProcess: thoughtProcess || null,
    memoryUsed: memoryUsed ? JSON.stringify(memoryUsed) : null,
  });
}

// User preferences queries
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertUserPreferences(userId: number, prefs: Partial<typeof userPreferences.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(userPreferences).values({ userId, ...prefs }).onDuplicateKeyUpdate({
    set: prefs,
  });
}

// TODO: add feature queries here as your schema grows.


// Model queries
export async function getAvailableModels() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiModels).where(eq(aiModels.isActive, 1));
}

export async function getModelById(modelId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(aiModels).where(eq(aiModels.id, modelId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getModelByName(name: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(aiModels).where(eq(aiModels.name, name)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function addModel(model: typeof aiModels.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(aiModels).values(model);
}

// Trace queries
export async function addInteractionTrace(trace: typeof interactionTraces.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(interactionTraces).values(trace);
}

export async function getUserTraces(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(interactionTraces).where(eq(interactionTraces.userId, userId)).orderBy(desc(interactionTraces.createdAt)).limit(limit);
}

export async function getModelStats(modelId: number) {
  const db = await getDb();
  if (!db) return null;
  const traces = await db.select().from(interactionTraces).where(eq(interactionTraces.modelId, modelId));
  if (traces.length === 0) return null;
  
  const avgLatency = traces.reduce((sum, t) => sum + t.latencyMs, 0) / traces.length;
  const totalCost = traces.reduce((sum, t) => sum + t.costUsd, 0);
  const avgQuality = traces.filter(t => t.qualityScore).reduce((sum, t) => sum + (t.qualityScore || 0), 0) / traces.filter(t => t.qualityScore).length;
  
  return { avgLatency, totalCost, avgQuality, totalTraces: traces.length };
}

// Performance metrics queries
export async function addPerformanceMetric(metric: typeof performanceMetrics.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(performanceMetrics).values(metric);
}

export async function getUserMetrics(userId: number, metricType?: string, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(performanceMetrics).where(eq(performanceMetrics.userId, userId)).orderBy(desc(performanceMetrics.timestamp)).limit(limit);
}

// User model preferences queries
export async function getUserModelPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userModelPreferences).where(eq(userModelPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertUserModelPreferences(userId: number, prefs: Partial<typeof userModelPreferences.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(userModelPreferences).values({ userId, ...prefs }).onDuplicateKeyUpdate({
    set: prefs,
  });
}
