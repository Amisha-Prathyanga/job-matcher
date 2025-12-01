/**
 * Matching Service
 * Matches CV with job descriptions using NLP embeddings
 */

import { getEmbedding, cosineSimilarity, keywordSimilarity } from '../utils/embeddings.js';
import dotenv from 'dotenv';

dotenv.config();

const USE_SIMPLE_MATCHING = process.env.USE_SIMPLE_MATCHING === 'true';

/**
 * Match jobs with CV and return sorted results
 * @param {string} cvText - User's CV text
 * @param {Object[]} jobs - Array of job objects
 * @returns {Promise<Object[]>} - Jobs with match scores, sorted by score
 */
export async function matchJobsWithCV(cvText, jobs) {
  if (!cvText || !jobs || jobs.length === 0) {
    return [];
  }

  console.log(`Matching ${jobs.length} jobs with CV...`);
  console.log(`Using ${USE_SIMPLE_MATCHING ? 'simple keyword' : 'OpenAI embeddings'} matching`);

  try {
    let cvEmbedding;
    
    // Get CV embedding if using advanced matching
    if (!USE_SIMPLE_MATCHING) {
      try {
        cvEmbedding = await getEmbedding(cvText);
      } catch (error) {
        console.warn('Failed to get CV embedding, falling back to keyword matching:', error.message);
        return simpleMatch(cvText, jobs);
      }
    }

    // Calculate match score for each job
    const jobsWithScores = await Promise.all(
      jobs.map(async (job) => {
        let matchScore;

        if (USE_SIMPLE_MATCHING || !cvEmbedding) {
          // Use simple keyword matching
          matchScore = keywordSimilarity(cvText, job.description);
        } else {
          // Use embedding-based matching
          try {
            const jobEmbedding = await getEmbedding(job.description);
            matchScore = cosineSimilarity(cvEmbedding, jobEmbedding);
          } catch (error) {
            console.warn(`Failed to embed job ${job.id}, using keyword fallback`);
            matchScore = keywordSimilarity(cvText, job.description);
          }
        }

        // Boost score based on title match
        const titleBoost = calculateTitleBoost(cvText, job.title);
        matchScore = Math.min(1, matchScore + titleBoost);

        return {
          ...job,
          matchScore: Math.round(matchScore * 100) / 100, // Round to 2 decimals
          matchPercentage: Math.round(matchScore * 100)
        };
      })
    );

    // Sort by match score (highest first)
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Matching complete. Top score: ${jobsWithScores[0]?.matchScore || 0}`);

    return jobsWithScores;
  } catch (error) {
    console.error('Error in matching service:', error);
    // Fallback to simple matching
    return simpleMatch(cvText, jobs);
  }
}

/**
 * Simple keyword-based matching (fallback)
 * @param {string} cvText - CV text
 * @param {Object[]} jobs - Jobs array
 * @returns {Object[]} - Jobs with scores
 */
function simpleMatch(cvText, jobs) {
  const jobsWithScores = jobs.map(job => {
    const matchScore = keywordSimilarity(cvText, job.description);
    const titleBoost = calculateTitleBoost(cvText, job.title);
    const finalScore = Math.min(1, matchScore + titleBoost);

    return {
      ...job,
      matchScore: Math.round(finalScore * 100) / 100,
      matchPercentage: Math.round(finalScore * 100)
    };
  });

  jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
  return jobsWithScores;
}

/**
 * Calculate title match boost
 * @param {string} cvText - CV text
 * @param {string} jobTitle - Job title
 * @returns {number} - Boost score (0 to 0.2)
 */
function calculateTitleBoost(cvText, jobTitle) {
  const cvLower = cvText.toLowerCase();
  const titleLower = jobTitle.toLowerCase();
  
  const titleWords = titleLower.split(/\s+/);
  const matchedWords = titleWords.filter(word => 
    word.length > 3 && cvLower.includes(word)
  );

  return Math.min(0.2, (matchedWords.length / titleWords.length) * 0.2);
}

/**
 * Filter jobs by minimum match score
 * @param {Object[]} matchedJobs - Jobs with match scores
 * @param {number} minScore - Minimum score threshold (0-1)
 * @returns {Object[]} - Filtered jobs
 */
export function filterByMinScore(matchedJobs, minScore = 0.3) {
  return matchedJobs.filter(job => job.matchScore >= minScore);
}

/**
 * Get match insights for a job
 * @param {string} cvText - CV text
 * @param {Object} job - Job object
 * @returns {Object} - Insights object
 */
export function getMatchInsights(cvText, job) {
  const cvWords = new Set(cvText.toLowerCase().match(/\b\w+\b/g) || []);
  const jobWords = job.description.toLowerCase().match(/\b\w+\b/g) || [];
  
  const matchedKeywords = jobWords.filter(word => 
    word.length > 4 && cvWords.has(word)
  );

  return {
    matchedKeywords: [...new Set(matchedKeywords)].slice(0, 10),
    totalKeywords: new Set(jobWords).size,
    matchRate: matchedKeywords.length / jobWords.length
  };
}

/**
 * Generate CV improvement suggestions for a job
 * @param {string} cvText - CV text
 * @param {Object} job - Job object
 * @returns {Object} - Suggestions object
 */
export function generateCVSuggestions(cvText, job) {
  const cvLower = cvText.toLowerCase();
  const jobDesc = job.description.toLowerCase();
  const jobTitle = job.title.toLowerCase();
  
  // Common tech skills and keywords
  const techSkills = [
    'javascript', 'python', 'java', 'php', 'laravel', 'react', 'vue', 'angular',
    'node.js', 'express', 'mongodb', 'mysql', 'postgresql', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'git', 'agile', 'scrum', 'rest api', 'graphql',
    'typescript', 'html', 'css', 'sass', 'webpack', 'ci/cd', 'jenkins',
    'machine learning', 'ai', 'data science', 'sql', 'nosql', 'redis',
    'flutter', 'react native', 'swift', 'kotlin', 'c++', 'c#', '.net'
  ];
  
  // Find missing skills mentioned in job but not in CV
  const missingSkills = techSkills.filter(skill => 
    (jobDesc.includes(skill) || jobTitle.includes(skill)) && !cvLower.includes(skill)
  );
  
  // Extract keywords from job description (important words)
  const jobWords = jobDesc.match(/\b\w{5,}\b/g) || [];
  const jobWordFreq = {};
  jobWords.forEach(word => {
    if (!['about', 'their', 'which', 'where', 'would', 'should', 'could'].includes(word)) {
      jobWordFreq[word] = (jobWordFreq[word] || 0) + 1;
    }
  });
  
  // Get top keywords from job not in CV
  const missingKeywords = Object.entries(jobWordFreq)
    .filter(([word]) => !cvLower.includes(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  // Generate suggestions
  const suggestions = [];
  
  if (missingSkills.length > 0) {
    suggestions.push({
      type: 'skills',
      title: 'Add Missing Skills',
      items: missingSkills.slice(0, 5),
      description: 'These skills are mentioned in the job description but not in your CV'
    });
  }
  
  if (missingKeywords.length > 0) {
    suggestions.push({
      type: 'keywords',
      title: 'Include Relevant Keywords',
      items: missingKeywords,
      description: 'Adding these keywords can improve your match score'
    });
  }
  
  // Check for experience level
  const yearsMatch = jobDesc.match(/(\d+)\+?\s*years?/i);
  if (yearsMatch && !cvLower.includes('year')) {
    suggestions.push({
      type: 'experience',
      title: 'Highlight Experience',
      items: [`Mention your ${yearsMatch[1]}+ years of experience`],
      description: 'The job requires specific years of experience'
    });
  }
  
  return {
    suggestions,
    matchScore: job.matchScore || 0,
    hasImprovements: suggestions.length > 0
  };
}
