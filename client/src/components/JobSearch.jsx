import React, { useState } from 'react';
import axios from 'axios';

const JobSearch = ({ onJobsFound }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Sri Lanka');
  const [timeFilter, setTimeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setMessage({ type: 'error', text: 'Please enter a search query' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.get('/api/search', {
        params: { query, location, timeFilter }
      });
      
      const jobs = response.data.data.jobs;
      
      setMessage({ 
        type: 'success', 
        text: `Found ${jobs.length} jobs!` 
      });
      
      if (onJobsFound) {
        onJobsFound(jobs);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to search jobs' 
      });
    } finally {
      setLoading(false);
    }
  };

  const quickSearches = [
    'Software Engineer',
    'Laravel Developer',
    'React Developer',
    'Full Stack Developer',
    'DevOps Engineer'
  ];

  return (
    <div className="glass-card fade-in">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
        🔍 Search Jobs
      </h2>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSearch}>
        <div className="input-group">
          <label className="input-label">Job Title or Keywords</label>
          <input
            type="text"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Laravel Developer, Software Engineer"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Location</label>
          <input
            type="text"
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Sri Lanka, Colombo"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Date Posted</label>
          <select
            className="input"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="all">Any time</option>
            <option value="24h">Past 24 hours</option>
            <option value="week">Past week</option>
            <option value="month">Past month</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : (
            <>
              Search Jobs
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <p className="input-label" style={{ marginBottom: '0.5rem' }}>Quick Searches:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {quickSearches.map((search) => (
            <button
              key={search}
              className="btn btn-secondary"
              onClick={() => setQuery(search)}
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
