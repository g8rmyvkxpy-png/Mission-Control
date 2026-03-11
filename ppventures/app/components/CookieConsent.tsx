'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setAccepted(false);
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setAccepted(true);
    setShow(false);
  };

  if (!show || accepted) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#1a1a1d',
      borderTop: '1px solid #27272a',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px',
      zIndex: 9999,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{ maxWidth: '600px' }}>
        <p style={{ color: '#d4d4d8', fontSize: '14px', margin: 0 }}>
          We use cookies to improve your experience. By continuing to visit this site you agree to our use of cookies.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={accept}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Accept
        </button>
        <button 
          onClick={() => setShow(false)}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            color: '#a1a1aa',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
