import React, { useEffect, useState } from 'react';
import { ChevronLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Location() {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(() => ('geolocation' in navigator ? '' : 'Geolocation not available'));

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setError('Unable to fetch location');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  const src = coords
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=Toledo%20City%2C%20Cebu%2C%20Philippines&z=12&output=embed`;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a', 
      color: 'white',
      paddingBottom: '100px'
    }}>
      <div style={{
        background: 'white',
        color: '#0f172a',
        padding: '1rem',
        paddingTop: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottomLeftRadius: '1.5rem',
        borderBottomRightRadius: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
      }}>
        <ChevronLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <span style={{ fontWeight: '600' }}>Location Map</span>
      </div>

      <div style={{ padding: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '0.5rem',
          color: '#cbd5e1',
          marginBottom: '0.75rem'
        }}>
          <MapPin size={18} />
          <span>{coords ? `lat ${coords.lat.toFixed(4)}, lng ${coords.lng.toFixed(4)}` : 'Using city fallback'}</span>
        </div>
        {error && (
          <div style={{ 
            background: '#1f2937', 
            color: '#fca5a5', 
            borderRadius: '0.5rem',
            padding: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            {error}
          </div>
        )}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 10px 15px rgba(0,0,0,0.25)'
        }}>
          <iframe
            title="map"
            src={src}
            width="100%"
            height="520"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

export default Location;
