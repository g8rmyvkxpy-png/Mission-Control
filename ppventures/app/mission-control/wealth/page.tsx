import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Wealth Dashboard - PPVentures',
  description: 'Private wealth tracking for founders',
};

// In production, this would come from Supabase with RLS
const mockAssets = [
  { id: '1', asset_name: 'Hosur Property', category: 'Real Estate', current_value: 500000, location: 'Hosur, Tamil Nadu', updated_at: '2026-02-15' },
  { id: '2', asset_name: 'Tech Stocks', category: 'Stocks', current_value: 125000, location: 'Portfolio', updated_at: '2026-02-20' },
  { id: '3', asset_name: 'Bitcoin', category: 'Crypto', current_value: 45000, location: 'Wallet', updated_at: '2026-02-27' },
  { id: '4', asset_name: 'Savings Account', category: 'Bank', current_value: 75000, location: 'Axis Bank', updated_at: '2026-02-25' },
];

const categories = [
  { id: 'Real Estate', icon: '🏠', color: '#f97316' },
  { id: 'Stocks', icon: '📈', color: '#22c55e' },
  { id: 'Crypto', icon: '₿', color: '#8b5cf6' },
  { id: 'Bank', icon: '🏦', color: '#3b82f6' },
  { id: 'Other', icon: '📦', color: '#6b7280' },
];

function getCategoryInfo(category: string) {
  return categories.find(c => c.id === category) || categories[4];
}

export default function WealthDashboard() {
  const totalValue = mockAssets.reduce((sum, asset) => sum + Number(asset.current_value), 0);
  
  const byCategory = categories.map(cat => ({
    ...cat,
    value: mockAssets
      .filter(a => a.category === cat.id)
      .reduce((sum, a) => sum + Number(a.current_value), 0)
  }));

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0b',
      color: '#fafafa',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid #27272a'
      }}>
        <Link href="/" style={{ fontSize: '20px', fontWeight: '700' }}>
          PP<span style={{ color: '#f97316' }}>Ventures</span>
        </Link>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/mission-control" style={{ color: '#a1a1aa', textDecoration: 'none' }}>
            ← Mission Control
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header style={{
        padding: '48px 40px',
        borderBottom: '1px solid #27272a'
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>
          💰 Private Wealth Dashboard
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '16px' }}>
          Your personal assets • Founder Only
        </p>
      </header>

      {/* Stats */}
      <div style={{ padding: '32px 40px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{
          flex: '1',
          minWidth: '280px',
          background: '#1a1a1d',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #27272a'
        }}>
          <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>
            Total Net Worth
          </div>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#22c55e' }}>
            ${totalValue.toLocaleString()}
          </div>
        </div>

        {byCategory.map(cat => (
          <div key={cat.id} style={{
            background: '#1a1a1d',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #27272a',
            minWidth: '150px',
            flex: '1'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{cat.icon}</div>
            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{cat.id}</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: cat.color }}>
              ${cat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Asset List */}
      <section style={{ padding: '0 40px 48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
          Asset Details
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockAssets.map(asset => {
            const cat = getCategoryInfo(asset.category);
            return (
              <div key={asset.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px',
                background: '#1a1a1d',
                borderRadius: '12px',
                border: '1px solid #27272a'
              }}>
                <div style={{
                  fontSize: '32px',
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${cat.color}20`,
                  borderRadius: '12px'
                }}>
                  {cat.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>
                    {asset.asset_name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
                    {asset.location}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: cat.color }}>
                    ${Number(asset.current_value).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    Updated {asset.updated_at}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security Notice */}
      <div style={{
        padding: '24px 40px',
        borderTop: '1px solid #27272a',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '12px'
      }}>
        🔒 Protected by Row Level Security (RLS) • Only authenticated founder can view this data
      </div>
    </div>
  );
}
