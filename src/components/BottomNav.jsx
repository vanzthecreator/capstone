import React from 'react';
import { Home, PlusSquare, MessageSquare, User, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: PlusSquare, label: 'MEDIC', path: '/medic' },
    { icon: Activity, label: '', path: '/emergency', isCenter: true }, // The central button
    { icon: MessageSquare, label: 'Message', path: '/message' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e2e8f0',
      padding: '0.5rem 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '80px',
      zIndex: 50
    }}>
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        
        if (item.isCenter) {
          return (
            <div 
              key={index}
              onClick={() => navigate('/emergency')}
              style={{
                position: 'relative',
                top: '-25px',
                width: '70px',
                height: '70px',
                background: 'white',
                borderRadius: '50%',
                padding: '5px',
                boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // Red gradient
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 6px rgba(220, 38, 38, 0.4)'
              }}>
                <Activity size={32} />
              </div>
            </div>
          );
        }

        return (
          <div 
            key={index} 
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? '#f97316' : '#94a3b8', // Orange if active, gray otherwise
              cursor: 'pointer',
              flex: 1
            }}
          >
            <item.icon size={24} />
            <span style={{ fontSize: '0.75rem', fontWeight: isActive ? '600' : '400' }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default BottomNav;
