"""
JARVIS X Agent - Monitoring and Logging Setup
Tracks performance, errors, and usage metrics
"""

import logging
import json
from datetime import datetime
from pathlib import Path

# Create logs directory
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / "agent.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("JARVIS_X_AGENT")

class PerformanceMonitor:
    """Track performance metrics"""
    
    def __init__(self):
        self.metrics_file = LOG_DIR / "metrics.json"
        self.metrics = self._load_metrics()
    
    def _load_metrics(self):
        if self.metrics_file.exists():
            with open(self.metrics_file) as f:
                return json.load(f)
        return {
            "total_conversations": 0,
            "total_messages": 0,
            "avg_response_time": 0,
            "errors": 0,
            "uptime_seconds": 0,
        }
    
    def save_metrics(self):
        with open(self.metrics_file, 'w') as f:
            json.dump(self.metrics, f, indent=2)
    
    def record_conversation(self, duration_seconds, message_count):
        self.metrics["total_conversations"] += 1
        self.metrics["total_messages"] += message_count
        logger.info(f"Conversation recorded: {duration_seconds}s, {message_count} messages")
        self.save_metrics()
    
    def record_error(self, error_type, error_message):
        self.metrics["errors"] += 1
        logger.error(f"Error recorded: {error_type} - {error_message}")
        self.save_metrics()

class HealthCheck:
    """Health check endpoint data"""
    
    @staticmethod
    def get_status():
        return {
            "status": "ok",
            "timestamp": datetime.now().isoformat(),
            "service": "JARVIS_X_AGENT",
            "version": "3.0"
        }

# Initialize monitor
monitor = PerformanceMonitor()

def log_startup():
    logger.info("=" * 50)
    logger.info("JARVIS X Agent Starting")
    logger.info("=" * 50)
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info("Status: READY")

def log_connection(user_id, room_name):
    logger.info(f"User connected: {user_id} in room: {room_name}")

def log_message_processed(user_id, message, response_time):
    logger.info(f"Message processed - User: {user_id}, Time: {response_time:.2f}s, Message: {message[:50]}...")

def log_error(error_type, error_message, user_id=None):
    logger.error(f"Error - Type: {error_type}, User: {user_id}, Message: {error_message}")
    monitor.record_error(error_type, error_message)

def log_shutdown():
    logger.info("=" * 50)
    logger.info("JARVIS X Agent Shutting Down")
    logger.info("=" * 50)
    logger.info(f"Final metrics: {monitor.metrics}")
