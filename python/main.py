"""
JARVIS X FastAPI Microservice
Handles inference engine routing, local model support, and cloud fallback
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="JARVIS X Inference Engine", version="1.0.0")

# Enable CORS for Node.js backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Models
class InferenceRequest(BaseModel):
    """Request for inference"""
    model: str
    messages: List[dict]
    temperature: float = 0.7
    max_tokens: int = 1000
    stream: bool = False

class InferenceResponse(BaseModel):
    """Response from inference"""
    model: str
    content: str
    tokens_used: int
    engine: str  # 'local' or 'cloud'
    latency_ms: float

class ModelInfo(BaseModel):
    """Information about available models"""
    name: str
    type: str  # 'local' or 'cloud'
    cost_per_1k_tokens: float = 0.0
    latency_ms: float = 0.0
    available: bool

# Health check
@app.get("/health")
async def health_check():
    """Check service health and model availability"""
    ollama_available = await check_ollama()
    return {
        "status": "ok",
        "ollama_available": ollama_available,
        "openrouter_configured": bool(OPENROUTER_API_KEY),
    }

# Check if Ollama is available
async def check_ollama() -> bool:
    """Check if Ollama is running and accessible"""
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return response.status_code == 200
    except Exception as e:
        print(f"[OLLAMA] Connection failed: {e}")
        return False

# Get available models
@app.get("/models")
async def list_models() -> List[ModelInfo]:
    """List all available models (local + cloud)"""
    models = []
    
    # Check local models via Ollama
    ollama_available = await check_ollama()
    if ollama_available:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
                if response.status_code == 200:
                    data = response.json()
                    for model in data.get("models", []):
                        models.append(ModelInfo(
                            name=model["name"],
                            type="local",
                            cost_per_1k_tokens=0.0,  # Local models are free
                            available=True,
                        ))
        except Exception as e:
            print(f"[OLLAMA] Failed to fetch models: {e}")
    
    # Add cloud models
    cloud_models = [
        ModelInfo(name="gpt-4o-mini", type="cloud", cost_per_1k_tokens=0.00015, available=bool(OPENROUTER_API_KEY)),
        ModelInfo(name="claude-3-haiku", type="cloud", cost_per_1k_tokens=0.00025, available=bool(OPENROUTER_API_KEY)),
        ModelInfo(name="mistral-7b", type="cloud", cost_per_1k_tokens=0.0001, available=bool(OPENROUTER_API_KEY)),
    ]
    models.extend(cloud_models)
    
    return models

# Inference endpoint
@app.post("/inference")
async def inference(request: InferenceRequest) -> InferenceResponse:
    """
    Run inference with automatic fallback logic:
    1. Try local model if available
    2. Fall back to cloud API if local fails
    """
    import time
    start_time = time.time()
    
    # Check if model is local
    if request.model.startswith("local:") or ":" not in request.model:
        # Try local inference first
        ollama_available = await check_ollama()
        if ollama_available:
            try:
                response = await run_ollama_inference(request)
                latency = (time.time() - start_time) * 1000
                return InferenceResponse(
                    model=request.model,
                    content=response,
                    tokens_used=0,  # Ollama doesn't track this easily
                    engine="local",
                    latency_ms=latency,
                )
            except Exception as e:
                print(f"[LOCAL] Inference failed: {e}. Falling back to cloud...")
    
    # Fall back to cloud API
    try:
        response = await run_openrouter_inference(request)
        latency = (time.time() - start_time) * 1000
        return InferenceResponse(
            model=request.model,
            content=response["content"],
            tokens_used=response.get("tokens", 0),
            engine="cloud",
            latency_ms=latency,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

# Local inference via Ollama
async def run_ollama_inference(request: InferenceRequest) -> str:
    """Run inference using local Ollama model"""
    # Convert messages to Ollama format
    prompt = ""
    for msg in request.messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        prompt += f"{role}: {content}\n"
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": request.model.replace("local:", ""),
                "prompt": prompt,
                "temperature": request.temperature,
                "stream": False,
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Ollama error: {response.text}")
        
        data = response.json()
        return data.get("response", "")

# Cloud inference via OpenRouter
async def run_openrouter_inference(request: InferenceRequest) -> dict:
    """Run inference using OpenRouter cloud API"""
    if not OPENROUTER_API_KEY:
        raise Exception("OpenRouter API key not configured")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://jarvis-x.manus.space",
                "X-Title": "JARVIS X",
            },
            json={
                "model": request.model,
                "messages": request.messages,
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenRouter error: {response.text}")
        
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        tokens = data.get("usage", {}).get("total_tokens", 0)
        
        return {"content": content, "tokens": tokens}

# Trace recording endpoint
@app.post("/traces")
async def record_trace(trace_data: dict):
    """Record inference trace for learning loop"""
    # This will be connected to the Node.js backend for database storage
    print(f"[TRACE] Recording: {trace_data}")
    return {"status": "recorded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
