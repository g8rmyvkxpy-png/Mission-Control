'use client';

import { useState, useEffect } from 'react';

interface BillingInfo {
  plan: string;
  planName: string;
  price: number;
  usage: {
    agents: number;
    agentLimit: number;
    tasks: number;
    taskLimit: number;
    workflows: number;
    workflowLimit: number;
  };
}

export default function BillingPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const org = urlParams.get('org_id') || localStorage.getItem('mc_org_id');
    if (org) {
      setOrgId(org);
      fetchBilling(org);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBilling = async (orgId: string) => {
    try {
      const res = await fetch(`/api/billing?org_id=${orgId}`);
      const data = await res.json();
      setBilling(data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (plan: string) => {
    if (!orgId) return;
    try {
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId, plan })
      });
      fetchBilling(orgId);
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  if (!orgId) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No Organization Selected</div>;
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  const plans = [
    { id: 'starter', name: 'Starter', price: '$49/mo', agents: '5', tasks: '1,000', features: ['5 Agents', '1K Tasks', 'Basic Support'] },
    { id: 'growth', name: 'Growth', price: '$149/mo', agents: '20', tasks: '10K', features: ['20 Agents', '10K Tasks', 'Priority Support', 'API Access'] },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', agents: 'Unlimited', tasks: 'Unlimited', features: ['Unlimited', 'Dedicated Support', 'Custom Integrations', 'SLA'] }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>💳 Billing</h1>

      {/* Current Usage */}
      {billing && (
        <div style={{ background: '#1a1a1d', padding: '24px', borderRadius: '12px', border: '1px solid #27272a', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Current Plan: {billing.planName}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f97316' }}>{billing.usage.agents}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Agents ({billing.usage.agentLimit === -1 ? '∞' : billing.usage.agentLimit} limit)</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>{billing.usage.tasks}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Tasks ({billing.usage.taskLimit === -1 ? '∞' : billing.usage.taskLimit} limit)</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>{billing.usage.workflows}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Workflows ({billing.usage.workflowLimit === -1 ? '∞' : billing.usage.workflowLimit} limit)</div>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Choose a Plan</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {plans.map(plan => (
          <div key={plan.id} style={{ background: billing?.plan === plan.id ? '#f9731620' : '#1a1a1d', padding: '24px', borderRadius: '12px', border: `1px solid ${billing?.plan === plan.id ? '#f97316' : '#27272a'}` }}>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{plan.name}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#f97316', marginBottom: '16px' }}>{plan.price}</div>
            <div style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '16px' }}>
              {plan.agents} agents • {plan.tasks} tasks/mo
            </div>
            <ul style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', paddingLeft: '16px' }}>
              {plan.features.map(f => <li key={f} style={{ marginBottom: '4px' }}>{f}</li>)}
            </ul>
            {billing?.plan === plan.id ? (
              <div style={{ padding: '12px', background: '#22c55e20', borderRadius: '8px', textAlign: 'center', color: '#22c55e', fontWeight: '600' }}>Current Plan</div>
            ) : (
              <button onClick={() => updatePlan(plan.id)} style={{ width: '100%', padding: '12px', background: '#f97316', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                {plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
