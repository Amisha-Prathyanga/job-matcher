/**
 * Job Routes
 * Handles job search and matching
 */

import express from 'express';
import { fetchJobs } from '../services/serpapiService.js';
import { normalizeJobs, deduplicateJobs, filterByPostingDate } from '../services/jobCleaner.js';
import { matchJobsWithCV, filterByMinScore, generateCVSuggestions } from '../services/matchingService.js';
import { getStoredCV } from './cvRoutes.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Cache for job results
let cachedJobs = [];

/**
 * GET /api/search
 * Search for jobs using SerpAPI
 * Query params: query, location, timeFilter
 */
router.get('/search', async (req, res) => {
  try {
    const { query, location = 'Sri Lanka', timeFilter = 'all' } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    console.log(`Searching for: "${query}" in ${location} (filter: ${timeFilter})`);

    // Fetch jobs from SerpAPI
    const rawJobs = await fetchJobs(query, location);

    // Normalize and clean jobs
    let jobs = normalizeJobs(rawJobs);
    jobs = deduplicateJobs(jobs);
    
    // Apply time filter
    const filteredJobs = filterByPostingDate(jobs, timeFilter);

    // Cache the results
    cachedJobs = filteredJobs;

    // Save to file
    try {
      const jobsPath = path.join(__dirname, '../db/jobs.json');
      await fs.writeFile(jobsPath, JSON.stringify({
        query,
        location,
        timeFilter,
        fetchedAt: new Date().toISOString(),
        count: filteredJobs.length,
        jobs: filteredJobs
      }, null, 2));
    } catch (err) {
      console.warn('Could not save jobs to file:', err.message);
    }

    res.json({
      success: true,
      data: {
        query,
        location,
        timeFilter,
        totalJobs: jobs.length,
        filteredJobs: filteredJobs.length,
        count: filteredJobs.length,
        jobs: filteredJobs
      }
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/match
 * Match jobs with uploaded CV
 * Body: { jobs, cvText (optional) }
 */
router.post('/match', async (req, res) => {
  try {
    const { jobs, cvText } = req.body;

    if (!jobs || !Array.isArray(jobs)) {
      return res.status(400).json({
        success: false,
        error: 'Jobs array is required'
      });
    }

    // Get CV from request body or fallback to stored CV
    let cvData = null;
    if (cvText) {
      // Use CV text from request
      cvData = { text: cvText };
    } else {
      // Fallback to stored CV (for backward compatibility)
      cvData = getStoredCV();
    }

    if (!cvData || !cvData.text) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a CV first using POST /api/cv'
      });
    }

    console.log(`Matching ${jobs.length} jobs with CV...`);

    // Perform matching
    const matchedJobs = await matchJobsWithCV(cvData.text, jobs);

    // Filter by minimum score (optional)
    const minScore = parseFloat(req.query.minScore) || 0;
    const filteredJobs = filterByMinScore(matchedJobs, minScore);
    
    // Generate CV suggestions for each job
    const jobsWithSuggestions = filteredJobs.map(job => ({
      ...job,
      cvSuggestions: generateCVSuggestions(cvData.text, job)
    }));

    res.json({
      success: true,
      data: {
        totalJobs: jobs.length,
        matchedJobs: filteredJobs.length,
        minScore: minScore,
        jobs: jobsWithSuggestions
      }
    });
  } catch (error) {
    console.error('Error matching jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/jobs
 * Get cached jobs
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      count: cachedJobs.length,
      jobs: cachedJobs
    }
  });
});

/**
 * POST /api/search-and-match
 * Combined endpoint: search and match in one request
 * Body: { query, location, cvText (optional) }
 */
router.post('/search-and-match', async (req, res) => {
  try {
    const { query, location = 'Sri Lanka', cvText } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Get CV
    let cv = getStoredCV();
    if (cvText) {
      // Use provided CV text
      cv = { text: cvText };
    }

    if (!cv) {
      return res.status(400).json({
        success: false,
        error: 'CV is required. Either upload via POST /api/cv or include cvText in request'
      });
    }

    // Fetch and normalize jobs
    const rawJobs = await fetchJobs(query, location);
    let jobs = normalizeJobs(rawJobs);
    jobs = deduplicateJobs(jobs);

    // Match jobs
    const matchedJobs = await matchJobsWithCV(cv.text, jobs);

    // Filter by minimum score
    const minScore = parseFloat(req.query.minScore) || 0.2;
    const filteredJobs = filterByMinScore(matchedJobs, minScore);

    res.json({
      success: true,
      data: {
        query,
        location,
        totalJobs: jobs.length,
        matchedJobs: filteredJobs.length,
        minScore: minScore,
        jobs: filteredJobs
      }
    });
  } catch (error) {
    console.error('Error in search-and-match:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
