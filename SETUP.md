# 🚀 Quick Setup Guide

## Current Issues and Solutions

### ❌ Errors You're Seeing:

1. **404 favicon.ico** - ✅ FIXED (added emoji favicon)
2. **400 Bad Request on /api/cv** - ✅ FIXED (improved error messages)
3. **500 Internal Server Error on /api/search** - ⚠️ **ACTION REQUIRED**

### 🔧 How to Fix the 500 Error

The 500 error occurs because **SerpAPI key is not configured**. Here's how to fix it:

#### Step 1: Get Your SerpAPI Key

1. Go to https://serpapi.com
2. Click "Sign Up" (free tier available)
3. After signing up, go to your Dashboard
4. Copy your API key

#### Step 2: Configure the .env File

1. Open the file: `C:\Users\USER\.gemini\antigravity\scratch\job-matcher\.env`
2. Find the line: `SERPAPI_KEY=your_serpapi_key_here`
3. Replace `your_serpapi_key_here` with your actual API key
4. Save the file

Example:
```env
SERPAPI_KEY=abc123your_actual_key_here456
```

#### Step 3: Restart the Backend Server

1. Stop the backend server (Ctrl+C in the terminal)
2. Start it again: `npm start`
3. The server should now work!

## Alternative: Use Without SerpAPI (Testing Only)

If you want to test the UI without SerpAPI, you can create a mock endpoint:

1. The frontend will show better error messages now
2. You can still upload CV and see the UI
3. Job search will show a clear error message with instructions

## ✅ What's Been Fixed

1. **Favicon**: Added 🎯 emoji favicon (no more 404)
2. **Error Messages**: Much clearer messages when:
   - SerpAPI key is missing
   - CV is invalid
   - API rate limits are hit
3. **User Guidance**: Errors now include step-by-step instructions

## 🎯 Next Steps

1. **Get SerpAPI Key** (5 minutes)
   - Sign up at https://serpapi.com
   - Free tier: 100 searches/month

2. **Add to .env** (1 minute)
   - Edit `.env` file
   - Add your key
   - Save

3. **Restart Server** (10 seconds)
   - Stop backend (Ctrl+C)
   - Run `npm start`

4. **Test the App** (2 minutes)
   - Upload a CV
   - Search for "Laravel Developer"
   - See matched jobs!

## 📝 Example .env File

Your `.env` file should look like this:

```env
# Server Configuration
PORT=3000

# SerpAPI Configuration
SERPAPI_KEY=your_actual_key_from_serpapi_dashboard

# OpenAI Configuration (optional - for better matching)
OPENAI_API_KEY=your_openai_key_here

# Use simple keyword matching (set to true if no OpenAI key)
USE_SIMPLE_MATCHING=true
```

## 🆘 Still Having Issues?

### Backend won't start?
- Check if port 3000 is already in use
- Try changing PORT in .env to 3001

### Frontend won't connect?
- Make sure backend is running first
- Check that backend is on port 3000
- Clear browser cache and reload

### CV upload fails?
- Make sure CV has at least 50 characters
- Check that you're pasting actual text (not empty)

### Jobs search fails?
- Verify SerpAPI key is correct
- Check you haven't exceeded free tier limit (100/month)
- Try a simpler search query like "software engineer"

## 💡 Tips

1. **Start Simple**: Try "software engineer" as your first search
2. **Check Logs**: Backend terminal shows helpful error messages
3. **Free Tier**: SerpAPI free tier is enough for testing
4. **OpenAI Optional**: App works without OpenAI (uses keyword matching)

---

**Need help?** Check the error messages in:
- Browser console (F12)
- Backend terminal
- They now include step-by-step instructions!
