import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

function FirstAidDetail() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const details = {
    'control-bleeding': {
      title: 'CONTROL BLEEDING',
      image: '/images/control-bleeding.png'
    },
    'cpr': {
      title: 'CPR (Heart Beating Stop)',
      image: '/images/cpr.png'
    },
    'seizures': {
      title: 'SEIZURES',
      image: '/images/seizures.png'
    },
    'dog-bite': {
      title: 'DOG BITE',
      image: '/images/dog-bite.png'
    },
    'insect-bite': {
      title: 'INSECT BITE',
      image: '/images/insect-bite.png'
    },
    'choking': {
      title: 'CHOKING',
      image: '/images/choking.png'
    }
  };

  const info = details[slug] || {
    title: 'FIRST AID',
    image: 'https://placehold.co/320x520/f3f4f6/374151?text=First+Aid'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fb7185 0%, #fecaca 100%)',
      padding: '1.25rem',
      paddingBottom: '100px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#1f2937',
        marginBottom: '1rem'
      }}>
        <ChevronLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>{info.title}</span>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.75rem'
      }}>
        <img
          src={info.image}
          alt={info.title}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '0.75rem',
            objectFit: 'contain'
          }}
        />
      </div>
    </div>
  );
}

export default FirstAidDetail;
