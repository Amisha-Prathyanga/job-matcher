/**
 * Express App Definition
 * Separated from server startup for Vercel support
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cvRoutes from './routes/cvRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

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

export default app;
