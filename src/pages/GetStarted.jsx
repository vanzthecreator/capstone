import React from 'react';
import { useNavigate } from 'react-router-dom';

function GetStarted() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%)',
      padding: '1.25rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '1.25rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          background: 'rgba(16,185,129,0.15)',
          borderRadius: '50%'
        }} />

        <div style={{ marginBottom: '1.25rem' }}>
          <img
            src="/images/lifesignal-logo.png"
            alt="LifeSignal"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            style={{ width: '120px', height: '120px', objectFit: 'contain', margin: '0 auto' }}
          />
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>LifeSignal</div>
          <div style={{ color: '#64748b', marginTop: '0.25rem' }}>Your Health. Your Data.</div>
        </div>

        <button
          onClick={() => navigate('/start')}
          style={{
            width: '100%',
            background: '#22d3ee',
            color: '#0f172a',
            fontWeight: 700,
            border: '2px solid #6366f1',
            borderRadius: '0.75rem',
            padding: '0.85rem 1rem',
            boxShadow: '0 8px 16px rgba(99,102,241,0.25)'
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default GetStarted;
