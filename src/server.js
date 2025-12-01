/**
 * Express Server
 * Main application entry point
 */

import app from './app.js';

const PORT = process.env.PORT || 3000;

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
