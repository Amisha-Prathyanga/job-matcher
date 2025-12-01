# 🎯 Job Matcher - AI-Powered Job Matching Application

A full-stack Node.js application that intelligently matches your CV with job opportunities from Google Jobs (via SerpAPI) using advanced NLP embeddings.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey)

## ✨ Features

- 🔍 **Job Search**: Fetch real-time job listings from Google Jobs via SerpAPI
- 📄 **CV Upload**: Upload or paste your CV for intelligent matching
- 🤖 **AI Matching**: Uses OpenAI embeddings for semantic similarity matching
- 📊 **Match Scoring**: Get percentage match scores for each job
- 🎨 **Premium UI**: Modern dark theme with glassmorphism and smooth animations
- ⚡ **Fast & Efficient**: Caching and optimized API calls
- 🔄 **Fallback Matching**: Keyword-based matching when embeddings unavailable

## 🏗️ Architecture

```
job-matcher/
├── src/                      # Backend source code
│   ├── server.js            # Express server
│   ├── routes/              # API routes
│   │   ├── cvRoutes.js     # CV upload endpoints
│   │   └── jobRoutes.js    # Job search & matching endpoints
│   ├── services/            # Business logic
│   │   ├── serpapiService.js    # SerpAPI integration
│   │   ├── cvService.js         # CV processing
│   │   ├── jobCleaner.js        # Job normalization
│   │   └── matchingService.js   # NLP matching engine
│   ├── utils/               # Utilities
│   │   └── embeddings.js   # OpenAI embeddings & similarity
│   └── db/                  # JSON storage
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── CVUpload.jsx
│   │   │   ├── JobSearch.jsx
│   │   │   └── ResultsTable.jsx
│   │   ├── App.jsx         # Main app component
│   │   └── index.css       # Premium dark theme styles
│   └── package.json
└── package.json            # Backend dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- SerpAPI account (get free API key at [serpapi.com](https://serpapi.com))
- OpenAI API key (optional, for better matching)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd C:\Users\USER\.gemini\antigravity\scratch\job-matcher
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   PORT=3000
   SERPAPI_KEY=your_actual_serpapi_key_here
   OPENAI_API_KEY=your_actual_openai_key_here
   USE_SIMPLE_MATCHING=false
   ```

   **Getting API Keys:**
   - **SerpAPI**: Sign up at https://serpapi.com → Dashboard → API Key
   - **OpenAI**: Sign up at https://platform.openai.com → API Keys → Create new key

### Running the Application

1. **Start the backend server** (in project root):
   ```bash
   npm start
   ```
   
   Server will run on `http://localhost:3000`

2. **Start the frontend** (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173`

3. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Upload CV
```http
POST /api/cv
Content-Type: application/json

{
  "cvText": "Your CV content here..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "CV uploaded successfully",
  "data": {
    "skills": ["javascript", "react", "node.js"],
    "length": 1234,
    "uploadedAt": "2025-12-01T10:15:00.000Z"
  }
}
```

#### 2. Search Jobs
```http
GET /api/search?query=laravel+developer&location=Sri+Lanka
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "laravel developer",
    "location": "Sri Lanka",
    "count": 15,
    "jobs": [
      {
        "id": "job_123",
        "title": "Laravel Developer",
        "company": "Tech Company",
        "description": "...",
        "location": "Colombo, Sri Lanka",
        "applyLink": "https://...",
        "provider": "LinkedIn",
        "salary": "Rs. 100,000 - 150,000"
      }
    ]
  }
}
```

#### 3. Match Jobs with CV
```http
POST /api/match
Content-Type: application/json

{
  "jobs": [...] // Optional, uses cached jobs if not provided
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalJobs": 15,
    "matchedJobs": 12,
    "minScore": 0.3,
    "jobs": [
      {
        "id": "job_123",
        "title": "Laravel Developer",
        "matchScore": 0.85,
        "matchPercentage": 85,
        ...
      }
    ]
  }
}
```

#### 4. Search and Match (Combined)
```http
POST /api/search-and-match
Content-Type: application/json

{
  "query": "software engineer",
  "location": "Sri Lanka",
  "cvText": "..." // Optional if CV already uploaded
}
```

## 💡 Usage Examples

### Example 1: Basic Workflow

1. **Upload your CV**
   - Paste your CV text in the CV Upload section
   - Click "Upload CV"

2. **Search for jobs**
   - Enter job title (e.g., "Laravel Developer")
   - Enter location (default: "Sri Lanka")
   - Click "Search Jobs"

3. **Match jobs with your CV**
   - Click "Match with CV" button
   - View results sorted by match score

### Example 2: Using cURL

```bash
# 1. Upload CV
curl -X POST http://localhost:3000/api/cv \
  -H "Content-Type: application/json" \
  -d '{"cvText": "Experienced Laravel developer with 5 years..."}'

# 2. Search jobs
curl "http://localhost:3000/api/search?query=laravel+developer&location=Sri+Lanka"

# 3. Match jobs
curl -X POST http://localhost:3000/api/match
```

### Example 3: JavaScript/Axios

```javascript
import axios from 'axios';

// Upload CV
await axios.post('/api/cv', {
  cvText: 'Your CV content...'
});

// Search and match in one call
const response = await axios.post('/api/search-and-match', {
  query: 'software engineer',
  location: 'Sri Lanka'
});

console.log(response.data.data.jobs);
```

## 🎨 Features Breakdown

### NLP Matching Engine

The application uses two matching strategies:

1. **OpenAI Embeddings** (Recommended)
   - Uses `text-embedding-3-small` model
   - Semantic understanding of CV and job descriptions
   - Cosine similarity for accurate matching
   - Higher accuracy but requires API key

2. **Keyword Matching** (Fallback)
   - Simple word overlap analysis
   - No external API required
   - Set `USE_SIMPLE_MATCHING=true` in `.env`

### Match Score Calculation

- Base score from cosine similarity (0-1)
- Title boost for keyword matches in job title
- Normalized to percentage (0-100%)
- Color-coded badges:
  - 🟢 Green (70%+): High match
  - 🟡 Yellow (40-69%): Medium match
  - 🔴 Red (<40%): Low match

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Backend server port |
| `SERPAPI_KEY` | **Yes** | - | SerpAPI key for job fetching |
| `OPENAI_API_KEY` | No | - | OpenAI key for embeddings |
| `USE_SIMPLE_MATCHING` | No | false | Use keyword matching instead |

### Customization

**Change job search parameters:**
Edit `src/services/serpapiService.js`:
```javascript
const params = {
  engine: 'google_jobs',
  q: query,
  location: location,
  hl: 'en',
  gl: 'lk', // Country code
  num: 20   // Number of results
};
```

**Adjust match score threshold:**
Edit `src/routes/jobRoutes.js`:
```javascript
const minScore = parseFloat(req.query.minScore) || 0.3; // Default 30%
```

## 🐛 Troubleshooting

### "SERPAPI_KEY not configured"
- Make sure you've created a `.env` file (copy from `.env.example`)
- Add your actual SerpAPI key
- Restart the server

### "Failed to generate embedding"
- Check your OpenAI API key
- Ensure you have credits in your OpenAI account
- Set `USE_SIMPLE_MATCHING=true` to use keyword matching instead

### CORS errors
- Make sure backend is running on port 3000
- Frontend proxy is configured in `client/vite.config.js`
- Both servers must be running

### No jobs found
- Check your SerpAPI quota (free tier has limits)
- Try different search queries
- Verify location is correct

## 📊 Performance Tips

1. **Caching**: Embeddings are cached to reduce API calls
2. **Batch Processing**: Jobs are matched in parallel
3. **Text Truncation**: Long descriptions are truncated to 2000 chars
4. **Debouncing**: Consider adding debounce to search input

## 🔒 Security Notes

- Never commit `.env` file to version control
- API keys are server-side only
- CORS is enabled for development (configure for production)
- Validate all user inputs

## 🚢 Deployment

### Backend (Node.js)
- Deploy to Heroku, Railway, or Render
- Set environment variables in platform settings
- Use `npm start` as start command

### Frontend (React)
- Build: `cd client && npm run build`
- Deploy `client/dist` folder to Vercel, Netlify, or Cloudflare Pages
- Update API base URL for production

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Add user authentication
- Implement database (PostgreSQL/MongoDB)
- Add job bookmarking
- Email notifications for new matches
- Resume parsing from PDF
- More advanced NLP features

## 📧 Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Verify environment variables

---

**Built with ❤️ using Node.js, Express, React, SerpAPI, and OpenAI**
