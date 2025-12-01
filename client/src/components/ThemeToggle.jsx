import React from 'react';

const ThemeToggle = ({ isDark, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        padding: '8px 16px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '20px',
        boxShadow: 'var(--shadow)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)'
      }}
    >
      {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
};

export default ThemeToggle;
