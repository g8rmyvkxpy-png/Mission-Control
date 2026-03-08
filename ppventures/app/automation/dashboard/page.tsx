'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
  business_name: string;
  plan: string;
  status: string;
  lead_finder_config?: {
    industry: string;
    location: string;
  };
}

interface Lead {
  id: string;
  company_name: string;
  website: string;
  industry: string;
  location: string;
  why_good_fit: string;
  contact_title: string;
  status: string;
  found_at: string;
}

interface Agent {
  id: string;
  agent_type: string;
  status: string;
  runs_today: number;
  total_leads_found: number;
  total_appointments: number;
  total_followups: number;
}

export default function DashboardPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [findingLeads, setFindingLeads] = useState(false);
  const [leadMessage, setLeadMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [custRes, agentsRes, leadsRes] = await Promise.all([
        fetch('/api/automation/customer'),
        fetch('/api/automation/agents'),
        fetch('/api/automation/leads')
      ]);
      
      const custData = await custRes.json();
      const agentsData = await agentsRes.json();
      const leadsData = await leadsRes.json();
      
      if (custData.customer) {
        setCustomer(custData.customer);
        if (custData.customer.lead_finder_config) {
          setIndustry(custData.customer.lead_finder_config.industry || '');
          setLocation(custData.customer.lead_finder_config.location || '');
        }
      }
      if (agentsData.agents) setAgents(agentsData.agents);
      if (leadsData.leads) setLeads(leadsData.leads);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function findLeads() {
    if (!industry || !location) {
      setLeadMessage('Please enter both industry and location');
      return;
    }
    
    setFindingLeads(true);
    setLeadMessage('🔍 Searching the web for leads...');
    
    try {
      const res = await fetch('/api/automation/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customer_id: customer?.id || 'demo',
          industry, 
          location 
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setLeadMessage(`✅ Found ${data.leads_found} leads!`);
        fetchData();
      } else {
        setLeadMessage(`❌ Error: ${data.error}`);
      }
    } catch (e: any) {
      setLeadMessage(`❌ Error: ${e.message}`);
    }
    
    setFindingLeads(false);
  }

  async function updateLeadStatus(leadId: string, status: string) {
    try {
      await fetch('/api/automation/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, status })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  }

  function getAgentIcon(type: string) {
    switch(type) {
      case 'lead_finder': return '🔍';
      case 'appointment_scheduler': return '📅';
      case 'follow_up': return '💬';
      default: return '🤖';
    }
  }

  function getAgentName(type: string) {
    switch(type) {
      case 'lead_finder': return 'AI Lead Finder';
      case 'appointment_scheduler': return 'AI Appointment Scheduler';
      case 'follow_up': return 'AI Follow-up Agent';
      default: return type;
    }
  }

  function getStatusColor(status: string) {
    switch(status) {
      case 'new': return 'bg-blue-900 text-blue-300';
      case 'contacted': return 'bg-yellow-900 text-yellow-300';
      case 'replied': return 'bg-green-900 text-green-300';
      case 'booked': return 'bg-purple-900 text-purple-300';
      case 'closed': return 'bg-green-600 text-white';
      default: return 'bg-gray-700 text-gray-300';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Please sign up first</p>
          <Link href="/automation" className="text-orange-400 hover:underline">Go to signup</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/automation" className="text-2xl font-bold text-white">PPVentures</Link>
            <span className="ml-2 text-orange-400">Automation Suite</span>
          </div>
          <div className="text-right">
            <p className="text-white font-medium">{customer.name}</p>
            <p className="text-gray-400 text-sm">{customer.business_name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {customer.name}!
          </h1>
          <p className="text-gray-400">
            Your 24/7 virtual operations team is ready to work.
          </p>
        </div>

        {/* 🔍 Lead Finder Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🔍</span>
            <div>
              <h2 className="text-xl font-bold text-white">AI Lead Finder</h2>
              <p className="text-gray-400 text-sm">Find 10 qualified prospects every morning</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Target Industry</label>
              <input 
                type="text" 
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. marketing agency, accounting firm"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Location</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. London UK, New York"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={findLeads}
                disabled={findingLeads}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg"
              >
                {findingLeads ? '🔍 Searching...' : 'Find Leads Now'}
              </button>
            </div>
          </div>
          
          {leadMessage && (
            <p className={`text-sm mb-4 ${leadMessage.includes('✅') ? 'text-green-400' : leadMessage.includes('❌') ? 'text-red-400' : 'text-yellow-400'}`}>
              {leadMessage}
            </p>
          )}
          
          <p className="text-gray-500 text-xs">
            🕐 Runs daily at 7AM automatically for active customers
          </p>
        </div>

        {/* Leads Found */}
        {leads.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Your Leads ({leads.length} found)
            </h2>
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold">{lead.company_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-1">
                        📧 {lead.why_good_fit}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                          {lead.website}
                        </a>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">{lead.contact_title}</span>
                      </div>
                    </div>
                    <select 
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                      className="bg-gray-700 text-white text-sm px-3 py-2 rounded border border-gray-600"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="replied">Replied</option>
                      <option value="booked">Booked</option>
                      <option value="closed">Closed</option>
                      <option value="not_interested">Not Interested</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Agents Grid */}
        <h2 className="text-xl font-bold text-white mb-4">Your AI Agents</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {agents.filter(a => a.agent_type !== 'lead_finder').map((agent) => (
            <div key={agent.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getAgentIcon(agent.agent_type)}</span>
                  <div>
                    <h3 className="text-white font-bold">{getAgentName(agent.agent_type)}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${agent.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                      {agent.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-2xl font-bold text-orange-400">{agent.runs_today}</p>
                  <p className="text-xs text-gray-400">Today</p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-2xl font-bold text-green-400">{agent.total_appointments + agent.total_followups}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <p className="text-2xl font-bold text-blue-400">{agent.status === 'active' ? 'ON' : 'OFF'}</p>
                  <p className="text-xs text-gray-400">Status</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade Section */}
        {customer.plan === 'trial' && (
          <div className="mt-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
            <p className="text-white/80 mb-4">Get unlimited leads, appointments, and follow-ups</p>
            <a href="mailto:hello@ppventures.tech?subject=Upgrade to $297 Plan" 
               className="inline-block bg-white text-orange-600 font-bold py-3 px-8 rounded-lg">
              Upgrade — $297/month
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
