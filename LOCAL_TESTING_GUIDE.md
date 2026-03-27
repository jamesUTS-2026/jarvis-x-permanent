# JARVIS X - Local Testing Guide

## What You'll Test
- ✅ Website (already running)
- ✅ Python agent backend (local)
- ✅ End-to-end voice communication
- ✅ Memory system
- ✅ Analytics

## Prerequisites
- Python 3.11+ installed
- Your LiveKit credentials (you already have these)
- Your OpenAI API key

## Step 1: Start the Python Agent Locally

### 1.1 Open Terminal/Command Prompt
```bash
cd jarvis-x-permanent/agent
```

### 1.2 Create Virtual Environment
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 1.3 Install Dependencies
```bash
pip install -r requirements.txt
```

### 1.4 Create .env File
Create a file named `.env` in the `agent/` directory:

```
LIVEKIT_URL=wss://devhole-w0k6k53n.livekit.cloud
LIVEKIT_API_KEY=APIUThUujxj4wmh
LIVEKIT_API_SECRET=EJd7jvY08zh0pKQBFtCfNSjwdvyVce1aX8jeu8iNVD3B
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**Replace `sk-proj-your-actual-key-here` with your real OpenAI API key**

### 1.5 Run the Agent
```bash
python agent.py
```

You should see:
```
Agent started and listening for connections...
```

**Keep this terminal open!**

---

## Step 2: Test the Website

### 2.1 Open Another Terminal
```bash
cd jarvis-x-permanent
pnpm dev
```

The website should open at: `http://localhost:5173`

### 2.2 Sign In
- Click "Sign In" on the landing page
- Use your Manus account credentials

### 2.3 Test Voice Interface
1. Click "Open Mic" button
2. Speak clearly: "Hello JARVIS, what is your name?"
3. Wait for response (should hear JARVIS respond)
4. Ask follow-up questions

---

## Step 3: Verify Each Component

### Test 1: Memory System
```
You: "My name is John"
JARVIS: Should respond acknowledging your name

You: "What is my name?"
JARVIS: Should respond "Your name is John"
```

### Test 2: Web Search
```
You: "What is the weather in New York?"
JARVIS: Should search and provide weather info
```

### Test 3: Time/Date
```
You: "What time is it?"
JARVIS: Should respond with current time
```

### Test 4: Continuous Listening
```
You: Ask first question
JARVIS: Responds
(Mic should auto-activate)
You: Ask follow-up question immediately
JARVIS: Responds
```

---

## Step 4: Check Analytics

1. Visit website at `http://localhost:5173`
2. Click your profile → "Analytics"
3. You should see:
   - Total conversations
   - Total messages
   - Average response time
   - Memory facts stored
   - Daily activity chart

---

## Troubleshooting

### Issue: "Failed to connect to LiveKit"
**Solution:**
- Verify LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET in .env
- Check internet connection
- Verify LiveKit account is active

### Issue: "OpenAI API error"
**Solution:**
- Verify OPENAI_API_KEY is correct
- Check API key has GPT-4 and TTS access
- Verify account has credits

### Issue: "No audio response"
**Solution:**
- Check browser allows microphone access
- Verify speaker volume is on
- Check browser console (F12) for errors
- Verify agent is running (check terminal)

### Issue: "Agent crashes"
**Solution:**
- Check error message in terminal
- Verify all environment variables are set
- Check Python version (need 3.11+)
- Try reinstalling dependencies: `pip install -r requirements.txt --force-reinstall`

### Issue: "Slow response"
**Solution:**
- This is normal for first request (model loading)
- Subsequent requests should be faster
- Check internet connection speed

---

## Step 5: Monitor Agent Logs

While testing, watch the agent terminal for:

```
[INFO] User connected: user_123
[INFO] Processing: "Hello JARVIS"
[INFO] LLM Response: "Hello! I'm JARVIS..."
[INFO] TTS Generated: 2.3s
[INFO] Audio sent to user
```

---

## Next: Deploy to Production

Once local testing works perfectly:

1. **Deploy Agent to Railway**
   - Sign up at https://railway.app
   - Connect GitHub repo
   - Add environment variables
   - Deploy

2. **Update Frontend**
   - Change agent URL from `localhost:8000` to Railway URL
   - Redeploy website

3. **Monitor Production**
   - Check logs daily
   - Monitor costs (OpenAI, LiveKit)
   - Gather user feedback

---

## Testing Checklist

- [ ] Agent starts without errors
- [ ] Website loads at localhost:5173
- [ ] Can sign in to website
- [ ] Microphone works (browser asks for permission)
- [ ] Can speak to JARVIS
- [ ] JARVIS responds with voice
- [ ] Memory system works (remembers name)
- [ ] Web search works
- [ ] Analytics dashboard shows data
- [ ] Continuous listening works (auto-restart after response)
- [ ] No crashes or errors in 5+ conversations

---

## Need Help?

Check these files:
- `agent/agent.py` - Agent logic
- `client/src/pages/VoiceAssistant.tsx` - Frontend voice interface
- `RAILWAY_DEPLOYMENT.md` - Production deployment guide
- `AGENT_DEPLOYMENT.md` - Agent deployment options

---

**You're ready to test JARVIS X locally!** 🚀
