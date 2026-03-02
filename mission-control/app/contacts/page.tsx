'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const CONTACTS = [
  { id: '1', name: 'John Doe', email: 'john@techcorp.com', company: 'TechCorp', role: 'CTO' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@startup.io', company: 'StartupXYZ', role: 'CEO' },
  { id: '3', name: 'Mike Chen', email: 'mike@enterprise.co', company: 'Enterprise Inc', role: 'VP Engineering' },
  { id: '4', name: 'Emily Davis', email: 'emily@growth.com', company: 'Growth Labs', role: 'Product Lead' },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState(CONTACTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contacts')
      .then(res => res.json())
      .then(data => {
        if (data.contacts && data.contacts.length > 0) {
          setContacts(data.contacts);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Contacts 📒</h1>
        <p style={{ color: '#8b949e', fontSize: 14 }}>{contacts.length} contacts in your network</p>
      </div>

      {loading ? (
        <p style={{ color: '#8b949e' }}>Loading...</p>
      ) : (
        <div style={{ background: '#0f1117', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
          {contacts.map(contact => (
            <div key={contact.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderBottom: '1px solid #21262d' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16 }}>{contact.name[0]}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{contact.name}</p>
                <p style={{ fontSize: 12, color: '#6e7681', margin: 0 }}>{contact.role} at {contact.company}</p>
                <p style={{ fontSize: 11, color: '#484f58', marginTop: 2 }}>{contact.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button style={{ marginTop: 20, padding: '14px 28px', background: '#2f81f7', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        + Add Contact
      </button>
    </div>
  );
}
