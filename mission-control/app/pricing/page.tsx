'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

const plans = [
  {
    name: 'Starter',
    price: 9,
    period: 'month',
    description: 'For individuals and small projects',
    features: [
      '100 tasks/month',
      '2 AI Agents',
      'Basic Analytics',
      'Email Support',
      '5 Projects'
    ],
    popular: false,
    color: '#8b949e'
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For growing teams',
    features: [
      'Unlimited tasks',
      '5 AI Agents',
      'Advanced Analytics',
      'Priority Support',
      'API Access',
      '20 Projects',
      'Custom Workflows'
    ],
    popular: true,
    color: '#2f81f7'
  },
  {
    name: 'Enterprise',
    price: null,
    period: 'custom',
    description: 'For large organizations',
    features: [
      'Unlimited AI Agents',
      'Unlimited Tasks',
      'Dedicated Support',
      'Custom Integrations',
      'SLA Guarantee',
      'On-premise Option',
      'Unlimited Everything'
    ],
    popular: false,
    color: '#a371f7'
  }
];

export default function PricingPage() {
  return (
    <div style={{minHeight:'100vh',background:'#030712',color:'#f0f6fc',fontFamily:'Inter,sans-serif',paddingBottom:'80px'}}>
      {/* Header */}
      <div style={{display:'flex',position:'fixed',top:0,left:0,right:0,height:60,background:'#0f1117',borderBottom:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-between',zIndex:1000}}>
        <Link href="/"><span style={{fontSize:24}}>🎯</span></Link>
        <span style={{fontWeight:700,fontSize:18}}>Pricing</span>
        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#2f81f7,#a371f7)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600,fontSize:12}}>D</div>
      </div>

      <div style={{padding:'80px 16px 24px',maxWidth:'900px',margin:'0 auto'}}>
        <h1 style={{fontSize:36,fontWeight:700,marginBottom:8,textAlign:'center'}}>Simple, Transparent Pricing 💰</h1>
        <p style={{color:'#8b949e',fontSize:16,marginBottom:40,textAlign:'center'}}>Choose the plan that fits your needs. No hidden fees.</p>

        {/* Pricing Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
          {plans.map(plan => (
            <div key={plan.name} style={{
              background: plan.popular ? 'linear-gradient(135deg,#0f1117,rgba(47,129,247,0.1))' : '#0f1117',
              border: `2px solid ${plan.popular ? plan.color : '#21262d'}`,
              borderRadius:16,
              padding:24,
              position:'relative'
            }}>
              {plan.popular && (
                <div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:plan.color,color:'#fff',padding:'4px 12px',borderRadius:12,fontSize:12,fontWeight:600}}>
                  MOST POPULAR
                </div>
              )}
              <h2 style={{fontSize:24,fontWeight:700,marginBottom:4}}>{plan.name}</h2>
              <p style={{color:'#8b949e',fontSize:14,marginBottom:16}}>{plan.description}</p>
              
              <div style={{marginBottom:24}}>
                {plan.price ? (
                  <>
                    <span style={{fontSize:48,fontWeight:700}}>${plan.price}</span>
                    <span style={{color:'#8b949e',fontSize:14}}>/{plan.period}</span>
                  </>
                ) : (
                  <span style={{fontSize:32,fontWeight:700}}>Custom</span>
                )}
              </div>

              <ul style={{listStyle:'none',padding:0,margin:'0 0 24px 0'}}>
                {plan.features.map((feat, i) => (
                  <li key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',fontSize:14}}>
                    <span style={{color:plan.color}}>✓</span> {feat}
                  </li>
                ))}
              </ul>

              <button style={{
                width:'100%',
                padding:14,
                background: plan.popular ? plan.color : '#21262d',
                color:'#fff',
                border:'none',
                borderRadius:8,
                fontWeight:600,
                fontSize:14,
                cursor:'pointer'
              }}>
                {plan.price ? `Get Started` : 'Contact Sales'}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{marginTop:60}}>
          <h2 style={{fontSize:24,fontWeight:700,marginBottom:24}}>Frequently Asked Questions</h2>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{background:'#0f1117',borderRadius:12,padding:20}}>
              <h3 style={{fontSize:16,fontWeight:600,marginBottom:8}}>Can I change plans anytime?</h3>
              <p style={{color:'#8b949e',fontSize:14}}>Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div style={{background:'#0f1117',borderRadius:12,padding:20}}>
              <h3 style={{fontSize:16,fontWeight:600,marginBottom:8}}>What payment methods do you accept?</h3>
              <p style={{color:'#8b949e',fontSize:14}}>We accept all major credit cards, debit cards, and bank transfers for Enterprise plans.</p>
            </div>
            <div style={{background:'#0f1117',borderRadius:12,padding:20}}>
              <h3 style={{fontSize:16,fontWeight:600,marginBottom:8}}>Is there a free trial?</h3>
              <p style={{color:'#8b949e',fontSize:14}}>Yes! Starter plans come with a 7-day free trial. No credit card required.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div style={{display:'flex',position:'fixed',bottom:0,left:0,right:0,height:65,background:'#0f1117',borderTop:'1px solid #21262d',padding:'0 16px',alignItems:'center',justifyContent:'space-around',zIndex:1000}}>
        <Link href="/" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>🏠</span><span style={{fontSize:10}}>Home</span></Link>
        <Link href="/tasks" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>📋</span><span style={{fontSize:10}}>Tasks</span></Link>
        <Link href="/agents" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>🤖</span><span style={{fontSize:10}}>Agents</span></Link>
        <Link href="/settings" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,color:'#8b949e',textDecoration:'none',fontSize:12}}><span style={{fontSize:20}}>⚙️</span><span style={{fontSize:10}}>More</span></Link>
      </div>
    </div>
  );
}
