/**
 * Job Cleaner Service
 * Normalizes and cleans job data from SerpAPI
 */

/**
 * Normalize raw job results from SerpAPI into consistent format
 * @param {Object[]} rawJobs - Raw job results from SerpAPI
 * @returns {Object[]} - Normalized job objects
 */
export function normalizeJobs(rawJobs) {
  if (!Array.isArray(rawJobs)) {
    return [];
  }

  return rawJobs.map((job, index) => {
    // Extract apply link - SerpAPI provides multiple possible fields
    let applyLink = job.apply_link || job.apply_options?.[0]?.link || job.share_url || job.related_links?.[0]?.link;
    
    // If still no link, try to construct a Google Jobs search link
    if (!applyLink || applyLink === '#') {
      const jobId = job.job_id;
      if (jobId) {
        applyLink = `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company_name)}&ibp=htl;jobs#fpstate=tldetail&htivrt=jobs&htiq=${encodeURIComponent(job.title)}&htidocid=${jobId}`;
      } else {
        // Last resort: Google search for the job
        applyLink = `https://www.google.com/search?q=${encodeURIComponent(job.title + ' at ' + job.company_name)}`;
      }
    }

    // Parse posting date
    const postedAt = parsePostingDate(job.detected_extensions?.posted_at);

    return {
      id: job.job_id || `job_${index}`,
      title: job.title || 'Untitled Position',
      company: job.company_name || 'Unknown Company',
      description: cleanDescription(job.description || ''),
      location: formatLocation(job.location),
      applyLink: applyLink,
      provider: job.via || 'Unknown',
      postedAt: postedAt,
      postedAtRaw: job.detected_extensions?.posted_at || null,
      deadline: job.detected_extensions?.posted_at || null,
      schedule: job.detected_extensions?.schedule_type || null,
      salary: extractSalary(job),
      thumbnail: job.thumbnail || null,
      // Keep raw data for reference
      raw: job
    };
  });
}

/**
 * Parse posting date string to Date object
 * @param {string} dateString - Date string from SerpAPI
 * @returns {Date|null} - Parsed date or null
 */
function parsePostingDate(dateString) {
  if (!dateString) return null;

  const now = new Date();
  const lowerDate = dateString.toLowerCase();

  // Handle relative dates
  if (lowerDate.includes('hour') || lowerDate.includes('hr')) {
    const hours = parseInt(lowerDate.match(/\d+/)?.[0] || '1');
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  }
  
  if (lowerDate.includes('day')) {
    const days = parseInt(lowerDate.match(/\d+/)?.[0] || '1');
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }
  
  if (lowerDate.includes('week')) {
    const weeks = parseInt(lowerDate.match(/\d+/)?.[0] || '1');
    return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  }
  
  if (lowerDate.includes('month')) {
    const months = parseInt(lowerDate.match(/\d+/)?.[0] || '1');
    return new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000);
  }

  // Try to parse as regular date
  try {
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch (e) {
    // Ignore parsing errors
  }

  return null;
}

/**
 * Clean and truncate job description
 * @param {string} description - Raw description
 * @returns {string} - Cleaned description
 */
function cleanDescription(description) {
  if (!description) return '';
  
  // Remove excessive whitespace
  let cleaned = description.replace(/\s+/g, ' ').trim();
  
  // Truncate to reasonable length (for embedding efficiency)
  if (cleaned.length > 2000) {
    cleaned = cleaned.substring(0, 2000) + '...';
  }
  
  return cleaned;
}

/**
 * Format location string
 * @param {string} location - Raw location
 * @returns {string} - Formatted location
 */
function formatLocation(location) {
  if (!location) return 'Sri Lanka';
  return location.trim();
}

/**
 * Extract salary information if available
 * @param {Object} job - Raw job object
 * @returns {string|null} - Salary string or null
 */
function extractSalary(job) {
  if (job.detected_extensions?.salary) {
    return job.detected_extensions.salary;
  }
  
  // Try to extract from description
  const salaryMatch = job.description?.match(/(?:Rs\.?|LKR|USD)\s*[\d,]+(?:\s*-\s*[\d,]+)?/i);
  return salaryMatch ? salaryMatch[0] : null;
}

/**
 * Filter jobs by keywords
 * @param {Object[]} jobs - Normalized jobs
 * @param {string[]} keywords - Keywords to filter by
 * @returns {Object[]} - Filtered jobs
 */
export function filterJobsByKeywords(jobs, keywords) {
  if (!keywords || keywords.length === 0) {
    return jobs;
  }

  const lowerKeywords = keywords.map(k => k.toLowerCase());

  return jobs.filter(job => {
    const searchText = `${job.title} ${job.description} ${job.company}`.toLowerCase();
    return lowerKeywords.some(keyword => searchText.includes(keyword));
  });
}

/**
 * Remove duplicate jobs based on title and company
 * @param {Object[]} jobs - Job array
 * @returns {Object[]} - Deduplicated jobs
 */
export function deduplicateJobs(jobs) {
  const seen = new Set();
  
  return jobs.filter(job => {
    const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Filter jobs by posting date
 * @param {Object[]} jobs - Job array
 * @param {string} timeFilter - Time filter: '24h', 'week', 'month', 'all'
 * @returns {Object[]} - Filtered jobs
 */
export function filterByPostingDate(jobs, timeFilter = 'all') {
  if (timeFilter === 'all' || !timeFilter) {
    return jobs;
  }

  const now = new Date();
  let cutoffDate;

  switch (timeFilter) {
    case '24h':
      cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return jobs;
  }

  return jobs.filter(job => {
    if (!job.postedAt) return true; // Include jobs without date
    return job.postedAt >= cutoffDate;
  });
}

