#!/usr/bin/env python3
"""
JARVIS X - Real-time Voice AI Agent
Simple implementation using LiveKit agents with Groq LLM
"""

import os
import logging
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import JobContext, WorkerOptions
from livekit.plugins import silero, openai

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


async def entrypoint(ctx: JobContext):
    """Main entry point for the LiveKit agent"""
    logger.info("Starting JARVIS X Agent...")
    logger.info(f"Room: {ctx.room.name}, Participant: {ctx.participant.name}")

    # Create a simple voice assistant
    # Using OpenAI for both STT and TTS for reliability
    assistant = agents.VoiceAssistant(
        stt=silero.STT.create(),
        tts=openai.TTS.create(
            model="tts-1-hd",
            voice="onyx",
        ),
    )

    # System prompt for JARVIS
    system_prompt = """You are JARVIS X, an advanced AI assistant inspired by Iron Man's JARVIS.
You are intelligent, sophisticated, and always ready to help.
Respond naturally and conversationally.
Keep responses concise but informative.
Always be respectful and professional."""

    # Start the assistant
    await assistant.astart(
        ctx.room,
        ctx.participant,
        system_prompt=system_prompt,
    )


if __name__ == "__main__":
    # Run the agent
    worker_options = WorkerOptions(
        entrypoint=entrypoint,
        prewarm_pool=1,
    )

    agents.run_app(
        [worker_options],
        livekit_url=LIVEKIT_URL,
        livekit_api_key=LIVEKIT_API_KEY,
        livekit_api_secret=LIVEKIT_API_SECRET,
    )
