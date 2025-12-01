/**
 * CV Service
 * Handles CV text processing and cleaning
 */

/**
 * Clean and normalize CV text
 * @param {string} cvText - Raw CV text
 * @returns {string} - Cleaned CV text
 */
export function cleanCVText(cvText) {
  if (!cvText || typeof cvText !== 'string') {
    throw new Error('Invalid CV text provided');
  }

  // Remove excessive whitespace
  let cleaned = cvText.replace(/\s+/g, ' ').trim();

  // Remove special characters that don't add value
  cleaned = cleaned.replace(/[^\w\s.,;:()\-+#@]/g, '');

  // Validate minimum length
  if (cleaned.length < 50) {
    throw new Error('CV text is too short. Please provide a more detailed CV.');
  }

  return cleaned;
}

/**
 * Extract key skills from CV text
 * @param {string} cvText - CV text
 * @returns {string[]} - Array of skills
 */
export function extractSkills(cvText) {
  const commonSkills = [
    'javascript', 'python', 'java', 'php', 'laravel', 'react', 'vue', 'angular',
    'node.js', 'express', 'mongodb', 'mysql', 'postgresql', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'git', 'agile', 'scrum', 'rest api', 'graphql',
    'typescript', 'html', 'css', 'sass', 'webpack', 'ci/cd', 'jenkins',
    'machine learning', 'ai', 'data science', 'sql', 'nosql', 'redis'
  ];

  const lowerCV = cvText.toLowerCase();
  const foundSkills = [];

  for (const skill of commonSkills) {
    if (lowerCV.includes(skill)) {
      foundSkills.push(skill);
    }
  }

  return foundSkills;
}

/**
 * Extract years of experience from CV
 * @param {string} cvText - CV text
 * @returns {number|null} - Years of experience or null
 */
export function extractExperience(cvText) {
  const patterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?experience/i,
    /experience[:\s]+(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*yrs?\s+exp/i
  ];

  for (const pattern of patterns) {
    const match = cvText.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  return null;
}

/**
 * Validate CV text
 * @param {string} cvText - CV text to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateCV(cvText) {
  const errors = [];

  if (!cvText || typeof cvText !== 'string') {
    errors.push('CV text is required');
  } else {
    if (cvText.trim().length < 50) {
      errors.push('CV is too short (minimum 50 characters)');
    }
    // Removed maximum character limit to allow full CVs
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
