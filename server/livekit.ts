import { AccessToken } from "livekit-server-sdk";

/**
 * Generate LiveKit access token for frontend
 */
export async function generateLiveKitToken(
  roomName: string,
  participantName: string,
  apiKey: string,
  apiSecret: string
): Promise<string> {
  const at = new AccessToken(apiKey, apiSecret);
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  at.identity = participantName;
  return at.toJwt();
}

/**
 * LiveKit configuration
 */
export interface LiveKitConfig {
  url: string;
  token: string;
  roomName: string;
}

export function getLiveKitUrl(): string {
  return process.env.LIVEKIT_URL || "ws://localhost:7880";
}

export function getLiveKitApiKey(): string {
  const key = process.env.LIVEKIT_API_KEY;
  if (!key) {
    throw new Error("LIVEKIT_API_KEY not set");
  }
  return key;
}

export function getLiveKitApiSecret(): string {
  const secret = process.env.LIVEKIT_API_SECRET;
  if (!secret) {
    throw new Error("LIVEKIT_API_SECRET not set");
  }
  return secret;
}
