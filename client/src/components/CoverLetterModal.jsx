import React, { useState } from 'react';
import axios from 'axios';
import '../modal.css';

const CoverLetterModal = ({ job, cvText, onClose }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Generate cover letter on mount
  React.useEffect(() => {
    generateCoverLetter();
  }, []);

  const generateCoverLetter = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/generate-cover-letter', {
        job,
        cvText
      });

      setCoverLetter(response.data.data.coverLetter);
    } catch (err) {
      console.error('Error generating cover letter:', err);
      setError(err.response?.data?.error || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${job.company.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 Cover Letter</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Generating your personalized cover letter...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
              <button 
                className="btn btn-secondary" 
                onClick={generateCoverLetter}
                style={{ marginTop: '1rem' }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && coverLetter && (
            <>
              <div className="job-info">
                <strong>{job.title}</strong> at <strong>{job.company}</strong>
              </div>

              <div className="cover-letter-text">
                {coverLetter}
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={handleCopy}>
                  {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                </button>
                <button className="btn btn-secondary" onClick={handleDownload}>
                  💾 Download as TXT
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterModal;
