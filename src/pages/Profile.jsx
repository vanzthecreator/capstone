import React from 'react';
import { 
  Settings, 
  ChevronLeft, 
  Heart, 
  Download, 
  Globe, 
  MapPin, 
  Trash2, 
  Clock, 
  LogOut, 
  ChevronRight,
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Heart, label: 'LIKES', action: () => console.log('Likes clicked') },
    { icon: Download, label: 'SAVED', action: () => console.log('Saved clicked') },
    { divider: true },
    { icon: Globe, label: 'Languages', action: () => console.log('Languages clicked') },
    { icon: MapPin, label: 'Location', action: () => navigate('/location') },
    { divider: true },
    { icon: Trash2, label: 'Clear Cache', action: () => console.log('Cache clicked') },
    { icon: Clock, label: 'Clear History', action: () => console.log('History clicked') },
    { icon: LogOut, label: 'Log Out', action: () => navigate('/login') },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc', 
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        background: '#10b981', // Emerald 500 (Teal-ish green)
        padding: '1rem',
        paddingTop: '2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: '1.5rem',
        borderBottomRightRadius: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <ChevronLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <span style={{ fontWeight: '600', fontSize: '1.1rem', letterSpacing: '1px' }}>MY PROFILE</span>
        <Settings size={24} style={{ cursor: 'pointer' }} />
      </div>

      {/* Profile Info */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        marginTop: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: '#cbd5e1', // Gray placeholder
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
             {/* Avatar Placeholder */}
             <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }}></div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            background: '#64748b',
            borderRadius: '50%',
            padding: '6px',
            border: '3px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Camera size={14} color="white" />
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>Vanz Ray</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Vazrey@gmail.com</p>
        
        <button style={{
          background: '#3b82f6', // Blue
          color: 'white',
          padding: '0.5rem 1.5rem',
          borderRadius: '2rem',
          fontSize: '0.85rem',
          fontWeight: '500',
          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
        }}>
          Edit Profile
        </button>
      </div>

      {/* Menu List */}
      <div style={{ padding: '0 1.5rem' }}>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.divider ? (
              <div style={{ 
                height: '1px', 
                background: '#e2e8f0', 
                margin: '1rem 0' 
              }}></div>
            ) : (
              <div 
                onClick={item.action}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <item.icon size={22} color="#1e293b" strokeWidth={1.5} />
                  <span style={{ 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    color: '#334155' 
                  }}>
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={20} color="#94a3b8" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default Profile;
