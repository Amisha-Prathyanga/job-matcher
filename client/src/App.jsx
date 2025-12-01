import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CVUpload from './components/CVUpload';
import JobSearch from './components/JobSearch';
import ResultsTable from './components/ResultsTable';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [cvUploaded, setCvUploaded] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleCVUploaded = (cvData) => {
    setCvUploaded(true);
    setMessage({
      type: 'success',
      text: `CV uploaded! Found skills: ${cvData.skills.slice(0, 5).join(', ')}${cvData.skills.length > 5 ? '...' : ''}`
    });
  };

  const handleJobsFound = (foundJobs) => {
    setJobs(foundJobs);
  };

  const handleMatch = async () => {
    if (!cvUploaded) {
      setMessage({
        type: 'error',
        text: 'Please upload your CV first!'
      });
      return;
    }

    if (jobs.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please search for jobs first!'
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/match', { jobs });
      
      setJobs(response.data.data.jobs);
      setMessage({
        type: 'success',
        text: `Matched ${response.data.data.matchedJobs} jobs with your CV!`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to match jobs'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      
      {/* Header */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        paddingTop: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          🎯 Job Matcher
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          AI-powered job matching using NLP and SerpAPI
        </p>
      </header>

      {/* Global Message */}
      {message && (
        <div className={`alert alert-${message.type} fade-in`} style={{ marginBottom: '2rem' }}>
          {message.text}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <CVUpload onCVUploaded={handleCVUploaded} />
        <JobSearch onJobsFound={handleJobsFound} />
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="spinner" style={{ width: '40px', height: '40px' }}></span>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Matching jobs with your CV...
          </p>
        </div>
      ) : (
        <ResultsTable jobs={jobs} onMatch={jobs.length > 0 && !jobs[0]?.matchScore ? handleMatch : null} />
      )}

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '4rem',
        paddingBottom: '2rem',
        color: 'var(--text-muted)'
      }}>
        <p>Built with Node.js, Express, React, and SerpAPI</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Powered by OpenAI Embeddings for intelligent job matching
        </p>
      </footer>
    </div>
  );
}

export default App;
