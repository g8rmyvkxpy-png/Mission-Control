'use client';
import { useState, useEffect } from 'react';
import { supabase, formatINR, logActivity, statusColors, timeAgo } from './lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StatusBadge({ status, type }) {
  const colors = statusColors[type]?.[status] || 'bg-gray-700';
  return <span className={`px-2 py-0.5 rounded text-xs ${colors}`}>{status?.replace('_', ' ')}</span>;
}

function Modal({ isOpen, onClose, title, children, onSave, saving }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-white text-lg mb-4">{title}</h3>
        {children}
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg disabled:opacity-50 transition-all">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg z-50 ${type === 'success' ? 'bg-green-700' : 'bg-red-700'} text-white`}>{message}</div>;
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-700 text-white rounded">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Nerve() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [activity, setActivity] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: () => {} });
  const [productModal, setProductModal] = useState({ open: false, data: null });
  const [taskModal, setTaskModal] = useState({ open: false, data: null });
  const [clientModal, setClientModal] = useState({ open: false, data: null });
  const [revenueModal, setRevenueModal] = useState({ open: false, data: null });
  const [agents, setAgents] = useState([]);
  const [subAgents, setSubAgents] = useState([]);
  const [agentActivity, setAgentActivity] = useState([]);
  const [agentModal, setAgentModal] = useState({ open: false, data: null });
  const [subAgentModal, setSubAgentModal] = useState({ open: false, data: null, agentId: null });
  const [settingsModal, setSettingsModal] = useState({ open: false });
  const [outputModal, setOutputModal] = useState({ open: false, title: '', output: '', agent: '', time: '' });
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(null);
  const [agentForm, setAgentForm] = useState({ name: '', role: 'developer', description: '', avatar: '🤖', model: 'MiniMax-M2.5', assigned_product_id: '' });
  const [subAgentForm, setSubAgentForm] = useState({ name: '', specialty: 'frontend', description: '', avatar: '🔧', assigned_task_id: '' });
  const [productForm, setProductForm] = useState({ name: '', description: '', status: 'idea', stage: 'mvp', revenue_model: 'subscription', monthly_price: '' });
  const [taskForm, setTaskForm] = useState({ title: '', status: 'todo', priority: 'medium', due_date: '', notes: '' });
  const [clientForm, setClientForm] = useState({ name: '', email: '', phone: '', status: 'lead', product_id: '', deal_value: '', notes: '' });
  const [revenueForm, setRevenueForm] = useState({ client_id: '', product_id: '', amount: '', type: 'subscription', date: new Date().toISOString().split('T')[0], notes: '' });
  const [miniMaxKey, setMiniMaxKey] = useState('');
  const [defaultModel, setDefaultModel] = useState('MiniMax-M2.5');
  const [autoMode, setAutoMode] = useState(false);
  
  // Load from localStorage after mount (SSR safe)
  useEffect(() => {
    setMiniMaxKey(localStorage.getItem('nerve_minimax_key') || '');
    setDefaultModel(localStorage.getItem('nerve_default_model') || 'MiniMax-M2.5');
  }, []);

  const showToast = (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };
  useEffect(() => { 
    fetchAll(); 
    setTimeout(() => showToast('NERVE loaded — Neo is ready!'), 1000);
    // Auto-create Neo + default sub-agents if not exists
    setTimeout(async () => {
      // Clean up duplicate Neos - keep first
      const { data: allNeos } = await supabase.from('agents').select('id').eq('name', 'Neo').order('created_at');
      if (allNeos && allNeos.length > 1) {
        const idsToDelete = allNeos.slice(1).map(n => n.id);
        await supabase.from('agents').delete().in('id', idsToDelete);
        showToast(`Cleaned up ${idsToDelete.length} duplicate Neos`);
      }
      
      // Get or create Neo
      const { data: existingNeos } = await supabase.from('agents').select('id').eq('name', 'Neo').order('created_at').limit(1);
      let neoId = existingNeos?.[0]?.id;
      
      if (!neoId) {
        const { data: neoData } = await supabase.from('agents').insert([{ name: 'Neo', role: 'operations', description: 'Master Agent — AI Chief of Staff for PPVentures. Coordinates all sub-agents. Reports directly to you.', avatar: '🧠', model: 'MiniMax-M2.5', status: 'idle' }]).select().single();
        neoId = neoData?.id;
        if (neoId) showToast('Neo created!');
      }
      
      if (neoId) {
        // Clean up duplicate sub-agents by name
        const { data: allSubs } = await supabase.from('sub_agents').select('*').order('created_at');
        const seenNames = new Set();
        const subIdsToDelete = [];
        for (const s of allSubs || []) {
          if (seenNames.has(s.name)) subIdsToDelete.push(s.id);
          else seenNames.add(s.name);
        }
        if (subIdsToDelete.length > 0) {
          await supabase.from('sub_agents').delete().in('id', subIdsToDelete);
          showToast(`Cleaned up ${subIdsToDelete.length} duplicate sub-agents`);
        }
        
        // Create missing sub-agents by name
        const { data: currentSubs } = await supabase.from('sub_agents').select('name').eq('agent_id', neoId);
        const existingNames = new Set(currentSubs?.map(s => s.name) || []);
        const toCreate = [];
        if (!existingNames.has('DevBot')) toCreate.push({ agent_id: neoId, name: 'DevBot', specialty: 'frontend', avatar: '🤖', description: 'Handles all development tasks — coding, architecture, debugging', status: 'idle' });
        if (!existingNames.has('SalesBot')) toCreate.push({ agent_id: neoId, name: 'SalesBot', specialty: 'outreach', avatar: '💼', description: 'Manages client outreach, follow-ups, pipeline progression', status: 'idle' });
        if (!existingNames.has('ContentBot')) toCreate.push({ agent_id: neoId, name: 'ContentBot', specialty: 'docs', avatar: '📝', description: 'Creates documentation, marketing content, product descriptions', status: 'idle' });
        if (!existingNames.has('QABot')) toCreate.push({ agent_id: neoId, name: 'QABot', specialty: 'testing', avatar: '🧪', description: 'Reviews completed work, writes test cases, quality assurance', status: 'idle' });
        if (toCreate.length > 0) {
          await supabase.from('sub_agents').insert(toCreate);
          showToast(`${toCreate.length} sub-agents created!`);
        }
      }
      fetchAll();
    }, 2000);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, t, c, r, a, ag, sag, aact] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('revenue').select('*').order('date', { ascending: false }).limit(50),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('agents').select('*').order('created_at', { ascending: false }),
        supabase.from('sub_agents').select('*').order('created_at', { ascending: false }),
        supabase.from('agent_activity').select('*').order('created_at', { ascending: false }).limit(30)
      ]);
      setProducts(p.data || []); setTasks(t.data || []); setClients(c.data || []); setRevenue(r.data || []); setActivity(a.data || []); setAgents(ag.data || []); setSubAgents(sag.data || []); setAgentActivity(aact.data || []);
    } catch (e) { showToast('Failed to load: ' + e.message, 'error'); }
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);
  
  // Auto-run effect
  useEffect(() => {
    if (!autoMode) return;
    const interval = setInterval(() => {
      runNeo();
    }, 60000); // Every 60 seconds
    return () => clearInterval(interval);
  }, [autoMode, tasks, clients, subAgents]);

  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const pipelineValue = clients.filter(c => c.status === 'lead' || c.status === 'prospect').reduce((sum, c) => sum + (parseFloat(c.deal_value) || 0), 0);
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);
  const monthRevenue = revenue.filter(r => r.date?.startsWith(thisMonth)).reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const lastMonthRevenue = revenue.filter(r => r.date?.startsWith(lastMonth)).reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const revenueChange = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(0) : 0;
  const activeClients = clients.filter(c => c.status === 'active_client').length;
  const leads = clients.filter(c => c.status === 'lead');
  const prospects = clients.filter(c => c.status === 'prospect');
  const active = clients.filter(c => c.status === 'active_client');
  const churned = clients.filter(c => c.status === 'churned');
  const leadValue = leads.reduce((sum, c) => sum + (parseFloat(c.deal_value) || 0), 0);
  const prospectValue = prospects.reduce((sum, c) => sum + (parseFloat(c.deal_value) || 0), 0);
  const activeValue = active.reduce((sum, c) => sum + (parseFloat(c.deal_value) || 0), 0);

  const chartData = (() => {
    const months = {};
    revenue.forEach(r => { if (r.date) { const month = r.date.slice(0, 7); months[month] = (months[month] || 0) + parseFloat(r.amount || 0); } });
    return Object.entries(months).slice(-6).map(([month, amount]) => ({ month: new Date(month + '-01').toLocaleString('en-IN', { month: 'short' }), amount })).reverse();
  })();

  const openProductModal = (p = null) => { if (p) setProductForm({ ...p, monthly_price: p.monthly_price || '' }); else setProductForm({ name: '', description: '', status: 'idea', stage: 'mvp', revenue_model: 'subscription', monthly_price: '' }); setProductModal({ open: true, data: p }); };
  const saveProduct = async () => {
    setSaving(true);
    try {
      const data = { ...productForm, monthly_price: productForm.monthly_price ? parseFloat(productForm.monthly_price) : null };
      if (productModal.data) { await supabase.from('products').update(data).eq('id', productModal.data.id); await logActivity(`Updated product: ${data.name}`, 'product', productModal.data.id); showToast('Product updated'); }
      else { const result = await supabase.from('products').insert([data]).select(); await logActivity(`Added product: ${data.name}`, 'product', result.data[0].id); showToast('Product added'); }
      setProductModal({ open: false, data: null }); fetchAll();
    } catch (e) { showToast(e.message, 'error'); }
    setSaving(false);
  };
  const deleteProduct = (p) => { 
    setConfirmDialog({ 
      open: true, 
      title: 'Delete Product', 
      message: `Delete "${p.name}"?`, 
      onConfirm: async () => { 
        await supabase.from('tasks').delete().eq('product_id', p.id); 
        await supabase.from('products').delete().eq('id', p.id); 
        await logActivity(`Deleted product: ${p.name}`, 'product', p.id); 
        setSelectedProduct(null); 
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} }); 
        showToast('Product deleted'); 
        fetchAll(); 
      } 
    }); 
  };

  const openTaskModal = (t = null) => { if (t) setTaskForm({ ...t, due_date: t.due_date || '' }); else setTaskForm({ title: '', status: 'todo', priority: 'medium', due_date: '', notes: '' }); setTaskModal({ open: true, data: t }); };
  const saveTask = async () => {
    setSaving(true);
    try {
      const data = { ...taskForm, product_id: selectedProduct?.id, due_date: taskForm.due_date || null, completed_at: taskForm.status === 'done' ? new Date().toISOString() : null };
      if (taskModal.data) { await supabase.from('tasks').update(data).eq('id', taskModal.data.id); await logActivity(`Updated task: ${data.title}`, 'task', taskModal.data.id); showToast('Task updated'); }
      else { const result = await supabase.from('tasks').insert([data]).select(); await logActivity(`Added task: ${data.title}`, 'task', result.data[0].id); showToast('Task added'); }
      setTaskModal({ open: false, data: null }); fetchAll();
    } catch (e) { showToast(e.message, 'error'); }
    setSaving(false);
  };
  const updateTaskStatus = async (taskId, status) => { await supabase.from('tasks').update({ status, completed_at: status === 'done' ? new Date().toISOString() : null }).eq('id', taskId); const task = tasks.find(t => t.id === taskId); if (task) await logActivity(`Task "${task.title}" moved to ${status}`, 'task', taskId); showToast('Task status updated'); fetchAll(); };
  const deleteTask = (t) => { 
    setConfirmDialog({ 
      open: true, 
      title: 'Delete Task', 
      message: `Delete "${t.title}"?`, 
      onConfirm: async () => { 
        await supabase.from('tasks').delete().eq('id', t.id); 
        await logActivity(`Deleted task: ${t.title}`, 'task', t.id); 
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} }); 
        showToast('Task deleted'); 
        fetchAll(); 
      } 
    }); 
  };

  const openClientModal = (c = null) => { if (c) setClientForm({ ...c, deal_value: c.deal_value || '' }); else setClientForm({ name: '', email: '', phone: '', status: 'lead', product_id: '', deal_value: '', notes: '' }); setClientModal({ open: true, data: c }); };
  const saveClient = async () => {
    setSaving(true);
    try {
      const data = { ...clientForm, product_id: clientForm.product_id || null, deal_value: clientForm.deal_value ? parseFloat(clientForm.deal_value) : null };
      if (clientModal.data) { await supabase.from('clients').update(data).eq('id', clientModal.data.id); await logActivity(`Updated client: ${data.name}`, 'client', clientModal.data.id); showToast('Client updated'); }
      else { const result = await supabase.from('clients').insert([data]).select(); await logActivity(`Added client: ${data.name}`, 'client', result.data[0].id); showToast('Client added'); }
      setClientModal({ open: false, data: null }); fetchAll();
    } catch (e) { showToast(e.message, 'error'); }
    setSaving(false);
  };
  const updateClientStatus = async (clientId, status) => { await supabase.from('clients').update({ status }).eq('id', clientId); const client = clients.find(c => c.id === clientId); if (client) await logActivity(`Client "${client.name}" changed to ${status}`, 'client', clientId); showToast('Client status updated'); fetchAll(); };
  const deleteClient = (c) => { 
    setConfirmDialog({ 
      open: true, 
      title: 'Delete Client', 
      message: `Delete "${c.name}"?`, 
      onConfirm: async () => { 
        await supabase.from('clients').delete().eq('id', c.id); 
        await logActivity(`Deleted client: ${c.name}`, 'client', c.id); 
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} }); 
        showToast('Client deleted'); 
        fetchAll(); 
      } 
    }); 
  };

  const openRevenueModal = (r = null) => { if (r) setRevenueForm({ ...r }); else setRevenueForm({ client_id: '', product_id: '', amount: '', type: 'subscription', date: new Date().toISOString().split('T')[0], notes: '' }); setRevenueModal({ open: true, data: r }); };
  const saveRevenue = async () => {
    setSaving(true);
    try {
      const data = { ...revenueForm, client_id: revenueForm.client_id || null, product_id: revenueForm.product_id || null, amount: parseFloat(revenueForm.amount) };
      if (revenueModal.data) { await supabase.from('revenue').update(data).eq('id', revenueModal.data.id); await logActivity(`Updated revenue: ${formatINR(data.amount)}`, 'revenue', revenueModal.data.id); showToast('Revenue updated'); }
      else { const result = await supabase.from('revenue').insert([data]).select(); await logActivity(`Recorded revenue: ${formatINR(data.amount)}`, 'revenue', result.data[0].id); showToast('Revenue recorded'); }
      setRevenueModal({ open: false, data: null }); fetchAll();
    } catch (e) { showToast(e.message, 'error'); }
    setSaving(false);
  };
  const deleteRevenue = (r) => { 
    setConfirmDialog({ 
      open: true, 
      title: 'Delete Revenue', 
      message: `Delete ${formatINR(r.amount)}?`, 
      onConfirm: async () => { 
        await supabase.from('revenue').delete().eq('id', r.id); 
        await logActivity(`Deleted revenue: ${formatINR(r.amount)}`, 'revenue', r.id); 
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} }); 
        showToast('Revenue deleted'); 
        fetchAll(); 
      } 
    }); 
  };

  const saveAgent = async () => {
    setSaving(true);
    try {
      const data = { ...agentForm, status: 'idle', tasks_completed: 0, tasks_failed: 0 };
      if (agentModal.data) {
        await supabase.from('agents').update(data).eq('id', agentModal.data.id);
        showToast('Agent updated');
      } else {
        await supabase.from('agents').insert([data]);
        showToast('Agent created');
      }
      setAgentModal({ open: false, data: null });
      fetchAll();
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
    setSaving(false);
  };

  const deleteAgent = (a) => {
    setConfirmDialog({ open: true, title: 'Delete Agent', message: `Delete "${a.name}" and all sub-agents?`, onConfirm: async () => {
      await supabase.from('agents').delete().eq('id', a.id);
      setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} });
      showToast('Agent deleted');
      fetchAll();
    }});
  };

  const updateAgentStatus = async (agentId, status) => {
    await supabase.from('agents').update({ status, last_active_at: new Date().toISOString() }).eq('id', agentId);
    showToast('Status updated');
    fetchAll();
  };

  const saveSubAgent = async () => {
    setSaving(true);
    try {
      const data = { ...subAgentForm, agent_id: subAgentModal.agentId, status: 'idle', tasks_completed: 0 };
      if (subAgentModal.data) {
        await supabase.from('sub_agents').update(data).eq('id', subAgentModal.data.id);
        showToast('Sub-agent updated');
      } else {
        await supabase.from('sub_agents').insert([data]);
        showToast('Sub-agent created');
      }
      setSubAgentModal({ open: false, data: null, agentId: null });
      fetchAll();
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
    setSaving(false);
  };

  const deleteSubAgent = (sa) => {
    setConfirmDialog({ open: true, title: 'Delete Sub-Agent', message: `Delete "${sa.name}"?`, onConfirm: async () => {
      await supabase.from('sub_agents').delete().eq('id', sa.id);
      setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} });
      showToast('Sub-agent deleted');
      fetchAll();
    }});
  };

  const updateSubAgentStatus = async (subAgentId, status, taskId) => {
    await supabase.from('sub_agents').update({ status, last_active_at: new Date().toISOString() }).eq('id', subAgentId);
    if (status === 'completed' && taskId) {
      await supabase.from('tasks').update({ status: 'done' }).eq('id', taskId);
    }
    showToast('Status updated');
    fetchAll();
  };

  const assignTaskToSubAgent = async (subAgentId, taskId, taskTitle) => {
    await supabase.from('sub_agents').update({ assigned_task_id: taskId, current_task: taskTitle, status: 'working', last_active_at: new Date().toISOString() }).eq('id', subAgentId);
    await supabase.from('tasks').update({ status: 'in_progress' }).eq('id', taskId);
    await supabase.from('agent_activity').insert([{ sub_agent_id: subAgentId, action: 'started_task', details: taskTitle, task_id: taskId }]);
    showToast('Task assigned');
    fetchAll();
  };

  const completeSubAgentTask = async (sa) => {
    if (sa.assigned_task_id) {
      await supabase.from('tasks').update({ status: 'done' }).eq('id', sa.assigned_task_id);
    }
    await supabase.from('sub_agents').update({ status: 'idle', assigned_task_id: null, current_task: null, tasks_completed: (sa.tasks_completed || 0) + 1, last_active_at: new Date().toISOString() }).eq('id', sa.id);
    await supabase.from('agent_activity').insert([{ sub_agent_id: sa.id, action: 'completed_task', details: sa.current_task, task_id: sa.assigned_task_id }]);
    showToast('Task completed!');
    fetchAll();
  };

  const callMiniMax = async (systemPrompt, userMessage, model = 'MiniMax-M2.5') => {
    const apiKey = localStorage.getItem('nerve_minimax_key');
    if (!apiKey) { showToast('Configure MiniMax API key in settings', 'error'); return null; }
    try {
      const res = await fetch('/api/agent-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, userMessage, model, apiKey })
      });
      const data = await res.json();
      if (data.error) { showToast('API error: ' + data.error, 'error'); return null; }
      return data.result || 'No response';
    } catch (e) { showToast('API error: ' + e.message, 'error'); return null; }
  };

  const testMiniMaxAPI = async () => {
    const result = await callMiniMax('You are a helpful assistant. Reply with just "OK" if you can hear me.', 'Test message');
    if (result) showToast('API Connected!', 'success');
    else showToast('API failed', 'error');
  };

  const saveSettings = () => {
    localStorage.setItem('nerve_minimax_key', miniMaxKey);
    localStorage.setItem('nerve_default_model', defaultModel);
    showToast('Settings saved!');
    setSettingsModal({ open: false });
  };

  const executeTask = async (sa, task) => {
    if (!localStorage.getItem('nerve_minimax_key')) { showToast('Set API key in ⚙️ settings first', 'error'); return; }
    setExecuting(sa.id);
    const product = products.find(p => p.id === task.product_id);
    const prompts = { frontend: 'Write frontend code (React/HTML/CSS). Be specific and actionable.', backend: 'Write backend code (APIs/server). Be specific and actionable.', testing: 'Write test cases and review code quality.', outreach: 'Write personalized sales outreach emails.', docs: 'Write clear documentation and guides.', analytics: 'Analyze data and provide insights.', design: 'Provide UI/UX design recommendations.', custom: 'Be a helpful specialist.' };
    const sysPrompt = `You are ${sa.name}, a ${sa.specialty} specialist at PPVentures.${product ? ` Product: ${product.name}.` : ''} ${prompts[sa.specialty] || 'Be helpful and specific.'}`;
    const taskPrompt = `Task: ${task.title}\nPriority: ${task.priority}\n${task.notes ? `Notes: ${task.notes}` : ''}\n\nProvide complete, actionable output.`;
    
    await supabase.from('sub_agents').update({ status: 'working', current_task: task.title }).eq('id', sa.id);
    await supabase.from('tasks').update({ status: 'in_progress' }).eq('id', task.id);
    await supabase.from('agent_activity').insert([{ sub_agent_id: sa.id, action: 'started_task', details: task.title, task_id: task.id }]);
    showToast(`${sa.name} started: ${task.title}`);
    
    const result = await callMiniMax(sysPrompt, taskPrompt, sa.model || defaultModel);
    if (result) {
      await supabase.from('tasks').update({ notes: result, status: 'done', completed_at: new Date().toISOString() }).eq('id', task.id);
      await supabase.from('sub_agents').update({ status: 'idle', tasks_completed: (sa.tasks_completed || 0) + 1, last_active_at: new Date().toISOString() }).eq('id', sa.id);
      await supabase.from('agent_activity').insert([{ sub_agent_id: sa.id, action: 'completed_task', details: task.title, task_id: task.id }]);
      showToast(`${sa.name} completed: ${task.title}`);
      setOutputModal({ open: true, title: task.title, output: result, agent: sa.name, time: new Date().toLocaleString() });
    } else {
      await supabase.from('sub_agents').update({ status: 'error', current_task: 'API failed' }).eq('id', sa.id);
      showToast(`${sa.name} failed`, 'error');
    }
    setExecuting(null);
    fetchAll();
  };

  const executeClientFollowUp = async (sa, client) => {
    if (!localStorage.getItem('nerve_minimax_key')) { showToast('Set API key in ⚙️ settings first', 'error'); return; }
    setExecuting(sa.id);
    
    await supabase.from('sub_agents').update({ status: 'working', current_task: `Follow up: ${client.name}` }).eq('id', sa.id);
    await supabase.from('agent_activity').insert([{ sub_agent_id: sa.id, action: 'started_followup', details: `Follow up: ${client.name}`, client_id: client.id }]);
    showToast(`${sa.name} following up: ${client.name}`);
    
    const result = await callMiniMax(
      `You are SalesBot, a sales specialist at PPVentures (AI agent software company). Write professional, warm follow-up messages.`,
      `Write a follow-up message for this lead:\nName: ${client.name}\nEmail: ${client.email || 'N/A'}\nPhone: ${client.phone || 'N/A'}\nStatus: ${client.status}\nDeal Value: ₹${client.deal_value || 'Unknown'}\nNotes: ${client.notes || 'None'}\n\nWrite a warm, professional outreach message.`,
      sa.model || defaultModel
    );
    
    if (result) {
      const updatedNotes = `[SalesBot Follow-up ${new Date().toLocaleDateString()}]\n${result}\n\n${client.notes || ''}`;
      await supabase.from('clients').update({ notes: updatedNotes, status: 'prospect' }).eq('id', client.id);
      await supabase.from('sub_agents').update({ status: 'idle', tasks_completed: (sa.tasks_completed || 0) + 1, last_active_at: new Date().toISOString() }).eq('id', sa.id);
      await supabase.from('agent_activity').insert([{ sub_agent_id: sa.id, action: 'completed_followup', details: `Completed: ${client.name}`, client_id: client.id }]);
      showToast(`SalesBot completed: ${client.name}`);
      setOutputModal({ open: true, title: `Follow-up: ${client.name}`, output: result, agent: sa.name, time: new Date().toLocaleString() });
    } else {
      await supabase.from('sub_agents').update({ status: 'error', current_task: 'API failed' }).eq('id', sa.id);
      showToast(`${sa.name} failed`, 'error');
    }
    setExecuting(null);
    fetchAll();
  };

  const executeProductDescription = async (sa, product) => {
    if (!localStorage.getItem('nerve_minimax_key')) { showToast('Set API key in ⚙️ settings first', 'error'); return; }
    setExecuting(sa.id);
    
    await supabase.from('sub_agents').update({ status: 'working', current_task: `Write description: ${product.name}` }).eq('id', sa.id);
    await supabase.from('agent_activity').insert([{ sub_agent_id: sa.id, action: 'started_description', details: `Description: ${product.name}`, product_id: product.id }]);
    showToast(`${sa.name} writing: ${product.name}`);
    
    const result = await callMiniMax(
      `You are ContentBot, a content specialist at PPVentures. Write compelling product descriptions for AI agent software products.`,
      `Write a professional product description for:\nProduct: ${product.name}\nStatus: ${product.status}\nStage: ${product.stage}\nRevenue Model: ${product.revenue_model}\n\nWrite 2-3 sentences describing what this product does, who it's for, and its key value proposition. Make it compelling and professional.`,
      sa.model || defaultModel
    );
    
    if (result) {
      await supabase.from('products').update({ description: result }).eq('id', product.id);
      await supabase.from('sub_agents').update({ status: 'idle', tasks_completed: (sa.tasks_completed || 0) + 1, last_active_at: new Date().toISOString() }).eq('id', sa.id);
      await supabase.from('agent_activity').insert([{ sub_agent_id: sa.id, action: 'completed_description', details: `Description: ${product.name}`, product_id: product.id }]);
      showToast(`ContentBot completed: ${product.name}`);
      setOutputModal({ open: true, title: `Description: ${product.name}`, output: result, agent: sa.name, time: new Date().toLocaleString() });
    } else {
      await supabase.from('sub_agents').update({ status: 'error', current_task: 'API failed' }).eq('id', sa.id);
      showToast(`${sa.name} failed`, 'error');
    }
    setExecuting(null);
    fetchAll();
  };

  const runNeo = async () => {
    if (!localStorage.getItem('nerve_minimax_key')) { showToast('Set API key in ⚙️ settings first', 'error'); return; }
    const neo = agents.find(a => a.name === 'Neo');
    if (!neo) { showToast('Neo not found', 'error'); return; }
    const idleSubs = subAgents.filter(s => s.status === 'idle' || s.status === 'completed');
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const newLeads = clients.filter(c => c.status === 'lead');
    const emptyDescriptions = products.filter(p => !p.description || p.description.length < 10);
    if (todoTasks.length === 0 && newLeads.length === 0 && emptyDescriptions.length === 0) { showToast('Neo: Nothing to do — all clear! ✅'); return; }
    if (idleSubs.length === 0) { showToast('No available agents', 'error'); return; }
    
    const workItems = [];
    todoTasks.forEach(t => workItems.push({ type: 'task', id: t.id, title: t.title, priority: t.priority }));
    newLeads.forEach(c => workItems.push({ type: 'client', id: c.id, title: c.name, priority: 'medium' }));
    emptyDescriptions.forEach(p => workItems.push({ type: 'product', id: p.id, title: p.name, priority: 'low' }));
    
    const assignPrompt = `You are Neo, AI Chief of Staff for PPVentures. Assign work to the best agent.
Rules:
- DevBot (frontend/development) → coding tasks, building features
- SalesBot (outreach) → client follow-ups, lead nurturing
- ContentBot (docs) → product descriptions, documentation, marketing
- QABot (testing) → reviewing completed tasks, quality checks

WORK ITEMS:
${workItems.map((w, i) => `${i + 1}. [${w.type}] "${w.title}" [${w.priority}]`).join('\n')}

AVAILABLE AGENTS:
${idleSubs.map(s => `- ${s.name} [${s.specialty}]`).join('\n')}

Respond with ONLY a JSON array. No markdown, no explanation.
Format: [{"type":"task|client|product","item_id":"uuid","agent_name":"DevBot|SalesBot|ContentBot|QABot"}]`;
    
    showToast('Neo analyzing work...');
    const result = await callMiniMax(assignPrompt, 'Assign these items to agents', 'MiniMax-M2.5');
    if (!result) return;
    
    try {
      const assigns = JSON.parse(result);
      for (const a of assigns) {
        const sub = subAgents.find(s => s.name === a.agent_name);
        if (!sub) continue;
        if (a.type === 'task') {
          const task = tasks.find(t => t.id === a.item_id);
          if (task) await executeTask(sub, task);
        } else if (a.type === 'client') {
          const client = clients.find(c => c.id === a.item_id);
          if (client) await executeClientFollowUp(sub, client);
        } else if (a.type === 'product') {
          const product = products.find(p => p.id === a.item_id);
          if (product) await executeProductDescription(sub, product);
        }
      }
      showToast(`Neo assigned ${assigns.length} work items!`);
    } catch (e) { showToast('Neo parsing failed: ' + e.message, 'error'); }
    fetchAll();
  };
    
  const openAgentModal = (a = null) => {
    if (a) setAgentForm({ name: a.name, role: a.role, description: a.description || '', avatar: a.avatar || '🤖', model: a.model || 'MiniMax-M2.5', assigned_product_id: a.assigned_product_id || '' });
    else setAgentForm({ name: '', role: 'developer', description: '', avatar: '🤖', model: 'MiniMax-M2.5', assigned_product_id: '' });
    setAgentModal({ open: true, data: a });
  };

  const openSubAgentModal = (sa = null, agentId) => {
    if (sa) setSubAgentForm({ name: sa.name, specialty: sa.specialty, description: sa.description || '', avatar: sa.avatar || '🔧', assigned_task_id: sa.assigned_task_id || '' });
    else setSubAgentForm({ name: '', specialty: 'frontend', description: '', avatar: '🔧', assigned_task_id: '' });
    setSubAgentModal({ open: true, data: sa, agentId: agentId || sa?.agent_id });
  };

  const productTasks = selectedProduct ? tasks.filter(t => t.product_id === selectedProduct.id) : [];
  if (loading) return <div className="min-h-screen bg-gray-950 text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans">
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
          {toasts.map(t => (
            <div key={t.id} className={`px-5 py-3 rounded-lg text-white text-sm font-medium shadow-xl ${t.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
              {t.type === 'success' ? '✓ ' : '✗ '}{t.msg}
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog isOpen={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} })} onConfirm={confirmDialog.onConfirm} title={confirmDialog.title} message={confirmDialog.message} />
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* NERVE Logo */}
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="#22c55e" strokeWidth="2" fill="none"/>
              <circle cx="16" cy="10" r="3" fill="#22c55e"/>
              <circle cx="10" cy="20" r="3" fill="#22c55e"/>
              <circle cx="22" cy="20" r="3" fill="#22c55e"/>
              <circle cx="16" cy="16" r="2" fill="#22c55e"/>
              <line x1="16" y1="13" x2="16" y2="14" stroke="#22c55e" strokeWidth="1.5"/>
              <line x1="13" y1="17" x2="10" y2="18" stroke="#22c55e" strokeWidth="1.5"/>
              <line x1="19" y1="17" x2="22" y2="18" stroke="#22c55e" strokeWidth="1.5"/>
            </svg>
            <div>
              <div className="text-xl font-bold text-white tracking-tight">NERVE</div>
              <div className="text-[10px] text-gray-500 -mt-0.5">PPVentures Command Center</div>
            </div>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 text-center">
              <div className="text-2xl font-bold text-white">{products.length}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Products</div>
            </div>
            <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 text-center">
              <div className="text-lg"><span className="text-yellow-400 font-bold">{todoTasks}</span> <span className="text-gray-500">/</span> <span className="text-blue-400 font-bold">{inProgressTasks}</span> <span className="text-gray-500">/</span> <span className="text-green-400 font-bold">{doneTasks}</span></div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Tasks</div>
            </div>
            <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 text-center">
              <div className="text-2xl font-bold text-yellow-400">{formatINR(pipelineValue)}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Pipeline</div>
            </div>
            <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 text-center">
              <div className="text-2xl font-bold text-green-400">{formatINR(monthRevenue)}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">This Month</div>
            </div>
            <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50 text-center">
              <div className="text-2xl font-bold text-blue-400">{activeClients}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Active</div>
            </div>
            <button onClick={fetchAll} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 text-white transition-colors">↻</button>
          </div>
        </div>
      </div>
      {/* Tab Bar */}
      <div className="flex border-b border-gray-800 bg-gray-900/50">
        {['home', 'products', 'clients', 'revenue', 'activity', 'agents'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-medium capitalize flex items-center gap-2 transition-all ${activeTab === tab ? 'text-white border-b-2 border-green-500 bg-gray-800/50' : 'text-gray-400 hover:text-white hover:bg-gray-800/30'}`}>
            {tab === 'home' && '🏠'} {tab === 'products' && '📦'} {tab === 'clients' && '👥'} {tab === 'revenue' && '💰'} {tab === 'activity' && '📊'} {tab === 'agents' && '🤖'}
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Good morning, Deva!</h2>
              <p className="text-gray-400">Here's your PPVentures briefing</p>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="card-elevated p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{formatINR(monthRevenue)}</div>
                <div className="text-xs text-gray-400 mt-1">Revenue This Month</div>
              </div>
              <div className="card-elevated p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{activeClients}</div>
                <div className="text-xs text-gray-400 mt-1">Active Clients</div>
              </div>
              <div className="card-elevated p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">{products.length}</div>
                <div className="text-xs text-gray-400 mt-1">Products</div>
              </div>
              <div className="card-elevated p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">{subAgents.filter(s => s.status === 'working').length}</div>
                <div className="text-xs text-gray-400 mt-1">Agents Working</div>
              </div>
            </div>
            {/* Priority Tasks */}
            {tasks.filter(t => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'done').length > 0 && (
              <div className="card-elevated p-4">
                <h3 className="text-white font-bold mb-3">📌 Priority Tasks</h3>
                <div className="space-y-2">
                  {tasks.filter(t => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'done').slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${t.priority === 'urgent' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                        <span className="text-white text-sm">{t.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Recent Activity */}
            <div className="card-elevated p-4">
              <h3 className="text-white font-bold mb-3">📊 Recent Activity</h3>
              <div className="space-y-2">
                {activity.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <span className="text-sm text-gray-300">{a.action}</span>
                    <span className="text-xs text-gray-500">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
                {activity.length === 0 && <p className="text-gray-500 text-sm">No recent activity</p>}
              </div>
            </div>
            {/* Agent Status */}
            <div className="card-elevated p-4">
              <h3 className="text-white font-bold mb-3">🤖 Agent Status</h3>
              <div className="grid grid-cols-5 gap-2">
                {subAgents.slice(0, 5).map(sa => (
                  <div key={sa.id} className={`p-2 rounded text-center ${sa.status === 'working' ? 'bg-yellow-900/30 border border-yellow-700/30' : sa.status === 'idle' ? 'bg-green-900/30 border border-green-700/30' : 'bg-gray-800/50 border border-gray-700/30'}`}>
                    <div className="text-lg mb-1">{sa.avatar}</div>
                    <div className="text-xs text-white">{sa.name}</div>
                    <div className={`text-xs ${sa.status === 'working' ? 'text-yellow-400' : sa.status === 'idle' ? 'text-green-400' : 'text-gray-500'}`}>{sa.status}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Quick Actions */}
            <div className="flex gap-4 justify-center">
              <button onClick={runNeo} className="px-6 py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2">
                ▶ Run Neo Now
              </button>
              <button onClick={() => setAutoMode(!autoMode)} className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${autoMode ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                🔄 Auto Mode: {autoMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center"><h2 className="font-bold text-white">Products</h2><button onClick={() => openProductModal()} className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm">+ Add</button></div>
              {products.length === 0 ? <div className="text-gray-500 text-sm">No products yet</div> : products.map(p => {
                const ptasks = tasks.filter(t => t.product_id === p.id);
                const doneTasks = ptasks.filter(t => t.status === 'done').length;
                const pct = ptasks.length > 0 ? Math.round((doneTasks / ptasks.length) * 100) : 0;
                return (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className={`p-4 rounded-xl cursor-pointer border card-elevated card-glow transition-all ${selectedProduct?.id === p.id ? 'border-green-500/50' : 'border-gray-700/50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-white text-lg">{p.name}</div>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openProductModal(p); }} className="text-gray-400 hover:text-white p-1">✏️</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteProduct(p); }} className="text-gray-400 hover:text-red-400 p-1">🗑️</button>
                    </div>
                  </div>
                  {p.description && <div className="text-xs text-gray-400 mb-3 line-clamp-2">{p.description.slice(0, 80)}{p.description.length > 80 ? '...' : ''}</div>}
                  <div className="flex gap-2 mb-3"><StatusBadge status={p.status} type="product" /><StatusBadge status={p.stage} type="stage" /></div>
                  {ptasks.length > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{doneTasks}/{ptasks.length} tasks</span>
                        <span className="text-green-400">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>)})}
            </div>
            <div className="lg:col-span-2">
              {selectedProduct ? (<div><div className="flex justify-between items-center mb-4"><h2 className="font-bold text-white">{selectedProduct.name} — Tasks</h2><button onClick={() => openTaskModal()} className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm">+ Add Task</button></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['todo', 'in_progress', 'done', 'blocked'].map(status => (<div key={status} className="bg-gray-900 p-3 rounded"><div className="text-xs text-gray-400 uppercase mb-2">{status.replace('_', ' ')}</div>
                    {productTasks.filter(t => t.status === status).map(t => {
                      const pClass = t.priority === 'urgent' ? 'priority-urgent' : t.priority === 'high' ? 'priority-high' : t.priority === 'medium' ? 'priority-medium' : 'priority-low';
                      return (
                      <div key={t.id} className={`p-2 bg-gray-800 rounded mb-2 text-sm border-l-3 ${pClass}`}>
                        <div className="text-white">{t.title}</div>
                        <div className="flex gap-1 mt-1 items-center">
                          <StatusBadge status={t.priority} type="priority" />
                          {t.due_date && <span className="text-xs text-gray-500">{t.due_date}</span>}
                          <button onClick={() => openTaskModal(t)} className="text-gray-400 hover:text-white text-xs ml-auto">✏️</button>
                          <select value={t.status} onChange={(e) => updateTaskStatus(t.id, e.target.value)} className="text-xs bg-gray-700 rounded px-1">{['todo', 'in_progress', 'done', 'blocked'].map(s => <option key={s} value={s}>{s}</option>)}</select>
                          <button onClick={() => deleteTask(t)} className="text-red-400 text-xs">×</button>
                        </div>
                      </div>)})}
                  </div>))}
                </div></div>) : <div className="text-gray-500">Select a product to see tasks</div>}
            </div></div>)}
        {activeTab === 'clients' && (<div><div className="flex justify-between items-center mb-4"><h2 className="font-bold text-white">Clients & Pipeline</h2><button onClick={() => openClientModal()} className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm">+ Add Client</button></div>
          {/* Pipeline Funnel */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700/50 text-center relative">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-gray-300">{leads.length}</div>
              <div className="text-xs text-gray-400 mt-1">Leads</div>
              <div className="text-sm text-yellow-400 mt-2">{formatINR(leadValue)}</div>
              {leads.length > 0 && <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-gray-600 z-10">→</div>}
            </div>
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-xl border border-yellow-700/30 text-center relative">
              <div className="text-3xl mb-2">🤝</div>
              <div className="text-2xl font-bold text-yellow-400">{prospects.length}</div>
              <div className="text-xs text-gray-400 mt-1">Prospects</div>
              <div className="text-sm text-yellow-400 mt-2">{formatINR(prospectValue)}</div>
              {prospects.length > 0 && <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-gray-600 z-10">→</div>}
            </div>
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-xl border border-green-700/30 text-center relative">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-400">{active.length}</div>
              <div className="text-xs text-gray-400 mt-1">Active</div>
              <div className="text-sm text-green-400 mt-2">{formatINR(activeValue)}</div>
              {active.length > 0 && <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-gray-600 z-10">→</div>}
            </div>
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-4 rounded-xl border border-red-700/30 text-center">
              <div className="text-3xl mb-2">❌</div>
              <div className="text-2xl font-bold text-red-400">{churned.length}</div>
              <div className="text-xs text-gray-400 mt-1">Churned</div>
            </div>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-900/80"><tr><th className="p-3 text-left text-gray-400">Name</th><th className="p-3 text-left text-gray-400">Email</th><th className="p-3 text-left text-gray-400">Status</th><th className="p-3 text-left text-gray-400">Product</th><th className="p-3 text-right text-gray-400">Deal Value</th><th className="p-3"></th></tr></thead><tbody>
            {clients.map(c => (<tr key={c.id} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors"><td className="p-3 text-white font-medium">{c.name}</td><td className="p-3 text-gray-400">{c.email || '—'}</td><td className="p-3"><select value={c.status} onChange={(e) => updateClientStatus(c.id, e.target.value)} className={`bg-gray-800 rounded px-2 py-1 text-xs ${c.status === 'lead' ? 'text-gray-300' : c.status === 'prospect' ? 'text-yellow-400' : c.status === 'active_client' ? 'text-green-400' : 'text-red-400'}`}>{['lead', 'prospect', 'active_client', 'churned'].map(s => <option key={s} value={s}>{s}</option>)}</select></td><td className="p-3 text-gray-400">{products.find(p => p.id === c.product_id)?.name || '—'}</td><td className="p-3 text-right text-green-400 font-mono">{c.deal_value ? formatINR(c.deal_value) : '—'}</td><td className="p-3"><button onClick={() => openClientModal(c)} className="text-gray-400 hover:text-white mr-2">✏️</button><button onClick={() => deleteClient(c)} className="text-gray-400 hover:text-red-400">🗑️</button></td></tr>))}
            {clients.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">No clients yet — add your first lead!</td></tr>}</tbody></table></div></div>)}
        {activeTab === 'revenue' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-white">Revenue</h2><button onClick={() => openRevenueModal()} className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm">+ Add Revenue</button></div>
          <div className="grid grid-cols-3 gap-4 mb-4"><div className="bg-gray-900 p-3 rounded"><div className="text-xl font-bold text-green-400">{formatINR(monthRevenue)}</div><div className="text-xs text-gray-400">This Month</div></div><div className="bg-gray-900 p-3 rounded"><div className="text-xl font-bold text-gray-400">{formatINR(lastMonthRevenue)}</div><div className="text-xs text-gray-400">Last Month</div></div><div className="bg-gray-900 p-3 rounded"><div className={`text-xl font-bold ${revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{revenueChange >= 0 ? '+' : ''}{revenueChange}%</div><div className="text-xs text-gray-400">Change</div></div></div>
          {chartData.length > 0 && (<div className="bg-gray-900 p-4 rounded mb-4"><h3 className="text-sm text-gray-400 mb-2">Monthly Revenue</h3><ResponsiveContainer width="100%" height={200}><BarChart data={chartData}><XAxis dataKey="month" stroke="#6b7280" fontSize={12} /><YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => formatINR(v)} /><Tooltip formatter={(v) => formatINR(v)} contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} /><Bar dataKey="amount" fill="#10b981" /></BarChart></ResponsiveContainer></div>)}
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-900"><tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">Client</th><th className="p-2 text-left">Product</th><th className="p-2 text-right">Amount</th><th className="p-2 text-left">Type</th><th className="p-2"></th></tr></thead><tbody>
            {revenue.map(r => (<tr key={r.id} className="border-t border-gray-800"><td className="p-2 text-gray-400">{r.date}</td><td className="p-2 text-white">{clients.find(c => c.id === r.client_id)?.name || '—'}</td><td className="p-2 text-gray-400">{products.find(p => p.id === r.product_id)?.name || '—'}</td><td className="p-2 text-right text-green-400 font-mono">{formatINR(r.amount)}</td><td className="p-2 text-gray-400">{r.type}</td><td className="p-2"><button onClick={() => openRevenueModal(r)} className="text-gray-400 hover:text-white mr-2">✏️</button><button onClick={() => deleteRevenue(r)} className="text-gray-400 hover:text-red-400">🗑️</button></td></tr>))}
            {revenue.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">No revenue yet</td></tr>}</tbody></table></div></div>
          <div><h3 className="font-bold text-white mb-4">Activity Feed</h3><div className="space-y-2 max-h-[600px] overflow-y-auto">{activity.map(a => (<div key={a.id} className="p-3 bg-gray-900 rounded text-sm"><span className="text-green-400">{a.action}</span><div className="text-gray-500 text-xs mt-1">{new Date(a.created_at).toLocaleString()}</div></div>))}{activity.length === 0 && <div className="text-gray-500">No activity yet</div>}</div></div></div>)}
        {activeTab === 'activity' && (
          <div>
            <h2 className="font-bold text-white mb-4">Activity Log</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {activity.map(a => (
                <div key={a.id} className="p-3 bg-gray-900 rounded text-sm">
                  <span className={a.entity_type === 'product' ? 'text-green-400' : a.entity_type === 'task' ? 'text-blue-400' : a.entity_type === 'client' ? 'text-yellow-400' : a.entity_type === 'revenue' ? 'text-purple-400' : 'text-gray-400'}>{a.action}</span>
                  <div className="text-gray-500 text-xs mt-1">{new Date(a.created_at).toLocaleString()}</div>
                </div>
              ))}
              {activity.length === 0 && <div className="text-gray-500">No activity yet</div>}
            </div>
          </div>
        )}
        {activeTab === 'agents' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-white text-lg">🧠 Neo — AI Workforce</h2>
              <div className="flex gap-2">
                <button onClick={() => setAutoMode(!autoMode)} className={`px-3 py-2 rounded text-sm font-medium ${autoMode ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300'}`}>🔄 Auto: {autoMode ? 'ON' : 'OFF'}</button>
                <button onClick={() => setSettingsModal({ open: true })} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">⚙️ Settings</button>
                <button onClick={runNeo} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded text-sm font-bold">▶ Run Neo</button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-gray-900 p-4 rounded"><div className="text-2xl font-bold text-white">{agents.length}</div><div className="text-xs text-gray-400">Agents</div></div>
              <div className="bg-gray-900 p-4 rounded"><div className="text-2xl font-bold text-green-400">{subAgents.filter(s => s.status === 'working').length}</div><div className="text-xs text-gray-400">Working</div></div>
              <div className="bg-gray-900 p-4 rounded"><div className="text-2xl font-bold text-yellow-400">{tasks.filter(t => t.status === 'todo').length}</div><div className="text-xs text-gray-400">Tasks Queue</div></div>
              <div className="bg-gray-900 p-4 rounded"><div className="text-2xl font-bold text-blue-400">{subAgents.reduce((s, a) => s + (a.tasks_completed || 0), 0)}</div><div className="text-xs text-gray-400">Done</div></div>
              <div className={`p-4 rounded ${autoMode ? 'bg-green-900' : 'bg-gray-900'}`}><div className={`text-2xl font-bold ${autoMode ? 'text-green-400' : 'text-gray-500'}`}>{autoMode ? 'ON' : 'OFF'}</div><div className="text-xs text-gray-400">Auto Mode</div></div>
            </div>
            
            {/* Task Queue */}
            {tasks.filter(t => t.status === 'todo').length > 0 && (
              <div className="bg-gray-900 p-4 rounded">
                <h3 className="text-white font-bold mb-3">📋 Task Queue</h3>
                <div className="space-y-2">
                  {tasks.filter(t => t.status === 'todo').map(task => {
                    const idleSubs = subAgents.filter(s => s.status === 'idle' || s.status === 'completed');
                    return (
                      <div key={task.id} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm">{task.title}</div>
                          <div className="text-xs text-gray-500">{task.priority} • {products.find(p => p.id === task.product_id)?.name || 'No product'}</div>
                        </div>
                        <div className="flex gap-2">
                          <select onChange={async (e) => { const sa = subAgents.find(s => s.id === e.target.value); if(sa) await executeTask(sa, task); }} className="bg-gray-700 text-white text-xs px-2 py-1 rounded">
                            <option value="">Assign to...</option>
                            {idleSubs.map(s => <option key={s.id} value={s.id}>{s.name} ({s.specialty})</option>)}
                          </select>
                          {idleSubs.length > 0 && <button onClick={async () => { const sa = idleSubs[0]; if(sa) await executeTask(sa, task); }} className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-xs rounded">▶ Run</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Neo Card */}
            {agents.find(a => a.name === 'Neo') ? (
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded border border-green-500/30 shadow-lg shadow-green-500/10">
                {agents.filter(a => a.name === 'Neo').map(neo => {
                  const neoSubs = subAgents.filter(sa => sa.agent_id === neo.id);
                  const workingSubs = neoSubs.filter(sa => sa.status === 'working').length;
                  return (
                    <div key={neo.id}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-3xl">🧠</span>
                            <div>
                              <span className="text-white font-bold text-xl">NEO</span>
                              <span className="text-green-400 text-xs ml-2">Master Agent</span>
                            </div>
                          </div>
                          <div className="text-gray-400 text-sm">AI Chief of Staff • {neoSubs.length} sub-agents • {workingSubs} working</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={runNeo} className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-sm rounded font-bold">▶ Run Neo</button>
                        </div>
                      </div>
                      {neoSubs.length > 0 && (
                        <div className="border-t border-gray-700 pt-3 mt-3">
                          <div className="text-gray-400 text-xs mb-2">Sub-Agents</div>
                          <div className="grid grid-cols-2 gap-2">
                            {neoSubs.map(sa => (
                              <div key={sa.id} className="bg-gray-800 p-3 rounded">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{sa.avatar || '🔧'}</span>
                                    <span className="text-white text-sm font-medium">{sa.name}</span>
                                  </div>
                                  <select value={sa.status} onChange={e => updateSubAgentStatus(sa.id, e.target.value)} className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded">
                                    <option value="idle">Idle</option>
                                    <option value="working">Working</option>
                                    <option value="completed">Done</option>
                                    <option value="error">Error</option>
                                  </select>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">{sa.specialty} • {sa.current_task || 'No task'}</div>
                                {executing === sa.id ? (
                                  <div className="text-xs text-blue-400 animate-pulse">⏳ Processing via {sa.model || 'MiniMax-M2.5'}...</div>
                                ) : sa.status === 'working' ? (
                                  <button onClick={() => completeSubAgentTask(sa)} className="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded">Complete</button>
                                ) : (
                                  <select onChange={async (e) => { const t = tasks.find(tk => tk.id === e.target.value); if(t) await executeTask(sa, t); }} className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded w-full">
                                    <option value="">+ Assign Task</option>
                                    {tasks.filter(t => t.status === 'todo').map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                  </select>
                                )}
                              </div>
                            ))}
                          </div>
                          <button onClick={() => openSubAgentModal(null, neo.id)} className="mt-2 text-xs text-green-400 hover:text-green-300">+ Add Sub-Agent</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-900 p-8 rounded text-center">
                <div className="text-4xl mb-4">🧠</div>
                <div className="text-white text-lg mb-2">Neo is initializing...</div>
                <div className="text-gray-400 text-sm mb-4">Creating your AI Chief of Staff</div>
              </div>
            )}
            
            {/* Agent Activity */}
            {agentActivity.length > 0 && (
              <div className="card-elevated p-4">
                <h3 className="text-white font-bold mb-3">🕐 Agent Activity</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {agentActivity.slice(0, 20).map(aa => (
                    <div key={aa.id} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                      <span className="text-sm text-gray-300">{aa.details || aa.action}</span>
                      <span className="text-xs text-gray-500">{timeAgo(aa.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {agentActivity.length === 0 && (
              <div className="card-elevated p-4 text-center">
                <p className="text-gray-500 text-sm">No agent activity yet. Click "Run Neo" to start! 🤖</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Modal isOpen={productModal.open} onClose={() => setProductModal({ open: false, data: null })} title={productModal.data ? 'Edit Product' : 'Add Product'} onSave={saveProduct} saving={saving}>
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Name *" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
        <textarea className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Description" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
        <div className="flex gap-2 mb-2"><select className="flex-1 bg-gray-800 text-white p-2 rounded" value={productForm.status} onChange={e => setProductForm({...productForm, status: e.target.value})}><option value="idea">Idea</option><option value="in_development">In Development</option><option value="live">Live</option><option value="paused">Paused</option></select><select className="flex-1 bg-gray-800 text-white p-2 rounded" value={productForm.stage} onChange={e => setProductForm({...productForm, stage: e.target.value})}><option value="mvp">MVP</option><option value="beta">Beta</option><option value="v1">V1</option><option value="growth">Growth</option></select></div>
        <div className="flex gap-2 mb-2"><select className="flex-1 bg-gray-800 text-white p-2 rounded" value={productForm.revenue_model} onChange={e => setProductForm({...productForm, revenue_model: e.target.value})}><option value="one_time">One Time</option><option value="subscription">Subscription</option><option value="usage_based">Usage Based</option></select><input className="flex-1 bg-gray-800 text-white p-2 rounded" placeholder="Monthly Price (₹)" type="number" value={productForm.monthly_price} onChange={e => setProductForm({...productForm, monthly_price: e.target.value})} /></div>
      </Modal>
      <Modal isOpen={taskModal.open} onClose={() => setTaskModal({ open: false, data: null })} title={taskModal.data ? 'Edit Task' : 'Add Task'} onSave={saveTask} saving={saving}>
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Title *" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
        <div className="flex gap-2 mb-2"><select className="flex-1 bg-gray-800 text-white p-2 rounded" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}><option value="todo">Todo</option><option value="in_progress">In Progress</option><option value="done">Done</option><option value="blocked">Blocked</option></select><select className="flex-1 bg-gray-800 text-white p-2 rounded" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" type="date" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
        <textarea className="w-full bg-gray-800 text-white p-2 rounded" placeholder="Notes" value={taskForm.notes} onChange={e => setTaskForm({...taskForm, notes: e.target.value})} />
      </Modal>
      <Modal isOpen={clientModal.open} onClose={() => setClientModal({ open: false, data: null })} title={clientModal.data ? 'Edit Client' : 'Add Client'} onSave={saveClient} saving={saving}>
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Name *" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} />
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Email" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} />
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Phone" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} />
        <div className="flex gap-2 mb-2"><select className="flex-1 bg-gray-800 text-white p-2 rounded" value={clientForm.status} onChange={e => setClientForm({...clientForm, status: e.target.value})}><option value="lead">Lead</option><option value="prospect">Prospect</option><option value="active_client">Active Client</option><option value="churned">Churned</option></select><select className="flex-1 bg-gray-800 text-white p-2 rounded" value={clientForm.product_id} onChange={e => setClientForm({...clientForm, product_id: e.target.value})}><option value="">Select Product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Deal Value (₹)" type="number" value={clientForm.deal_value} onChange={e => setClientForm({...clientForm, deal_value: e.target.value})} />
        <textarea className="w-full bg-gray-800 text-white p-2 rounded" placeholder="Notes" value={clientForm.notes} onChange={e => setClientForm({...clientForm, notes: e.target.value})} />
      </Modal>
      <Modal isOpen={revenueModal.open} onClose={() => setRevenueModal({ open: false, data: null })} title={revenueModal.data ? 'Edit Revenue' : 'Add Revenue'} onSave={saveRevenue} saving={saving}>
        <select className="w-full bg-gray-800 text-white p-2 rounded mb-2" value={revenueForm.client_id} onChange={e => setRevenueForm({...revenueForm, client_id: e.target.value})}><option value="">Select Client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select className="w-full bg-gray-800 text-white p-2 rounded mb-2" value={revenueForm.product_id} onChange={e => setRevenueForm({...revenueForm, product_id: e.target.value})}><option value="">Select Product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Amount (₹)" type="number" value={revenueForm.amount} onChange={e => setRevenueForm({...revenueForm, amount: e.target.value})} />
        <div className="flex gap-2 mb-2"><select className="flex-1 bg-gray-800 text-white p-2 rounded" value={revenueForm.type} onChange={e => setRevenueForm({...revenueForm, type: e.target.value})}><option value="subscription">Subscription</option><option value="one_time">One Time</option><option value="usage_based">Usage Based</option></select><input className="flex-1 bg-gray-800 text-white p-2 rounded" type="date" value={revenueForm.date} onChange={e => setRevenueForm({...revenueForm, date: e.target.value})} /></div>
        <textarea className="w-full bg-gray-800 text-white p-2 rounded" placeholder="Notes" value={revenueForm.notes} onChange={e => setRevenueForm({...revenueForm, notes: e.target.value})} />
      </Modal>
      <Modal isOpen={agentModal.open} onClose={() => setAgentModal({ open: false, data: null })} title={agentModal.data ? 'Edit Agent' : 'New Agent'} onSave={saveAgent} saving={saving}>
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Name *" value={agentForm.name} onChange={e => setAgentForm({...agentForm, name: e.target.value})} />
        <select className="w-full bg-gray-800 text-white p-2 rounded mb-2" value={agentForm.role} onChange={e => setAgentForm({...agentForm, role: e.target.value})}>
          <option value="developer">Developer</option>
          <option value="qa">QA</option>
          <option value="sales">Sales</option>
          <option value="marketing">Marketing</option>
          <option value="operations">Operations</option>
          <option value="support">Support</option>
          <option value="custom">Custom</option>
        </select>
        <select className="w-full bg-gray-800 text-white p-2 rounded mb-2" value={agentForm.model} onChange={e => setAgentForm({...agentForm, model: e.target.value})}>
          <option value="claude-sonnet">Claude Sonnet</option>
          <option value="claude-opus">Claude Opus</option>
          <option value="gpt-4">GPT-4</option>
          <option value="custom">Custom</option>
        </select>
        <select className="w-full bg-gray-800 text-white p-2 rounded mb-2" value={agentForm.assigned_product_id} onChange={e => setAgentForm({...agentForm, assigned_product_id: e.target.value})}>
          <option value="">No Product</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Avatar (emoji)" value={agentForm.avatar} onChange={e => setAgentForm({...agentForm, avatar: e.target.value})} />
        <textarea className="w-full bg-gray-800 text-white p-2 rounded" placeholder="Description" value={agentForm.description} onChange={e => setAgentForm({...agentForm, description: e.target.value})} />
      </Modal>
      <Modal isOpen={subAgentModal.open} onClose={() => setSubAgentModal({ open: false, data: null, agentId: null })} title={subAgentModal.data ? 'Edit Sub-Agent' : 'New Sub-Agent'} onSave={saveSubAgent} saving={saving}>
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Name *" value={subAgentForm.name} onChange={e => setSubAgentForm({...subAgentForm, name: e.target.value})} />
        <select className="w-full bg-gray-800 text-white p-2 rounded mb-2" value={subAgentForm.specialty} onChange={e => setSubAgentForm({...subAgentForm, specialty: e.target.value})}>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="testing">Testing</option>
          <option value="docs">Docs</option>
          <option value="outreach">Outreach</option>
          <option value="analytics">Analytics</option>
          <option value="design">Design</option>
          <option value="custom">Custom</option>
        </select>
        <select className="w-full bg-gray-800 text-white p-2 rounded mb-2" value={subAgentForm.model || 'MiniMax-M2.5'} onChange={e => setSubAgentForm({...subAgentForm, model: e.target.value})}>
          <option value="MiniMax-M2.5">MiniMax-M2.5</option>
          <option value="MiniMax-M2.1">MiniMax-M2.1</option>
          <option value="MiniMax-M2">MiniMax-M2</option>
          <option value="M2-her">M2-her</option>
        </select>
        <input className="w-full bg-gray-800 text-white p-2 rounded mb-2" placeholder="Avatar (emoji)" value={subAgentForm.avatar} onChange={e => setSubAgentForm({...subAgentForm, avatar: e.target.value})} />
        <textarea className="w-full bg-gray-800 text-white p-2 rounded" placeholder="Description" value={subAgentForm.description} onChange={e => setSubAgentForm({...subAgentForm, description: e.target.value})} />
      </Modal>
      
      {/* Settings Modal */}
      <Modal isOpen={settingsModal.open} onClose={() => setSettingsModal({ open: false })} title="⚙️ API Settings" onSave={saveSettings} saving={saving}>
        <div className="mb-3">
          <label className="text-gray-400 text-xs mb-1 block">MiniMax API Key</label>
          <input type="password" className="w-full bg-gray-800 text-white p-2 rounded" placeholder="sk-..." value={miniMaxKey} onChange={e => setMiniMaxKey(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="text-gray-400 text-xs mb-1 block">Default Model</label>
          <select className="w-full bg-gray-800 text-white p-2 rounded" value={defaultModel} onChange={e => setDefaultModel(e.target.value)}>
            <option value="MiniMax-M2.5">MiniMax-M2.5 (Best for coding)</option>
            <option value="MiniMax-M2.1">MiniMax-M2.1 (Reasoning)</option>
            <option value="MiniMax-M2">MiniMax-M2 (Fast)</option>
            <option value="M2-her">M2-her (Conversational)</option>
          </select>
        </div>
        <button onClick={testMiniMaxAPI} className="w-full px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded text-sm">🔌 Test API Connection</button>
        {localStorage.getItem('nerve_minimax_key') ? (
          <div className="mt-2 text-green-400 text-xs">✅ API key configured</div>
        ) : (
          <div className="mt-2 text-red-400 text-xs">⚠️ No API key set</div>
        )}
      </Modal>
      
      {/* Task Output Modal */}
      <Modal isOpen={outputModal.open} onClose={() => setOutputModal({ open: false, title: '', output: '', agent: '', time: '' })} title="📄 Task Output" onSave={() => setOutputModal({ open: false, title: '', output: '', agent: '', time: '' })} saving={false}>
        <div className="mb-2 text-sm text-gray-400">Agent: {outputModal.agent} • {outputModal.time}</div>
        <div className="text-white text-sm mb-2">{outputModal.title}</div>
        <div className="bg-gray-800 p-3 rounded max-h-80 overflow-y-auto text-white text-sm whitespace-pre-wrap">{outputModal.output}</div>
        <button onClick={() => navigator.clipboard.writeText(outputModal.output)} className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">📋 Copy to Clipboard</button>
      </Modal>
    </div>
  );
}