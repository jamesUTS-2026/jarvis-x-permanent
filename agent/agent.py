#!/usr/bin/env python3
"""
JARVIS X - Real-time Voice AI Agent
Built with LiveKit for real-time voice communication
Uses Groq for free LLM inference
"""

import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import JobContext, WorkerOptions, llm
from livekit.plugins import silero, openai
from groq import Groq
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
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


class GroqLLM:
    """Wrapper for Groq LLM to work with LiveKit agents"""

    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.conversation_history = []

    async def agenerate(self, messages, **kwargs):
        """Generate response using Groq"""
        try:
            response = self.client.chat.completions.create(
                model="mixtral-8x7b-32768",
                messages=messages,
                temperature=kwargs.get("temperature", 0.7),
                max_tokens=kwargs.get("max_tokens", 500),
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq error: {e}")
            return "I encountered an error processing your request."


class ToolExecutor:
    """Execute various tools for JARVIS"""

    @staticmethod
    async def search_web(query: str) -> str:
        """Search the web for information"""
        try:
            async with aiohttp.ClientSession() as session:
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
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
            response = requests.get(url)
            data = response.json()

            if not data.get("results"):
                return f"Could not find weather for {city}"

            location = data["results"][0]
            latitude = location["latitude"]
            longitude = location["longitude"]

            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=celsius"
            weather_response = requests.get(weather_url)
            weather_data = weather_response.json()

            current = weather_data["current"]
            temp = current["temperature_2m"]
            wind = current["wind_speed_10m"]
            weather_code = current["weather_code"]

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


class JarvisAgent:
    """JARVIS X - Real-time voice AI assistant"""

    def __init__(self):
        self.conversation_history = []
        self.memory = []
        self.tool_executor = ToolExecutor()
        self.groq_llm = GroqLLM(GROQ_API_KEY)

    async def process_message(self, message: str) -> str:
        """Process user message and generate response"""
        logger.info(f"User: {message}")

        self.conversation_history.append({"role": "user", "content": message})

        system_prompt = """You are JARVIS X, an advanced AI assistant inspired by Iron Man's JARVIS.
You are intelligent, sophisticated, and always ready to help.
Respond naturally and conversationally.
Keep responses concise but informative.
Always be respectful and professional.

You have access to the following tools:
- web_search: Search the internet for information
- weather: Get weather information for a city
- time: Get the current time

When you need to use a tool, respond with JSON in this format:
{"tool": "tool_name", "input": {"param": "value"}}

Then provide a response based on the tool result."""

        try:
            messages = [{"role": "system", "content": system_prompt}] + self.conversation_history

            response_text = await self.groq_llm.agenerate(messages)

            # Check if response contains tool call
            if response_text.strip().startswith("{"):
                try:
                    tool_call = json.loads(response_text)
                    if "tool" in tool_call:
                        tool_result = await self.tool_executor.execute_tool(
                            tool_call["tool"], tool_call.get("input", {})
                        )
                        logger.info(f"Tool result: {tool_result}")

                        self.conversation_history.append(
                            {"role": "assistant", "content": response_text}
                        )
                        self.conversation_history.append(
                            {
                                "role": "user",
                                "content": f"Tool result: {tool_result}. Now provide a natural response to the user based on this information.",
                            }
                        )

                        messages = [{"role": "system", "content": system_prompt}] + self.conversation_history
                        response_text = await self.groq_llm.agenerate(messages)
                except json.JSONDecodeError:
                    pass

            logger.info(f"JARVIS: {response_text}")

            self.conversation_history.append(
                {"role": "assistant", "content": response_text}
            )

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

            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]

            return response_text

        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return "I apologize, but I encountered an error processing your request. Please try again."


async def entrypoint(ctx: JobContext):
    """Main entry point for the LiveKit agent"""
    logger.info("Starting JARVIS X Agent...")
    logger.info(f"Room: {ctx.room.name}, Participant: {ctx.participant.name}")

    agent = JarvisAgent()

    # Create a simple voice assistant using LiveKit agents
    initial_ctx = llm.ChatContext()
    initial_ctx.messages.append(
        llm.ChatMessage(
            role="system",
            content="You are JARVIS X, an advanced AI assistant. Respond naturally and conversationally.",
        )
    )

    await agents.VoiceAssistantOptions(
        model=agents.llm.LLMOptions(
            model="gpt-4",  # Fallback model name
            temperature=0.7,
        ),
        stt=silero.STT.create(),
        tts=openai.TTS.create(
            model="tts-1-hd",
            voice="onyx",
        ),
        chat_ctx=initial_ctx,
    ).with_fns(
        on_message_received=agent.process_message,
    ).astart(ctx.room, ctx.participant)


if __name__ == "__main__":
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
