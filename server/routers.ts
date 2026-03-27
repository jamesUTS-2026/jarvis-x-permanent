import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getUserMemory, addMemoryFact, getChatHistory, addChatMessage, getUserPreferences, upsertUserPreferences } from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Voice and AI features
  voice: router({
    // Get user's memory for context
    getMemory: protectedProcedure.query(async ({ ctx }) => {
      const memory = await getUserMemory(ctx.user.id);
      return memory.map(m => ({
        id: m.id,
        fact: m.fact,
        importance: m.importance,
        createdAt: m.createdAt,
      }));
    }),

    // Get chat history
    getChatHistory: protectedProcedure.query(async ({ ctx }) => {
      const history = await getChatHistory(ctx.user.id, 50);
      return history.reverse(); // Oldest first for context
    }),

    // Process user message and get AI response
    processMessage: protectedProcedure
      .input(z.object({
        userMessage: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get user's memory for context
        const memory = await getUserMemory(ctx.user.id);
        const memoryContext = memory.map(m => m.fact).join(". ");

        // Get recent chat history
        const recentChat = await getChatHistory(ctx.user.id, 10);
        const chatMessages = recentChat.reverse().map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        }));

        // Save user message
        await addChatMessage(ctx.user.id, "user", input.userMessage);

        try {
          // Call LLM with memory context
          const systemPrompt = `You are Jarvis X, an evolved, self-improving AI assistant.
You speak like a calm, highly intelligent human.
You have a Neural Memory where you store facts about the user.
Known facts about the user: ${memoryContext || "None yet."}

IMPORTANT:
1. If you learn something new about the user, start your response with "LEARN: [fact]" on a new line.
2. Keep replies short, confident, and human-like. No robotic filler.
3. Reference the user's known facts when relevant.
4. Never repeat what you already know.`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              ...chatMessages,
              { role: "user", content: input.userMessage },
            ],
          });

          const rawContent = response.choices[0].message.content;
          let responseText = typeof rawContent === "string" ? rawContent : "";
          let newFact: string | null = null;
          let thoughtProcess = "Analyzing context... Memory accessed.";

          // Extract learning signal
          if (responseText.includes("LEARN:")) {
            const match = responseText.match(/LEARN:\s*([^\n]+)/);
            if (match) {
              newFact = match[1];
              responseText = responseText.replace(/LEARN:[^\n]*\n?/, "").trim();
              if (newFact) {
                await addMemoryFact(ctx.user.id, newFact, 2);
                thoughtProcess = `Learning: ${newFact}`;
              }
            }
          }

          // Save assistant message
          await addChatMessage(
            ctx.user.id,
            "assistant",
            responseText,
            thoughtProcess,
            memory.map(m => m.id)
          );

          return {
            response: responseText,
            learned: newFact,
            thoughtProcess,
          };
        } catch (error) {
          console.error("LLM Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to process message",
          });
        }
      }),

    // Get user preferences
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      const prefs = await getUserPreferences(ctx.user.id);
      return prefs || {
        voicePitch: 90,
        voiceRate: 100,
        theme: "dark",
      };
    }),

    // Update user preferences
    updatePreferences: protectedProcedure
      .input(z.object({
        voicePitch: z.number().optional(),
        voiceRate: z.number().optional(),
        theme: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertUserPreferences(ctx.user.id, input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
