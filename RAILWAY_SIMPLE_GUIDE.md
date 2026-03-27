# 🚀 Deploy JARVIS X Agent - Simple 5-Minute Guide

## What You'll Do
Deploy the Python AI agent to Railway so it can process voice conversations.

---

## STEP 1: Go to Railway Website
**Click this link:** https://railway.app

You'll see a page with "Start for Free" button.

---

## STEP 2: Sign Up
Click "Start for Free"

Choose one:
- **GitHub** (recommended - easier)
- **Email**

Follow the prompts to create account.

---

## STEP 3: Create New Project
After signing in, you'll see Railway dashboard.

Click **"New Project"** button (top right)

---

## STEP 4: Deploy from GitHub
You'll see options. Click:

**"Deploy from GitHub"**

---

## STEP 5: Authorize Railway
Railway will ask to access your GitHub.

Click **"Authorize"**

This lets Railway access your code repository.

---

## STEP 6: Select Repository
You'll see list of your GitHub repos.

Find and click: **"jarvis-x-permanent"**

---

## STEP 7: Railway Starts Building
Railway automatically:
1. Detects the Dockerfile
2. Builds Docker image
3. Deploys to servers

This takes 2-3 minutes. You'll see progress.

---

## STEP 8: Add Environment Variables
While building, go to **"Variables"** tab in Railway.

Click **"Add Variable"** and paste each one:

### Variable 1:
```
Key: OPENAI_API_KEY
Value: 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
```
Click "Add"

### Variable 2:
```
Key: LIVEKIT_URL
Value: wss://devhole-w0k6k53n.livekit.cloud
```
Click "Add"

### Variable 3:
```
Key: LIVEKIT_API_KEY
Value: APIUThUujxj4wmh
```
Click "Add"

### Variable 4:
```
Key: LIVEKIT_API_SECRET
Value: EJd7jvY08zh0pKQBFtCfNSjwdvyVce1aX8jeu8iNVD3B
```
Click "Add"

---

## STEP 9: Wait for Deployment
Railway shows progress. When you see ✅ **green checkmark**, deployment is complete!

---

## STEP 10: Get Your Agent URL
In Railway dashboard, look for:

**"Domains"** or **"URL"** section

Copy the URL (looks like):
```
https://jarvis-agent-production.up.railway.app
```

**Save this URL - you'll need it!**

---

## STEP 11: Update Website
Go to Manus Management UI (where you deployed the website)

Click **"Code"** panel

Find file: `client/src/lib/livekit.ts`

Look for this line:
```typescript
const AGENT_URL = 'http://localhost:8000';
```

Change it to:
```typescript
const AGENT_URL = 'https://your-railway-url-here';
```

Replace `your-railway-url-here` with the URL from Step 10

Save the file. Website auto-redeploys.

---

## STEP 12: Test It Works
1. Visit: https://jarvisxevl-62asqp4i.manus.space
2. Sign in
3. Click **"Open Mic"** button
4. Say: **"Hello JARVIS"**
5. Listen for voice response

If you hear JARVIS respond, **you're done!** 🎉

---

## Troubleshooting

### "Deployment failed"
- Check internet connection
- Try deploying again
- Check Railway logs for error

### "No voice response"
- Verify agent URL is correct in website code
- Check browser allows microphone
- Refresh page and try again

### "Agent keeps crashing"
- Check all 4 environment variables are set correctly
- View Railway logs to see error message
- Try redeploying

---

## That's It!

Your JARVIS X is now **LIVE** with real voice AI! 🚀

Users can now:
- Visit your website
- Speak to JARVIS
- Get instant AI responses with voice
- Have continuous conversations

**Congratulations!** 🎉
