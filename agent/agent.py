#!/usr/bin/env python3
"""
JARVIS X - Simple HTTP Server for Voice Processing
Works with LiveKit via HTTP API
"""

import os
import json
import logging
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "ws://localhost:7880")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
PORT = int(os.getenv("PORT", 8000))


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "JARVIS X Agent"})


@app.route("/process", methods=["POST"])
def process_message():
    """Process a user message"""
    try:
        data = request.json
        user_message = data.get("message", "")
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        logger.info(f"Processing: {user_message}")
        
        # Simple response for now
        response = {
            "message": user_message,
            "response": f"JARVIS X received: {user_message}. Ready to assist.",
            "status": "success"
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def index():
    """Root endpoint"""
    return jsonify({
        "service": "JARVIS X Agent",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "process": "/process"
        }
    })


if __name__ == "__main__":
    logger.info(f"Starting JARVIS X Agent on port {PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=False)
