# Python Agent Deployment Guide

## Quick Start (Local Development)

```bash
cd agent
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python agent.py
```

## Production Deployment

### Option 1: Railway (Recommended - Free Tier)

1. **Create Railway Account** - https://railway.app
2. **Connect GitHub Repository** - Link your project repo
3. **Add Environment Variables**:
   ```
   LIVEKIT_URL=wss://devhole-w0k6k53n.livekit.cloud
   LIVEKIT_API_KEY=APIUThUujxj4wmh
   LIVEKIT_API_SECRET=EJd7jvY08zh0pKQBFtCfNSjwdvyVce1aX8jeu8iNVD3B
   OPENAI_API_KEY=sk-proj-your-key
   ```
4. **Deploy** - Railway auto-deploys on git push

### Option 2: Heroku

```bash
heroku create jarvis-x-agent
heroku config:set LIVEKIT_URL=wss://devhole-w0k6k53n.livekit.cloud
heroku config:set LIVEKIT_API_KEY=APIUThUujxj4wmh
heroku config:set LIVEKIT_API_SECRET=EJd7jvY08zh0pKQBFtCfNSjwdvyVce1aX8jeu8iNVD3B
heroku config:set OPENAI_API_KEY=sk-proj-your-key
git push heroku main
```

### Option 3: Docker (Any Cloud)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY agent/requirements.txt .
RUN pip install -r requirements.txt
COPY agent/ .
CMD ["python", "agent.py"]
```

Deploy to: AWS, GCP, Azure, DigitalOcean, etc.

## Monitoring

### Check Agent Logs
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Docker
docker logs <container-id>
```

### Health Check
```bash
curl https://your-agent-url/health
```

## Troubleshooting

**Issue: "Failed to connect to LiveKit"**
- Verify LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET are correct
- Check firewall allows WebRTC connections

**Issue: "OpenAI API error"**
- Verify OPENAI_API_KEY is valid
- Check API key has GPT-4 and TTS access

**Issue: "Agent crashes after X minutes"**
- Check memory usage (agent may need more RAM)
- Implement connection pooling for API calls
- Monitor long-running conversations

## Performance Tips

1. **Use connection pooling** for OpenAI API calls
2. **Cache web search results** to reduce API calls
3. **Implement request timeout** to prevent hanging
4. **Monitor memory usage** for long conversations
5. **Use async/await** for concurrent operations

## Security

1. Never commit `.env` files to git
2. Use environment variables for all secrets
3. Implement rate limiting on agent endpoints
4. Validate all user inputs before processing
5. Log security events and monitor for anomalies

## Scaling

- **Single Agent**: Handles 1-10 concurrent users
- **Multiple Agents**: Use load balancer (Railway/Heroku handle this)
- **Enterprise**: Kubernetes with auto-scaling

## Next Steps

1. Deploy agent backend to production
2. Update frontend to connect to deployed agent
3. Monitor performance and user metrics
4. Add custom tools based on user needs
5. Implement caching and optimization

---

**Status**: Ready for deployment  
**Last Updated**: 2026-03-27
