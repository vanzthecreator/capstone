import React from 'react';
import { MapPin, Camera, MessageSquare, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Header({ theme = 'light', enableLocationNav = false }) {
  const isDark = theme === 'dark';
  const textColor = isDark ? 'white' : '#1e293b';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const navigate = useNavigate();

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: isDark ? '#0f172a' : 'white', // Dark slate or white
      color: textColor,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#e2e8f0'
        }}>
          <img 
            src="/images/2.png" 
            alt="Profile" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
          />
        </div>
        <div 
          onClick={enableLocationNav ? () => navigate('/location') : undefined}
          style={{ cursor: enableLocationNav ? 'pointer' : 'default' }}
        >
          <div style={{ fontSize: '0.75rem', color: subTextColor }}>Current location</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}>
            <MapPin size={14} color="#f59e0b" />
            Cebu City, Philippines
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Camera size={20} />
        <MessageSquare size={20} />
        <Bell size={20} />
      </div>
    </header>
  );
}

export default Header;
