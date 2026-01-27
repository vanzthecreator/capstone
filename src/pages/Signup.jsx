import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Lock, CalendarDays, User2 } from 'lucide-react';

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form1, setForm1] = useState({
    email: '',
    firstName: '',
    lastName: '',
    username: '',
    gender: '',
    birthday: ''
  });
  const [form2, setForm2] = useState({
    username: '',
    password: '',
    confirm: ''
  });

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
    setForm2((prev) => ({ ...prev, username: form1.username }));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!form2.password || form2.password !== form2.confirm) return;
    navigate('/login');
  };

  const inputBase = {
    width: '100%',
    background: '#7dd3fc',
    border: 'none',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    color: '#0f172a',
    fontWeight: 600
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(180deg, #cbd5e1 0%, #64748b 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '1.25rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          padding: '1.5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 700 }}>SIGN UP</div>
          {step === 1 ? (
            <form onSubmit={handleNext}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="Email"
                  value={form1.email}
                  onChange={(e) => setForm1({ ...form1, email: e.target.value })}
                  style={inputBase}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <User size={18} />
                <input
                  type="text"
                  placeholder="Firstname"
                  value={form1.firstName}
                  onChange={(e) => setForm1({ ...form1, firstName: e.target.value })}
                  style={inputBase}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <User size={18} />
                <input
                  type="text"
                  placeholder="Lastname"
                  value={form1.lastName}
                  onChange={(e) => setForm1({ ...form1, lastName: e.target.value })}
                  style={inputBase}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <User2 size={18} />
                <input
                  type="text"
                  placeholder="Username"
                  value={form1.username}
                  onChange={(e) => setForm1({ ...form1, username: e.target.value })}
                  style={inputBase}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <User size={18} />
                <input
                  type="text"
                  placeholder="Gender"
                  value={form1.gender}
                  onChange={(e) => setForm1({ ...form1, gender: e.target.value })}
                  style={inputBase}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CalendarDays size={18} />
                <input
                  type="date"
                  placeholder="Birthday"
                  value={form1.birthday}
                  onChange={(e) => setForm1({ ...form1, birthday: e.target.value })}
                  style={inputBase}
                />
              </div>
              <button type="submit" style={{
                width: '100%',
                background: '#a7f3d0',
                color: '#0f172a',
                fontWeight: 700,
                border: '2px solid #6366f1',
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem'
              }}>
                DONE
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Mail size={18} />
                <input
                  type="text"
                  placeholder="USERNAME"
                  value={form2.username}
                  onChange={(e) => setForm2({ ...form2, username: e.target.value })}
                  style={inputBase}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  value={form2.password}
                  onChange={(e) => setForm2({ ...form2, password: e.target.value })}
                  style={inputBase}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={form2.confirm}
                  onChange={(e) => setForm2({ ...form2, confirm: e.target.value })}
                  style={inputBase}
                  required
                />
              </div>
              <button type="submit" style={{
                width: '100%',
                background: '#67e8f9',
                color: '#0f172a',
                fontWeight: 700,
                border: '2px solid #6366f1',
                borderRadius: '0.75rem',
                padding: '0.85rem 1rem'
              }}>
                Sign up
              </button>
            </form>
          )}
          <div style={{ marginTop: '1rem', textAlign: 'center', color: '#0f172a' }}>
            have a account already? Log in now
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
