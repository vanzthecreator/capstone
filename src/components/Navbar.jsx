import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{ 
      background: 'white', 
      borderBottom: '1px solid var(--border-color)', 
      padding: '1rem 0' 
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Link to="/" style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: 'var(--primary-color)' 
        }}>
          LIFE Signal
        </Link>
        <div>
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
