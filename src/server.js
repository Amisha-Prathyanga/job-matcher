/**
 * Express Server
 * Main application entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cvRoutes from './routes/cvRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Job Matcher API is running',
    version: '1.0.0',
    endpoints: {
      cv: {
        'POST /api/cv': 'Upload CV text',
        'GET /api/cv': 'Get stored CV info',
        'DELETE /api/cv': 'Clear stored CV'
      },
      jobs: {
        'GET /api/search?query=...&location=...': 'Search for jobs',
        'POST /api/match': 'Match jobs with CV',
        'POST /api/search-and-match': 'Search and match in one request',
        'GET /api/jobs': 'Get cached jobs'
      }
    }
  });
});

// API Routes
app.use('/api/cv', cvRoutes);
app.use('/api', jobRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 Job Matcher API Server');
  console.log('=================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
  console.log('=================================');
  console.log('\nAvailable endpoints:');
  console.log('  POST   /api/cv                - Upload CV');
  console.log('  GET    /api/search            - Search jobs');
  console.log('  POST   /api/match             - Match jobs with CV');
  console.log('  POST   /api/search-and-match  - Search & match combined');
  console.log('=================================\n');
  
  // Check for required environment variables
  if (!process.env.SERPAPI_KEY || process.env.SERPAPI_KEY === 'your_serpapi_key_here') {
    console.warn('⚠️  WARNING: SERPAPI_KEY not configured!');
    console.warn('   Please set SERPAPI_KEY in .env file');
  }
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.warn('⚠️  WARNING: OPENAI_API_KEY not configured!');
    console.warn('   Using simple keyword matching instead of embeddings');
    console.warn('   Set OPENAI_API_KEY in .env for better matching accuracy');
  }
});

export default app;
