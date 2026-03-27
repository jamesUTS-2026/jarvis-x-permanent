# Deploy JARVIS X Agent to Railway

## Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub or email
3. Create a new project

## Step 2: Connect GitHub Repository
1. Click "New Project" → "Deploy from GitHub"
2. Select your repository (jarvis-x-permanent)
3. Railway will auto-detect the Dockerfile

## Step 3: Add Environment Variables
In Railway dashboard, add these environment variables:

```
LIVEKIT_URL=wss://devhole-w0k6k53n.livekit.cloud
LIVEKIT_API_KEY=APIUThUujxj4wmh
LIVEKIT_API_SECRET=EJd7jvY08zh0pKQBFtCfNSjwdvyVce1aX8jeu8iNVD3B
OPENAI_API_KEY=sk-proj-your-key-here
```

## Step 4: Deploy
1. Click "Deploy"
2. Railway builds and deploys automatically
3. You'll get a public URL like: `https://jarvis-agent-production.up.railway.app`

## Step 5: Update Frontend
Update the frontend to connect to your deployed agent:

In `client/src/lib/livekit.ts`, update the agent URL:
```typescript
const AGENT_URL = 'https://jarvis-agent-production.up.railway.app';
```

## Step 6: Monitor
- View logs in Railway dashboard
- Check agent health: `curl https://your-agent-url/health`
- Monitor resource usage and costs

## Troubleshooting

**Build fails:**
- Check Dockerfile syntax
- Verify requirements.txt has all dependencies
- Check logs in Railway dashboard

**Agent crashes:**
- Check environment variables are set
- Verify OpenAI API key is valid
- Check LiveKit credentials

**No response from agent:**
- Verify agent is running: `curl https://your-agent-url/health`
- Check firewall/network settings
- Review agent logs

## Next Steps
1. Test voice communication end-to-end
2. Monitor performance and costs
3. Add custom tools as needed
4. Scale if needed (more agents, load balancing)

---

**Your JARVIS X is now LIVE!** 🚀
