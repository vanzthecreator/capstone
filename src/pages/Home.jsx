import React from 'react';
import Header from '../components/Header';
import { Video, Image, FileText } from 'lucide-react';

function Home() {
  const posts = [
    {
      id: 1,
      user: 'James Doe',
      role: 'Just now',
      avatar: 'https://i.pravatar.cc/150?u=james',
      content: 'Attention mga Wifi business owner atimana intawon na inyong mga linya sa wifi nga nagwakat sa karsada kay naka cause mo og motor accident...',
      images: [
        'https://placehold.co/600x400/png?text=Accident+Scene+1',
        'https://placehold.co/600x400/png?text=Accident+Scene+2'
      ],
      location: 'San Pedro, Malapoc'
    },
    {
      id: 2,
      user: 'News Alert',
      role: '1hr ago',
      avatar: 'https://i.pravatar.cc/150?u=news',
      content: 'Twelve were in intensive care after the accident near Ademuz in the province of Cordoba, about 360 km (223 miles) south of Madrid...',
      images: [
        'https://placehold.co/600x300/png?text=Train+Accident'
      ],
      location: 'Cordoba'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f1f5f9', // Light gray bg
      paddingBottom: '100px' 
    }}>
      <Header theme="light" enableLocationNav />

      {/* Input Bar */}
      <div style={{ padding: '1rem' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '3rem', 
          padding: '0.75rem 1rem',
          display: 'flex', 
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: '#e2e8f0' 
          }}></div>
          <input 
            type="text" 
            placeholder="Accident Report?" 
            style={{ 
              border: 'none', 
              outline: 'none', 
              flex: 1, 
              fontSize: '0.9rem' 
            }} 
          />
          <div style={{ display: 'flex', gap: '0.5rem', color: '#3b82f6' }}>
            <Video size={20} />
            <Image size={20} />
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ padding: '0 1rem' }}>
        {posts.map(post => (
          <div key={post.id} style={{ 
            background: 'white', 
            borderRadius: '1rem', 
            padding: '1rem',
            marginBottom: '1rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <img 
                src={post.avatar} 
                alt="Avatar" 
                style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
              />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{post.user}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{post.role}</div>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
              {post.content}
            </p>

            {post.images.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: post.images.length > 1 ? '1fr 1fr' : '1fr', 
                gap: '0.5rem',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}>
                {post.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="Post attachment" 
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
