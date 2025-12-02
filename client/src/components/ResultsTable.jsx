import React, { useState, useEffect } from 'react';
import CoverLetterModal from './CoverLetterModal';

const ResultsTable = ({ jobs, onMatch, cvText }) => {
  const [sortedJobs, setSortedJobs] = useState([]);
  const [sortBy, setSortBy] = useState('matchScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRows, setExpandedRows] = useState({});
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      sortJobs(jobs, sortBy, sortOrder);
    }
  }, [jobs, sortBy, sortOrder]);

  const toggleRow = (jobId) => {
    setExpandedRows(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const handleGenerateCoverLetter = (job) => {
    console.log('Cover letter button clicked!');
    console.log('Job:', job);
    console.log('CV Text available:', !!cvText);
    console.log('CV Text length:', cvText?.length || 0);
    setSelectedJob(job);
    setShowCoverLetterModal(true);
  };

  const sortJobs = (jobList, field, order) => {
    const sorted = [...jobList].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      if (field === 'matchScore' || field === 'matchPercentage') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      // Handle date sorting
      if (field === 'postedAt') {
        aVal = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        bVal = b.postedAt ? new Date(b.postedAt).getTime() : 0;
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    setSortedJobs(sorted);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getMatchBadge = (score) => {
    if (!score && score !== 0) return null;
    
    const percentage = Math.round(score * 100);
    let badgeClass = 'badge-low';
    
    if (percentage >= 70) badgeClass = 'badge-high';
    else if (percentage >= 40) badgeClass = 'badge-medium';

    return <span className={`badge ${badgeClass}`}>{percentage}%</span>;
  };

  const formatPostedDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (!jobs || jobs.length === 0) {
    return (
      <div className="glass-card fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          No jobs to display. Search for jobs to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
          📊 Job Results ({sortedJobs.length})
        </h2>
        {onMatch && (
          <button 
            className="btn btn-primary"
            onClick={onMatch}
          >
            Match with CV
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {sortedJobs[0]?.matchScore !== undefined && (
                <th 
                  onClick={() => handleSort('matchScore')}
                  style={{ cursor: 'pointer' }}
                >
                  Match {sortBy === 'matchScore' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              )}
              <th 
                onClick={() => handleSort('title')}
                style={{ cursor: 'pointer' }}
              >
                Job Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('company')}
                style={{ cursor: 'pointer' }}
              >
                Company {sortBy === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('postedAt')}
                style={{ cursor: 'pointer' }}
              >
                Posted {sortBy === 'postedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map((job, index) => (
              <React.Fragment key={job.id || index}>
                <tr className={expandedRows[job.id] ? 'expanded-row' : ''}>
                  {job.matchScore !== undefined && (
                    <td>{getMatchBadge(job.matchScore)}</td>
                  )}
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    {job.title}
                    {job.cvSuggestions?.hasImprovements && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>
                        ✨ Suggestions available
                      </div>
                    )}
                  </td>
                  <td>{job.company}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {formatPostedDate(job.postedAt)}
                  </td>
                  <td>{job.location}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {job.applyLink && job.applyLink !== '#' ? (
                        <a 
                          href={job.applyLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          onClick={(e) => e.stopPropagation()}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.8rem',
                            textDecoration: 'none'
                          }}
                        >
                          Apply
                        </a>
                      ) : null}
                      
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleGenerateCoverLetter(job)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        title="Generate AI Cover Letter"
                      >
                        📝 Cover Letter
                      </button>
                      
                      {job.cvSuggestions && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => toggleRow(job.id)}
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          {expandedRows[job.id] ? 'Hide' : 'Insights'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedRows[job.id] && job.cvSuggestions && (
                  <tr className="details-row">
                    <td colSpan="6" style={{ padding: '0' }}>
                      <div style={{ 
                        padding: '1.5rem', 
                        background: 'var(--bg-highlight)',
                        borderBottom: '1px solid var(--border)'
                      }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                          🎯 Match Insights & Suggestions
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                          {job.cvSuggestions.suggestions.map((suggestion, i) => (
                            <div key={i} style={{ 
                              background: 'var(--bg-secondary)', 
                              padding: '1rem', 
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border)'
                            }}>
                              <h5 style={{ 
                                color: suggestion.type === 'skills' ? '#ef4444' : '#f59e0b',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                {suggestion.type === 'skills' ? '⚠️' : '💡'} {suggestion.title}
                              </h5>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {suggestion.description}
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {suggestion.items.map((item, j) => (
                                  <span key={j} style={{ 
                                    background: 'var(--bg-tertiary)',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace'
                                  }}>
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                          
                          {job.cvSuggestions.suggestions.length === 0 && (
                            <div style={{ 
                              gridColumn: '1 / -1',
                              textAlign: 'center',
                              color: 'var(--success)',
                              padding: '1rem'
                            }}>
                              ✅ Great match! Your CV seems to cover all major requirements.
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {sortedJobs.length > 0 && sortedJobs[0].matchScore !== undefined && (
        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
          💡 Jobs are sorted by match score. Click "Insights" to see how to improve your CV for specific roles.
        </div>
      )}

      {showCoverLetterModal && selectedJob && cvText && (
        <CoverLetterModal
          job={selectedJob}
          cvText={cvText}
          onClose={() => setShowCoverLetterModal(false)}
        />
      )}
    </div>
  );
};

export default ResultsTable;

