# Real JARVIS Deployment Guide

## Overview

Real JARVIS is a production-ready voice AI assistant built with LiveKit for real-time WebRTC communication. This guide walks you through deploying the complete system.

## Architecture

```
Frontend (React)
    ↓ (WebRTC via LiveKit)
LiveKit Server (Cloud)
    ↓ (Agent Connection)
Python Agent Backend
    ├─ Speech-to-Text (Whisper)
    ├─ LLM Processing (GPT-4)
    ├─ Tool Execution (Web Search, Weather, etc.)
    └─ Text-to-Speech (OpenAI TTS - Onyx Voice)
```

## Prerequisites

1. **LiveKit Account** (Free tier available)
   - URL: https://livekit.cloud
   - Create project and get credentials

2. **OpenAI API Key**
   - URL: https://platform.openai.com/api-keys
   - Ensure you have GPT-4 and TTS access

3. **Node.js & Python**
   - Node.js 18+ (for frontend)
   - Python 3.9+ (for agent backend)

## Deployment Steps

### Step 1: Set Up Environment Variables

Update the following environment variables in your deployment:

**Frontend (.env in project root):**
```
LIVEKIT_URL=wss://devhole-w0k6k53n.livekit.cloud
LIVEKIT_API_KEY=APIUThUujxj4wmh
LIVEKIT_API_SECRET=EJd7jvY08zh0pKQBFtCfNSjwdvyVce1aX8jeu8iNVD3B
OPENAI_API_KEY=sk-proj-your-key
```

**Python Agent (.env in agent/ directory):**
```
LIVEKIT_URL=wss://devhole-w0k6k53n.livekit.cloud
LIVEKIT_API_KEY=APIUThUujxj4wmh
LIVEKIT_API_SECRET=EJd7jvY08zh0pKQBFtCfNSjwdvyVce1aX8jeu8iNVD3B
OPENAI_API_KEY=sk-proj-your-key
```

### Step 2: Deploy Python Agent Backend

**Local Development:**
```bash
cd agent
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python agent.py
```

**Production Deployment (Railway, Heroku, etc.):**
```bash
# Push to your hosting platform
# Make sure LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, OPENAI_API_KEY are set as env vars
python agent.py
```

### Step 3: Update Frontend to Use LiveKit

The frontend component is already prepared at `client/src/components/LiveKitVoiceRoom.tsx`

Update `client/src/pages/VoiceAssistant.tsx` or your main page:

```tsx
import { LiveKitVoiceRoom } from '@/components/LiveKitVoiceRoom';

export function VoiceAssistant() {
  return (
    <LiveKitVoiceRoom
      roomName="jarvis-voice-room"
      onConnected={() => console.log('Connected to JARVIS')}
      onDisconnected={() => console.log('Disconnected from JARVIS')}
    />
  );
}
```

### Step 4: Deploy Frontend

```bash
pnpm build
pnpm deploy  # Or use your hosting platform's deploy command
```

## Features

### Real-Time Voice Communication
- WebRTC connection via LiveKit
- Low-latency audio streaming
- Automatic reconnection handling

### AI Processing
- **Speech-to-Text**: Whisper API (free, runs locally)
- **LLM**: GPT-4 for intelligent responses
- **Text-to-Speech**: OpenAI TTS with onyx voice (deep, authoritative)

### Tool Integration
- **Web Search**: DuckDuckGo API (free, no key required)
- **Weather**: Open-Meteo API (free, no key required)
- **Time**: System time
- **Extensible**: Add custom tools easily

### Memory & Context
- Conversation history (last 20 messages)
- User memory facts for personalization
- Context-aware responses

## Monitoring & Debugging

### Check Agent Status
```bash
# View agent logs
tail -f agent_logs.txt

# Check LiveKit connection
curl https://devhole-w0k6k53n.livekit.cloud/api/rooms
```

### Common Issues

**Issue: "Failed to connect to LiveKit"**
- Verify LIVEKIT_URL is correct (should start with wss://)
- Check API key and secret are valid
- Ensure firewall allows WebRTC connections

**Issue: "OpenAI API error"**
- Verify OPENAI_API_KEY is set correctly
- Check you have GPT-4 and TTS access
- Monitor API usage at platform.openai.com

**Issue: "Audio not working"**
- Check microphone permissions in browser
- Verify audio devices are available
- Check browser console for errors

## Performance Optimization

### Frontend
- Use `React.memo` for components
- Implement audio visualization efficiently
- Cache LiveKit tokens

### Backend
- Use connection pooling for API calls
- Implement request caching for web search
- Monitor memory usage for long conversations

### Infrastructure
- Use CDN for static assets
- Deploy agent backend close to LiveKit server
- Monitor bandwidth usage

## Security Considerations

1. **API Keys**: Never commit .env files to git
2. **CORS**: Configure CORS properly for frontend-backend communication
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Data Privacy**: Don't store sensitive user data in conversation history
5. **SSL/TLS**: Always use HTTPS/WSS in production

## Scaling

### Single Agent
- Handles 1-10 concurrent users
- Suitable for testing and small deployments

### Multiple Agents
- Deploy multiple agent instances behind load balancer
- Use LiveKit's room-based routing
- Monitor CPU/memory per agent

### Enterprise
- Use Kubernetes for orchestration
- Implement auto-scaling based on metrics
- Use managed LiveKit service for reliability

## Support & Resources

- **LiveKit Docs**: https://docs.livekit.io
- **OpenAI Docs**: https://platform.openai.com/docs
- **GitHub Issues**: Report bugs and feature requests

## Next Steps

1. Deploy Python agent backend
2. Set up frontend with LiveKit component
3. Test end-to-end voice communication
4. Monitor logs and performance
5. Add custom tools as needed
6. Scale infrastructure based on usage

---

**Version**: 1.0  
**Last Updated**: 2026-03-27  
**Status**: Production Ready
