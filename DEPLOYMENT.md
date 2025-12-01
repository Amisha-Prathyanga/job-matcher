# 🚀 Deploying to Vercel

This guide will help you deploy the Job Matcher application to Vercel.

## 1. Prerequisites
- A [Vercel account](https://vercel.com)
- The project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## 2. Project Configuration (Already Done)
I have already prepared the project for deployment:
- **Backend**: Refactored to run as a Serverless Function in `api/index.js`.
- **Routing**: Added `vercel.json` to route API requests to the backend and other requests to the frontend.

## 3. Deployment Steps

1.  **Log in to Vercel** and click **"Add New..."** -> **"Project"**.
2.  **Import your repository**.
3.  **Configure Project Settings**:
    *   **Framework Preset**: Select `Vite`.
    *   **Root Directory**: Leave as `./` (default).
    *   **Build & Development Settings**:
        *   **Build Command**: `npm run build`
            > ⚠️ **Important**: Copy ONLY the text inside the code block. Do NOT copy the backticks (`) or quotes.
        *   **Output Directory**: `client/dist`
        *   **Install Command**: `npm install`
4.  **Environment Variables**:
    Add the following variables (copy values from your `.env` file):
    *   `SERPAPI_KEY`
    *   `OPENAI_API_KEY`
    *   `NODE_ENV` = `production`
5.  Click **"Deploy"**.

## 4. Troubleshooting
- **500 Errors on API**: Check the "Functions" tab in Vercel logs. Ensure API keys are correct.
- **404 on Frontend**: Ensure the "Output Directory" is set exactly to `client/dist`.

## 5. Local Development
To run locally, you can still use:
```bash
# Terminal 1 (Backend)
npm start

# Terminal 2 (Frontend)
cd client
npm run dev
```
