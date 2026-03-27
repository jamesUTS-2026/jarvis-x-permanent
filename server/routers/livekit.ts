import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { generateLiveKitToken, getLiveKitUrl, getLiveKitApiKey, getLiveKitApiSecret } from "../livekit";

export const livekitRouter = router({
  /**
   * Get LiveKit token for WebRTC connection
   */
  getToken: protectedProcedure
    .input(z.object({
      roomName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const token = generateLiveKitToken(
          input.roomName,
          ctx.user.id.toString(),
          getLiveKitApiKey(),
          getLiveKitApiSecret()
        );

        return {
          success: true,
          token,
          url: getLiveKitUrl(),
          roomName: input.roomName,
        };
      } catch (error) {
        console.error("LiveKit token generation error:", error);
        throw new Error("Failed to generate LiveKit token");
      }
    }),

  /**
   * Get LiveKit configuration
   */
  getConfig: protectedProcedure.query(async () => {
    return {
      url: getLiveKitUrl(),
      apiKey: getLiveKitApiKey(),
    };
  }),
});
