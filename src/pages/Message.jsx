import React from 'react';
import Header from '../components/Header';
import { Plus } from 'lucide-react';

function Message() {
  const contacts = [
    {
      id: 1,
      name: 'FIRE STATION TOLEDO CITY',
      image: 'https://placehold.co/100x100/b91c1c/ffffff?text=Fire', // Red for Fire
      status: 'online'
    },
    {
      id: 2,
      name: 'HOSPITAL TOLEDO',
      image: 'https://placehold.co/100x100/16a34a/ffffff?text=Hosp', // Green for Hospital
      status: 'online'
    },
    {
      id: 3,
      name: 'PNP TOLEDO',
      image: 'https://placehold.co/100x100/1d4ed8/ffffff?text=PNP', // Blue for Police
      status: 'online'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'black', // Dark background as per screenshot
      color: 'white',
      paddingBottom: '100px'
    }}>
      <Header theme="light" enableLocationNav /> {/* Note: Screenshot shows light header even on dark bg, but can adjust if needed */}

      {/* Stories / Active Status Row */}
      <div style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        padding: '2rem 1rem', 
        overflowX: 'auto',
        scrollbarWidth: 'none' // Hide scrollbar
      }}>
        {/* 'Add' Bubble */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: '#334155', // Dark slate
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative'
          }}>
            <Plus size={24} color="#94a3b8" />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '16px',
              height: '16px',
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
               <Plus size={10} color="black" strokeWidth={4} />
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Your Story</span>
        </div>

        {/* Contact Bubbles */}
        {contacts.map((contact) => (
          <div key={contact.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={contact.image} 
                alt={contact.name} 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  border: '2px solid black',
                  objectFit: 'cover'
                }} 
              />
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '12px',
                height: '12px',
                background: '#22c55e', // Online green
                borderRadius: '50%',
                border: '2px solid black'
              }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat List */}
      <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {contacts.map((contact) => (
          <div key={contact.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={contact.image} 
                alt={contact.name} 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  objectFit: 'cover'
                }} 
              />
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '12px',
                height: '12px',
                background: '#22c55e', // Online green
                borderRadius: '50%',
                border: '2px solid black'
              }}></div>
            </div>
            
            <span style={{ 
              fontWeight: '600', 
              fontSize: '0.9rem',
              color: 'white',
              textTransform: 'uppercase'
            }}>
              {contact.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Message;
