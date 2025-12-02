/**
 * Cover Letter Service
 * Generates personalized cover letters using OpenAI
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a personalized cover letter for a job application
 * @param {string} cvText - The user's CV text
 * @param {object} job - The job object with title, company, description, etc.
 * @param {string} userName - Optional user name for personalization
 * @returns {Promise<string>} - The generated cover letter
 */
export async function generateCoverLetter(cvText, job, userName = 'the applicant') {
  try {
    console.log(`Generating cover letter for ${job.title} at ${job.company}...`);

    // Extract key skills from the job match data
    const matchedSkills = job.matchedSkills?.join(', ') || 'relevant skills';
    const matchScore = job.matchScore ? `${Math.round(job.matchScore * 100)}%` : 'high';

    const prompt = `You are a professional career coach. Write a compelling cover letter for a job application.

Job Details:
- Position: ${job.title}
- Company: ${job.company}
- Location: ${job.location || 'Not specified'}
- Match Score: ${matchScore}
- Key Matched Skills: ${matchedSkills}

Candidate's CV Summary:
${cvText.substring(0, 1500)}

Instructions:
1. Write a professional, engaging cover letter (250-350 words)
2. Address it to "Hiring Manager" (don't make up names)
3. Highlight the candidate's relevant experience and skills that match this specific role
4. Show enthusiasm for the company and position
5. Include a strong opening and closing
6. Use a professional but warm tone
7. Don't use overly generic phrases
8. Format with proper paragraphs

Generate the cover letter now:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career coach who writes compelling, personalized cover letters that help candidates stand out.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const coverLetter = response.choices[0].message.content.trim();
    console.log('Cover letter generated successfully');
    
    return coverLetter;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error(`Failed to generate cover letter: ${error.message}`);
  }
}
