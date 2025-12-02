/**
 * Cover Letter Service
 * Generates personalized cover letters using OpenAI
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a demo/template cover letter (fallback when OpenAI fails)
 */
function generateDemoCoverLetter(cvText, job) {
  const matchedSkills = job.matchedSkills?.join(', ') || 'relevant technical skills';
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background in software development and proven expertise in ${matchedSkills}, I am confident that I would be a valuable addition to your team.

Throughout my career, I have developed a strong foundation in modern web technologies and best practices. My experience aligns well with the requirements outlined in your job posting, particularly in areas such as ${matchedSkills}. I am passionate about creating efficient, scalable solutions and staying current with emerging technologies.

What excites me most about this opportunity at ${job.company} is the chance to contribute to innovative projects while continuing to grow professionally. I am particularly drawn to your company's commitment to excellence and the collaborative environment you foster.

I am eager to bring my technical skills, problem-solving abilities, and enthusiasm to your team. I would welcome the opportunity to discuss how my background and skills would benefit ${job.company}.

Thank you for considering my application. I look forward to the possibility of contributing to your team's success.

Sincerely,
[Your Name]

---
Note: This is a demo cover letter. For personalized AI-generated letters, please add OpenAI API credits.`;
}

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
    
    // If OpenAI fails (quota, API key, etc.), use demo mode
    if (error.status === 429 || error.code === 'insufficient_quota' || error.message?.includes('quota')) {
      console.log('OpenAI quota exceeded, using demo mode...');
      return generateDemoCoverLetter(cvText, job);
    }
    
    throw new Error(`Failed to generate cover letter: ${error.message}`);
  }
}
