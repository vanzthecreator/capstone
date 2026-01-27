import React from 'react';
import Header from '../components/Header';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Medic() {
  const navigate = useNavigate();
  const categories = [
    {
      id: 1,
      title: 'CONTROL BLEEDING',
      image: 'https://placehold.co/150x150/e9d5ff/7e22ce?text=Bleeding', // Purple-ish
      color: '#e9d5ff',
      slug: 'control-bleeding'
    },
    {
      id: 2,
      title: 'CPR (Heart Beating Stop)',
      image: 'https://placehold.co/150x150/dcfce7/15803d?text=CPR', // Green
      color: '#dcfce7',
      slug: 'cpr'
    },
    {
      id: 3,
      title: 'SEIZURES',
      image: 'https://placehold.co/150x150/bae6fd/0369a1?text=Seizures', // Blue
      color: '#bae6fd',
      slug: 'seizures'
    },
    {
      id: 4,
      title: 'INSECT BITE',
      image: 'https://placehold.co/150x150/fecdd3/be123c?text=Insect+Bite', // Pink
      color: '#fecdd3',
      slug: 'insect-bite'
    },
    {
      id: 5,
      title: 'DOG BITE',
      image: 'https://placehold.co/150x150/ffedd5/c2410c?text=Dog+Bite', // Orange
      color: '#ffedd5',
      slug: 'dog-bite'
    },
    {
      id: 6,
      title: 'CHOKING',
      image: 'https://placehold.co/150x150/fef9c3/a16207?text=Choking', // Yellow
      color: '#fef9c3',
      slug: 'choking'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #93c5fd 0%, #1e293b 100%)', // Blue to Dark gradient as per screenshot
      paddingBottom: '100px',
      position: 'relative'
    }}>
      <Header theme="light" enableLocationNav />

      {/* Hero / Intro */}
      <div style={{ padding: '2rem 1rem 1rem 1rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>First Aid</h1>
        <p style={{ fontSize: '1rem', opacity: 0.9, maxWidth: '300px', margin: '0 auto' }}>
          Use the following guides to help someone in case of an emergency!
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '0 1.5rem 2rem 1.5rem' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.2)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '0.75rem', 
          padding: '0.75rem 1rem',
          display: 'flex', 
          alignItems: 'center',
          gap: '0.75rem',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <input 
            type="text" 
            placeholder="Search a symptom / procedure..." 
            style={{ 
              background: 'transparent',
              border: 'none', 
              outline: 'none', 
              flex: 1, 
              fontSize: '0.9rem',
              color: 'white',
              placeholderColor: 'rgba(255,255,255,0.7)'
            }} 
          />
          <div style={{ 
            background: '#ef4444', 
            padding: '6px', 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Search size={16} color="white" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ 
        padding: '0 1.5rem', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem' 
      }}>
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            onClick={() => navigate(`/medic/${cat.slug}`)}
            style={{
            background: cat.color,
            borderRadius: '1.5rem',
            padding: '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            height: '180px', // Fixed height for consistency
            justifyContent: 'space-between'
          }}>
            {/* Image Placeholder */}
            <div style={{
              width: '100%',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <img 
                src={cat.image} 
                alt={cat.title} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  mixBlendMode: 'multiply' // Helps blend the placeholder white background a bit
                }} 
              />
            </div>

            <span style={{ 
              fontWeight: '800', 
              fontSize: '0.9rem', 
              color: '#1e293b',
              textTransform: 'uppercase',
              lineHeight: '1.2'
            }}>
              {cat.title}
            </span>
          </div>
        ))}
      </div>
      
      {/* Background Illustration Effect (Overlay) */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("https://placehold.co/400x600/png?text=Bg+Illustration")', // Placeholder for the medical team illustration
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.05,
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
    </div>
  );
}

export default Medic;
