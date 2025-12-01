/**
 * SerpAPI Service
 * Handles job fetching from Google Jobs via SerpAPI
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SERPAPI_BASE_URL = 'https://serpapi.com/search';

/**
 * Fetch jobs from SerpAPI Google Jobs
 * @param {string} query - Job search query (e.g., "laravel developer")
 * @param {string} location - Location filter (e.g., "Sri Lanka")
 * @returns {Promise<Object[]>} - Array of job results
 */
export async function fetchJobs(query, location = 'Sri Lanka') {
  if (!SERPAPI_KEY || SERPAPI_KEY === 'your_serpapi_key_here') {
    throw new Error('⚠️ SERPAPI_KEY not configured. Please:\n1. Copy .env.example to .env\n2. Get your API key from https://serpapi.com\n3. Add it to the .env file\n4. Restart the server');
  }

  try {
    const params = {
      engine: 'google_jobs',
      q: query,
      location: location,
      api_key: SERPAPI_KEY,
      hl: 'en',
      gl: 'lk' // Google country code for Sri Lanka
    };

    console.log(`Fetching jobs for: "${query}" in ${location}`);
    
    const response = await axios.get(SERPAPI_BASE_URL, { params });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    const jobs = response.data.jobs_results || [];
    
    console.log(`Found ${jobs.length} jobs`);
    
    return jobs;
  } catch (error) {
    console.error('SerpAPI Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Provide helpful error messages
      if (error.response.status === 401) {
        throw new Error('Invalid SerpAPI key. Please check your API key in .env file');
      } else if (error.response.status === 429) {
        throw new Error('SerpAPI rate limit exceeded. Please wait or upgrade your plan');
      }
    }
    
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }
}

/**
 * Fetch a single job's details by ID
 * @param {string} jobId - Google Jobs ID
 * @returns {Promise<Object>} - Job details
 */
export async function fetchJobDetails(jobId) {
  if (!SERPAPI_KEY || SERPAPI_KEY === 'your_serpapi_key_here') {
    throw new Error('SERPAPI_KEY not configured');
  }

  try {
    const params = {
      engine: 'google_jobs_listing',
      q: jobId,
      api_key: SERPAPI_KEY
    };

    const response = await axios.get(SERPAPI_BASE_URL, { params });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching job details:', error.message);
    throw new Error('Failed to fetch job details');
  }
}
