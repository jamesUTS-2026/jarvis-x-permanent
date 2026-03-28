#!/usr/bin/env python3
"""
JARVIS X - Real-time Voice AI Agent
Minimal working implementation
"""

import os
import logging
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import JobContext
from livekit.plugins import silero, openai

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def prewarm(proc):
    """Prewarm the agent"""
    await silero.STT.create().astart(proc, None)


async def entrypoint(ctx: JobContext):
    """Main entry point for the LiveKit agent"""
    logger.info(f"Agent started in room: {ctx.room.name}")
    
    # Create voice assistant
    assistant = agents.VoiceAssistant(
        stt=silero.STT.create(),
        tts=openai.TTS.create(model="tts-1-hd", voice="onyx"),
    )
    
    # Start the assistant
    await assistant.astart(ctx.room, ctx.participant)


if __name__ == "__main__":
    # Run the agent
    agents.cli.run_app(agents.WorkerOptions(entrypoint=entrypoint, prewarm_fnc=prewarm))
