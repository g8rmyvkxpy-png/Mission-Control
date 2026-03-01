'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AccountPage() {
  const user = {
    name: 'Deva',
    email: 'deva@example.com',
    company: 'PP Ventures',
    role: 'Owner',
    plan: 'Starter',
    memberSince: 'Feb 2026',
  };

  return (
    <div className="page">
      <div className="mobile-header">
        <Link href="/"><span style={{fontSize: 24}}>🎯</span></Link>
        <span style={{fontWeight: 700, fontSize: 18}}>Account</span>
        <div className="avatar">D</div>
      </div>

      <div className="page-content">
        <div className="desktop-show" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #21262d'}}>
          <div>
            <h1>Account 👤</h1>
            <p>Manage your profile and preferences</p>
          </div>
          <Link href="/" style={{color: '#8b949e', textDecoration: 'none'}}>← Back</Link>
        </div>

        {/* Profile Card */}
        <div className="card mb-24">
          <div className="flex gap-16" style={{alignItems: 'center'}}>
            <div className="avatar" style={{width: 64, height: 64, fontSize: 24}}>D</div>
            <div>
              <h2 style={{margin: 0}}>{user.name}</h2>
              <p style={{margin: '4px 0 0'}}>{user.email}</p>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <h2 style={{marginBottom: 16}}>Account Details</h2>
        <div className="card mb-24">
          {[
            { label: 'Full Name', value: user.name, editable: true },
            { label: 'Email', value: user.email, editable: true },
            { label: 'Company', value: user.company, editable: true },
            { label: 'Role', value: user.role, editable: false },
            { label: 'Plan', value: user.plan, editable: false },
            { label: 'Member Since', value: user.memberSince, editable: false },
          ].map((field, i) => (
            <div key={i} className="flex-between" style={{padding: '16px 0', borderBottom: i < 5 ? '1px solid #21262d' : 'none'}}>
              <div>
                <p style={{color: '#8b949e', fontSize: 12, marginBottom: 4}}>{field.label}</p>
                <p style={{fontWeight: 500, margin: 0}}>{field.value}</p>
              </div>
              {field.editable && <span style={{color: '#2f81f7', fontSize: 14}}>Edit</span>}
            </div>
          ))}
        </div>

        {/* Security */}
        <h2 style={{marginBottom: 16}}>Security</h2>
        <div className="card mb-24">
          <div className="flex-between" style={{padding: '16px 0', borderBottom: '1px solid #21262d'}}>
            <div>
              <p style={{fontWeight: 500, margin: 0}}>Password</p>
              <p style={{color: '#8b949e', fontSize: 12, margin: '4px 0 0'}}>Last changed 30 days ago</p>
            </div>
            <span style={{color: '#2f81f7', fontSize: 14}}>Change</span>
          </div>
          <div className="flex-between" style={{padding: '16px 0'}}>
            <div>
              <p style={{fontWeight: 500, margin: 0}}>Two-Factor Authentication</p>
              <p style={{color: '#8b949e', fontSize: 12, margin: '4px 0 0'}}>Add an extra layer of security</p>
            </div>
            <span style={{color: '#8b949e', fontSize: 14}}>Enable</span>
          </div>
        </div>

        {/* Danger Zone */}
        <h2 style={{marginBottom: 16, color: '#f85149'}}>Danger Zone</h2>
        <div className="card" style={{borderColor: '#f85149'}}>
          <div className="flex-between">
            <div>
              <p style={{fontWeight: 500, margin: 0, color: '#f85149'}}>Delete Account</p>
              <p style={{color: '#8b949e', fontSize: 12, margin: '4px 0 0'}}>Permanently delete your account and all data</p>
            </div>
            <span style={{color: '#f85149', fontSize: 14}}>Delete</span>
          </div>
        </div>
      </div>

      <div className="mobile-nav">
        <Link href="/" className="nav-link"><span style={{fontSize: 20}}>🏠</span><span style={{fontSize: 10}}>Home</span></Link>
        <Link href="/tasks" className="nav-link"><span style={{fontSize: 20}}>📋</span><span style={{fontSize: 10}}>Tasks</span></Link>
        <Link href="/agents" className="nav-link"><span style={{fontSize: 20}}>🤖</span><span style={{fontSize: 10}}>Agents</span></Link>
        <Link href="/settings" className="nav-link"><span style={{fontSize: 20}}>⚙️</span><span style={{fontSize: 10}}>Settings</span></Link>
      </div>
    </div>
  );
}
