#!/usr/bin/env python3
"""
JARVIS X - Real-time Voice AI Agent
Built with LiveKit for real-time voice communication
Supports tools, memory, and advanced features
"""

import os
import json
import logging
import asyncio
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

from livekit import agents, llm
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, llm as agents_llm
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import openai, silero
import aiohttp
import requests

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "ws://localhost:7880")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


class ToolExecutor:
    """Execute various tools for JARVIS"""

    @staticmethod
    async def search_web(query: str) -> str:
        """Search the web for information"""
        try:
            async with aiohttp.ClientSession() as session:
                # Using DuckDuckGo API (free, no key required)
                url = f"https://api.duckduckgo.com/?q={query}&format=json"
                async with session.get(url) as resp:
                    data = await resp.json()
                    if data.get("AbstractText"):
                        return data["AbstractText"]
                    return f"Search results for '{query}' - No detailed results available"
        except Exception as e:
            logger.error(f"Web search error: {e}")
            return f"Unable to search for '{query}'"

    @staticmethod
    async def get_weather(city: str) -> str:
        """Get weather information"""
        try:
            # Using Open-Meteo API (free, no key required)
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
            response = requests.get(url)
            data = response.json()

            if not data.get("results"):
                return f"Could not find weather for {city}"

            location = data["results"][0]
            latitude = location["latitude"]
            longitude = location["longitude"]

            # Get weather data
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=celsius"
            weather_response = requests.get(weather_url)
            weather_data = weather_response.json()

            current = weather_data["current"]
            temp = current["temperature_2m"]
            wind = current["wind_speed_10m"]
            weather_code = current["weather_code"]

            # Simple weather code interpretation
            weather_desc = {
                0: "Clear sky",
                1: "Mainly clear",
                2: "Partly cloudy",
                3: "Overcast",
                45: "Foggy",
                48: "Foggy with rime",
                51: "Light drizzle",
                61: "Slight rain",
                71: "Slight snow",
                80: "Moderate rain",
                85: "Moderate snow",
                95: "Thunderstorm",
            }.get(weather_code, "Unknown")

            return f"Weather in {city}: {temp}°C, {weather_desc}, Wind: {wind} km/h"

        except Exception as e:
            logger.error(f"Weather error: {e}")
            return f"Unable to get weather for {city}"

    @staticmethod
    async def get_time() -> str:
        """Get current time"""
        return f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

    @staticmethod
    async def execute_tool(tool_name: str, tool_input: dict) -> str:
        """Execute a tool based on name and input"""
        if tool_name == "web_search":
            return await ToolExecutor.search_web(tool_input.get("query", ""))
        elif tool_name == "weather":
            return await ToolExecutor.get_weather(tool_input.get("city", ""))
        elif tool_name == "time":
            return await ToolExecutor.get_time()
        else:
            return f"Unknown tool: {tool_name}"


class JarvisAgent(VoiceAssistant):
    """
    JARVIS X - Real-time voice AI assistant
    Handles speech-to-text, LLM processing, tool execution, and text-to-speech
    """

    def __init__(self):
        super().__init__()
        self.conversation_history = []
        self.memory = []
        self.tool_executor = ToolExecutor()

    async def on_message_received(self, message: str) -> str:
        """
        Process user message and generate response
        """
        logger.info(f"User: {message}")

        # Add to conversation history
        self.conversation_history.append({"role": "user", "content": message})

        # Build system prompt with tool information
        system_prompt = """You are JARVIS X, an advanced AI assistant inspired by Iron Man's JARVIS.
You are intelligent, sophisticated, and always ready to help.
Respond naturally and conversationally.
Keep responses concise but informative.
Always be respectful and professional.

You have access to the following tools:
- web_search: Search the internet for information. Use when user asks about current events, facts, or information.
- weather: Get weather information for a city. Use when user asks about weather.
- time: Get the current time. Use when user asks for the time.

When you need to use a tool, respond with JSON in this format:
{"tool": "tool_name", "input": {"param": "value"}}

Then provide a response based on the tool result."""

        try:
            # Call OpenAI API
            response = await openai.LLM.acreate(
                model="gpt-4",
                system=system_prompt,
                messages=self.conversation_history,
                temperature=0.7,
                max_tokens=500,
            )

            response_text = response.content

            # Check if response contains tool call
            if response_text.strip().startswith("{"):
                try:
                    tool_call = json.loads(response_text)
                    if "tool" in tool_call:
                        tool_result = await self.tool_executor.execute_tool(
                            tool_call["tool"], tool_call.get("input", {})
                        )
                        logger.info(f"Tool result: {tool_result}")

                        # Add tool result to conversation and get final response
                        self.conversation_history.append(
                            {"role": "assistant", "content": response_text}
                        )
                        self.conversation_history.append(
                            {
                                "role": "user",
                                "content": f"Tool result: {tool_result}. Now provide a natural response to the user based on this information.",
                            }
                        )

                        # Get final response
                        final_response = await openai.LLM.acreate(
                            model="gpt-4",
                            system=system_prompt,
                            messages=self.conversation_history,
                            temperature=0.7,
                            max_tokens=300,
                        )
                        response_text = final_response.content
                except json.JSONDecodeError:
                    pass  # Not a tool call, treat as normal response

            logger.info(f"JARVIS: {response_text}")

            # Add to conversation history
            self.conversation_history.append(
                {"role": "assistant", "content": response_text}
            )

            # Store in memory if it's important
            if any(
                keyword in message.lower()
                for keyword in ["remember", "note", "save", "important"]
            ):
                self.memory.append(
                    {
                        "timestamp": datetime.now().isoformat(),
                        "user_message": message,
                        "assistant_response": response_text,
                    }
                )

            # Keep only last 20 messages for context
            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]

            return response_text

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return "I apologize, but I encountered an error processing your request. Please try again."


async def entrypoint(ctx: JobContext):
    """
    Main entry point for the LiveKit agent
    """
    logger.info("Starting JARVIS X Agent...")
    logger.info(f"Room: {ctx.room.name}, Participant: {ctx.participant.name}")

    # Initialize agent
    agent = JarvisAgent()

    # Configure voice assistant
    await agent.astart(
        ctx.room,
        ctx.participant,
        # Speech-to-Text using Silero (free, runs locally)
        stt=silero.STT.create(),
        # LLM using OpenAI
        llm=openai.LLM.create(
            model="gpt-4",
            api_key=OPENAI_API_KEY,
        ),
        # Text-to-Speech using OpenAI
        tts=openai.TTS.create(
            model="tts-1-hd",
            voice="onyx",
        ),
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
