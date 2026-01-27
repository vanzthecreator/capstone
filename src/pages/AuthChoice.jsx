import React from 'react';
import { useNavigate } from 'react-router-dom';

function AuthChoice() {
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
        textAlign: 'center'
      }}>
        <img
          src="/images/lifesignal-logo.png"
          alt="LifeSignal"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          style={{ width: '96px', height: '96px', objectFit: 'contain', margin: '0 auto 0.75rem' }}
        />
        <div style={{ color: '#64748b', marginBottom: '1rem' }}>Choose an option</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/login')}
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
            LOGIN
          </button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              width: '100%',
              background: '#67e8f9',
              color: '#0f172a',
              fontWeight: 700,
              border: '2px solid #6366f1',
              borderRadius: '0.75rem',
              padding: '0.85rem 1rem',
              boxShadow: '0 8px 16px rgba(99,102,241,0.25)'
            }}
          >
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthChoice;
