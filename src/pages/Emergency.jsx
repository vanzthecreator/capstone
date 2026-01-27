import React from 'react';
import Header from '../components/Header';
import { Briefcase, Flame, Baby, Ambulance, Hammer, ShieldAlert } from 'lucide-react';

function Emergency() {
  const safetyNumbers = [
    { icon: Briefcase, label: 'Medical' },
    { icon: Flame, label: 'Fire' },
    { icon: Baby, label: 'Child protection' },
    { icon: Ambulance, label: 'Accident' }, // Using Ambulance as proxy for crash
    { icon: Hammer, label: 'Violence' }, // Using Hammer as proxy for weapon/violence
    { icon: ShieldAlert, label: 'Rescue' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a', // Dark background
      color: 'white',
      paddingBottom: '100px', // Space for bottom nav
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Header theme="dark" />
      
      {/* Background Map Effect (Placeholder) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        background: 'radial-gradient(circle at center, #1e293b 0%, #000 100%)',
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 1, padding: '1rem' }}>
        
        {/* Hero Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Are you in an <br />
            emergency?
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.5', maxWidth: '60%' }}>
            You may send a message directly to the emergency department through this app for immediate assistance.
          </p>
          
          {/* Illustration Placeholder */}
          <div style={{ 
            position: 'absolute', 
            top: '60px', 
            right: '-20px', 
            width: '180px', 
            height: '180px', 
            // background: 'rgba(255,255,255,0.1)', 
            // borderRadius: '1rem',
            // display: 'flex',
            // alignItems: 'center',
            // justifyContent: 'center'
          }}>
            {/* SVG or Image would go here */}
            {/* <span style={{fontSize: '3rem'}}>👥</span> */}
          </div>
        </div>

        {/* Central Pulse Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          margin: '3rem 0'
        }}>
          <div style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)', // Outer glow ring 1
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'pulse 2s infinite'
          }}>
             <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)', // White center
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 0 20px rgba(255,255,255,0.2)'
            }}>
               <div style={{
                 width: '60px',
                 height: '60px',
                 background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                 borderRadius: '50%',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 marginBottom: '0.5rem'
               }}>
                 <ShieldAlert color="white" size={32} />
               </div>
               <span style={{ 
                 color: '#ef4444', 
                 fontWeight: 'bold', 
                 fontSize: '0.9rem' 
               }}>LifeSignal</span>
             </div>
          </div>
        </div>

        {/* Public Safety Numbers Grid */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#cbd5e1' }}>Public Safety Numbers</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.75rem' 
          }}>
            {safetyNumbers.map((item, index) => (
              <button key={index} style={{
                background: 'white',
                border: 'none',
                borderRadius: '1rem', // Pill shape
                padding: '0.75rem 0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                color: '#0f172a',
                fontSize: '0.7rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                <item.icon size={14} color="#000" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2); }
          70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      `}</style>
    </div>
  );
}

export default Emergency;
