# Deploy JARVIS X Agent to Railway - Step by Step

## ✅ Credentials Ready
All environment variables are configured and validated:
- ✅ OPENAI_API_KEY
- ✅ LIVEKIT_URL
- ✅ LIVEKIT_API_KEY
- ✅ LIVEKIT_API_SECRET

## Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Start for Free"
3. Sign up with GitHub (recommended) or email
4. Verify email

## Step 2: Create New Project
1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub"
3. Authorize Railway to access your GitHub

## Step 3: Select Repository
1. Find and select: `jarvis-x-permanent`
2. Click "Deploy"
3. Railway will auto-detect the Dockerfile

## Step 4: Add Environment Variables
While deployment is building:

1. In Railway dashboard, go to your project
2. Click "Variables" tab
3. Add these 4 variables:

```
OPENAI_API_KEY=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
LIVEKIT_URL=wss://devhole-w0k6k53n.livekit.cloud
LIVEKIT_API_KEY=APIUThUujxj4wmh
LIVEKIT_API_SECRET=EJd7jvY08zh0pKQBFtCfNSjwdvyVce1aX8jeu8iNVD3B
```

4. Click "Save"

## Step 5: Wait for Deployment
- Railway builds Docker image (~2-3 minutes)
- Deploys to production
- You'll see green checkmark when live

## Step 6: Get Agent URL
1. In Railway, go to "Deployments" tab
2. Copy the public URL (looks like: `https://jarvis-agent-production.up.railway.app`)
3. Save this URL - you'll need it for the website

## Step 7: Update Website
1. Go to Manus Management UI
2. In Code panel, find: `client/src/lib/livekit.ts`
3. Update agent URL:
```typescript
const AGENT_URL = 'https://your-railway-url-here';
```
4. Redeploy website

## Step 8: Test End-to-End
1. Visit: https://jarvisxevl-62asqp4i.manus.space
2. Sign in
3. Click "Open Mic"
4. Say: "Hello JARVIS, what is your name?"
5. Listen for voice response

## Troubleshooting

**Deployment fails:**
- Check Dockerfile is in root directory
- Verify requirements.txt exists in agent/ folder
- Check agent/agent.py exists

**Agent crashes after deploy:**
- Check environment variables are set correctly
- View logs in Railway: Deployments → Logs
- Verify OpenAI API key is valid

**No voice response:**
- Verify agent URL is correct in website
- Check browser console (F12) for errors
- Verify microphone permission granted

**Agent won't start:**
- Check Python version (need 3.11+)
- Verify all dependencies installed
- Check logs for specific error message

## Monitoring

### View Logs
In Railway dashboard:
1. Click your project
2. Click "Logs" tab
3. Watch for errors in real-time

### Check Status
```bash
curl https://your-railway-url/health
```

Should return: `{"status": "ok"}`

### Monitor Costs
- OpenAI: ~$0.02-0.50 per conversation
- LiveKit: Free tier (10 concurrent users)
- Railway: Free tier includes 5GB/month

## Next Steps After Deployment

1. ✅ Agent deployed to Railway
2. ✅ Website updated with agent URL
3. ✅ Test voice communication works
4. ✅ Monitor logs and performance
5. ✅ Share with users!

---

**Your JARVIS X is going LIVE! 🚀**

Need help? Check the logs in Railway dashboard for specific error messages.
