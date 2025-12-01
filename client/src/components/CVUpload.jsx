import React, { useState } from 'react';
import axios from 'axios';

const CVUpload = ({ onCVUploaded }) => {
  const [cvText, setCvText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cvText.trim() && !selectedFile) {
      setMessage({ type: 'error', text: 'Please enter your CV text or upload a TXT file' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('cvFile', selectedFile);
      } else {
        formData.append('cvText', cvText);
      }

      const response = await axios.post('/api/cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage({ 
        type: 'success', 
        text: response.data.message + ` Found ${response.data.data.skills.length} skills.` 
      });
      
      // Store CV text in localStorage for persistence
      if (response.data.data.text) {
        localStorage.setItem('cvText', response.data.data.text);
      }
      
      if (onCVUploaded) {
        onCVUploaded(response.data.data);
      }
      
      // Clear form after successful upload
      setSelectedFile(null);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to upload CV' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        setMessage({
          type: 'error',
          text: 'Please upload a PDF or TXT file'
        });
        return;
      }
      setSelectedFile(file);
      setCvText(''); // Clear text input when file is selected
      setMessage({ 
        type: 'info', 
        text: `Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)` 
      });
    }
  };

  return (
    <div className="glass-card fade-in">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
        📄 Upload Your CV
      </h2>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">
            Option 1: Paste your CV text
          </label>
          <textarea
            className="textarea"
            value={cvText}
            onChange={(e) => {
              setCvText(e.target.value);
              setSelectedFile(null); // Clear file when typing
            }}
            placeholder="Paste your CV here... Include your skills, experience, education, and projects."
            rows={8}
            disabled={selectedFile !== null}
          />
        </div>

        <div style={{ 
          textAlign: 'center', 
          margin: '1rem 0',
          color: 'var(--text-muted)',
          fontWeight: '600'
        }}>
          OR
        </div>

        <div className="input-group">
          <label className="input-label">
            Option 2: Upload PDF or TXT file
          </label>
          <input
            type="file"
            id="cvFile"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            style={{
              padding: '12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              width: '100%',
              cursor: 'pointer'
            }}
          />
          {selectedFile && (
            <div style={{ 
              marginTop: '0.5rem', 
              padding: '8px 12px',
              background: 'var(--bg-highlight)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              color: 'var(--primary-light)'
            }}>
              ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Uploading...
            </>
          ) : (
            '📤 Upload CV'
          )}
        </button>
      </form>

      <div style={{ 
        marginTop: '1rem', 
        padding: '12px',
        background: 'var(--bg-highlight)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}>
        💡 <strong>Tip:</strong> Paste your CV text above or upload a PDF/TXT file for best results.
        The more detailed your CV, the better the job matching accuracy.
      </div>
    </div>
  );
};

export default CVUpload;
