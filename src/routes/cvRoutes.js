/**
 * CV Routes
 * Handles CV upload and management
 */

import express from 'express';
import { cleanCVText, validateCV, extractSkills } from '../services/cvService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { extractText } = require('unpdf');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
});

// In-memory CV storage
let storedCV = null;

/**
 * Extract text from PDF buffer using unpdf
 */
async function extractTextFromPDF(buffer) {
  try {
    console.log('Starting PDF extraction with unpdf...');
    // Convert Buffer to Uint8Array as required by unpdf
    const uint8Array = new Uint8Array(buffer);
    const result = await extractText(uint8Array);
    console.log('PDF extraction result type:', typeof result);
    console.log('PDF extraction result:', JSON.stringify(result).substring(0, 200));
    
    // Handle different return formats
    let text = '';
    if (typeof result === 'string') {
      text = result;
    } else if (result && typeof result.text === 'string') {
      text = result.text;
    } else if (result && Array.isArray(result.pages)) {
      // Some libraries return pages array
      text = result.pages.map(p => p.text || '').join('\n');
    } else if (typeof result === 'object') {
      // Try to extract text from object
      text = JSON.stringify(result);
    }
    
    console.log('PDF extraction successful, length:', text.length);
    return text.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * POST /api/cv
 * Upload CV text or file (PDF/TXT)
 */
router.post('/', upload.single('cvFile'), async (req, res) => {
  try {
    let cvText = req.body.cvText;

    // If a file was uploaded, extract text from it
    if (req.file) {
      console.log(`Processing uploaded file: ${req.file.originalname} (${req.file.mimetype})`);
      
      if (req.file.mimetype === 'application/pdf') {
        // Extract text from PDF
        try {
          cvText = await extractTextFromPDF(req.file.buffer);
          console.log(`Extracted ${cvText.length} characters from PDF`);
        } catch (error) {
          console.error('PDF parsing error:', error);
          return res.status(400).json({
            success: false,
            error: 'Failed to parse PDF file. Please ensure it contains readable text.'
          });
        }
      } else if (req.file.mimetype === 'text/plain') {
        // Extract text from TXT file
        cvText = req.file.buffer.toString('utf-8');
      }
    }

    if (!cvText) {
      return res.status(400).json({
        success: false,
        error: 'CV text is required. Please paste your CV or upload a PDF/TXT file.'
      });
    }

    // Validate CV
    const validation = validateCV(cvText);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: `CV validation failed: ${validation.errors.join(', ')}`
      });
    }

    // Clean CV text
    const cleanedCV = cleanCVText(cvText);

    // Extract skills for preview
    const skills = extractSkills(cleanedCV);

    // Store CV
    storedCV = {
      text: cleanedCV,
      uploadedAt: new Date().toISOString(),
      skills: skills,
      fileName: req.file?.originalname || 'pasted_text'
    };

    // Optionally save to file
    try {
      const cvStorePath = path.join(__dirname, '../db/cvStore.json');
      await fs.writeFile(cvStorePath, JSON.stringify(storedCV, null, 2));
    } catch (err) {
      console.warn('Could not save CV to file:', err.message);
    }

    res.json({
      success: true,
      message: req.file 
        ? `CV file "${req.file.originalname}" uploaded successfully` 
        : 'CV uploaded successfully',
      data: {
        skills: skills,
        length: cleanedCV.length,
        uploadedAt: storedCV.uploadedAt,
        fileName: storedCV.fileName
      }
    });
  } catch (error) {
    console.error('Error uploading CV:', error);
    
    if (error.message.includes('Only PDF and TXT files')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/cv
 * Get stored CV information
 */
router.get('/', (req, res) => {
  if (!storedCV) {
    return res.status(404).json({
      success: false,
      error: 'No CV uploaded yet'
    });
  }

  res.json({
    success: true,
    data: {
      skills: storedCV.skills,
      length: storedCV.text.length,
      uploadedAt: storedCV.uploadedAt,
      preview: storedCV.text.substring(0, 200) + '...'
    }
  });
});

/**
 * DELETE /api/cv
 * Clear stored CV
 */
router.delete('/', (req, res) => {
  storedCV = null;
  
  res.json({
    success: true,
    message: 'CV cleared successfully'
  });
});

// Export router and CV getter
export default router;
export const getStoredCV = () => storedCV;
