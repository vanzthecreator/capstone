import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Dashboard() {
  const navigate = useNavigate();

  const signals = [
    { id: 1, name: 'Heart Rate', value: '72 BPM', status: 'Normal', color: '#10b981' },
    { id: 2, name: 'Oxygen Level', value: '98%', status: 'Normal', color: '#10b981' },
    { id: 3, name: 'Blood Pressure', value: '120/80', status: 'Normal', color: '#10b981' },
    { id: 4, name: 'Temperature', value: '98.6°F', status: 'Normal', color: '#10b981' },
  ];

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '2rem 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>Overview of patient signals</p>
          </div>
          <button onClick={() => navigate('/')} className="btn" style={{ border: '1px solid var(--border-color)', background: 'white' }}>
            Logout
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {signals.map((signal) => (
            <div key={signal.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{signal.name}</h3>
                <span style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  backgroundColor: signal.color 
                }}></span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {signal.value}
              </div>
              <div style={{ 
                display: 'inline-block', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '999px', 
                backgroundColor: '#d1fae5', 
                color: '#065f46', 
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {signal.status}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Live Signal Graph</h2>
          <div style={{ 
            height: '300px', 
            background: '#f8fafc', 
            borderRadius: '0.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px dashed var(--border-color)'
          }}>
            <p style={{ color: 'var(--text-muted)' }}>Signal Graph Placeholder (e.g. ECG Waveform)</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
