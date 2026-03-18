'use client';
import { useState, useEffect } from 'react';
import { supabase, formatINR, logActivity, statusColors } from './lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StatusBadge({ status, type }) {
  const colors = statusColors[type]?.[status] || 'bg-gray-700';
  return <span className={`px-2 py-0.5 rounded text-xs ${colors}`}>{status?.replace('_', ' ')}</span>;
}

function Modal({ isOpen, onClose, title, children, onSave, saving }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-white text-lg mb-4">{title}</h3>
        {children}
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-1 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
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
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: () => {} });
  const [productModal, setProductModal] = useState({ open: false, data: null });
  const [taskModal, setTaskModal] = useState({ open: false, data: null });
  const [clientModal, setClientModal] = useState({ open: false, data: null });
  const [revenueModal, setRevenueModal] = useState({ open: false, data: null });
  const [saving, setSaving] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '', status: 'idea', stage: 'mvp', revenue_model: 'subscription', monthly_price: '' });
  const [taskForm, setTaskForm] = useState({ title: '', status: 'todo', priority: 'medium', due_date: '', notes: '' });
  const [clientForm, setClientForm] = useState({ name: '', email: '', phone: '', status: 'lead', product_id: '', deal_value: '', notes: '' });
  const [revenueForm, setRevenueForm] = useState({ client_id: '', product_id: '', amount: '', type: 'subscription', date: new Date().toISOString().split('T')[0], notes: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, t, c, r, a] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('revenue').select('*').order('date', { ascending: false }).limit(50),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(30)
      ]);
      setProducts(p.data || []); setTasks(t.data || []); setClients(c.data || []); setRevenue(r.data || []); setActivity(a.data || []);
    } catch (e) { showToast(e.message, 'error'); }
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);
  const showToast = (message, type = 'success') => setToast({ message, type });

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

  const productTasks = selectedProduct ? tasks.filter(t => t.product_id === selectedProduct.id) : [];
  if (loading) return <div className="min-h-screen bg-gray-950 text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmDialog isOpen={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} })} onConfirm={confirmDialog.onConfirm} title={confirmDialog.title} message={confirmDialog.message} />
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-xl font-bold text-white">NERVE</h1>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center"><div className="text-2xl font-bold text-white">{products.length}</div><div className="text-xs text-gray-400">Products</div></div>
            <div className="text-center"><div className="text-lg"><span className="text-yellow-400">{todoTasks}</span> / <span className="text-blue-400">{inProgressTasks}</span> / <span className="text-green-400">{doneTasks}</span></div><div className="text-xs text-gray-400">Tasks</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-yellow-400">{formatINR(pipelineValue)}</div><div className="text-xs text-gray-400">Pipeline</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-green-400">{formatINR(monthRevenue)}</div><div className="text-xs text-gray-400">This Month</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-blue-400">{activeClients}</div><div className="text-xs text-gray-400">Active</div></div>
            <button onClick={fetchAll} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm">↻</button>
          </div>
        </div>
      </div>
      <div className="flex border-b border-gray-800 bg-gray-900">
        {['products', 'clients', 'revenue', 'activity'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-medium capitalize ${activeTab === tab ? 'text-white border-b-2 border-green-500 bg-gray-800' : 'text-gray-400 hover:text-white'}`}>{tab}</button>))}
      </div>
      <div className="p-4">
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center"><h2 className="font-bold text-white">Products</h2><button onClick={() => openProductModal()} className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm">+ Add</button></div>
              {products.length === 0 ? <div className="text-gray-500 text-sm">No products yet</div> : products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className={`p-3 rounded cursor-pointer border ${selectedProduct?.id === p.id ? 'border-green-500 bg-gray-800' : 'border-gray-800 hover:border-gray-700'}`}>
                  <div className="flex justify-between items-start"><div className="font-medium text-white">{p.name}</div><div className="flex gap-1"><button onClick={(e) => { e.stopPropagation(); openProductModal(p); }} className="text-gray-400 hover:text-white">✏️</button><button onClick={(e) => { e.stopPropagation(); deleteProduct(p); }} className="text-gray-400 hover:text-red-400">🗑️</button></div></div>
                  <div className="flex gap-2 mt-2"><StatusBadge status={p.status} type="product" /><StatusBadge status={p.stage} type="stage" /></div>
                  <div className="text-xs text-gray-400 mt-2">{tasks.filter(t => t.product_id === p.id).length} tasks</div>
                </div>))}
            </div>
            <div className="lg:col-span-2">
              {selectedProduct ? (<div><div className="flex justify-between items-center mb-4"><h2 className="font-bold text-white">{selectedProduct.name} — Tasks</h2><button onClick={() => openTaskModal()} className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm">+ Add Task</button></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['todo', 'in_progress', 'done', 'blocked'].map(status => (<div key={status} className="bg-gray-900 p-3 rounded"><div className="text-xs text-gray-400 uppercase mb-2">{status.replace('_', ' ')}</div>
                    {productTasks.filter(t => t.status === status).map(t => (<div key={t.id} className="p-2 bg-gray-800 rounded mb-2 text-sm"><div className="text-white">{t.title}</div><div className="flex gap-1 mt-1 items-center"><StatusBadge status={t.priority} type="priority" /><button onClick={() => openTaskModal(t)} className="text-gray-400 hover:text-white text-xs">✏️</button><select value={t.status} onChange={(e) => updateTaskStatus(t.id, e.target.value)} className="text-xs bg-gray-700 rounded px-1 ml-auto">{['todo', 'in_progress', 'done', 'blocked'].map(s => <option key={s} value={s}>{s}</option>)}</select><button onClick={() => deleteTask(t)} className="text-red-400 text-xs">×</button></div></div>))}
                  </div>))}
                </div></div>) : <div className="text-gray-500">Select a product to see tasks</div>}
            </div></div>)}
        {activeTab === 'clients' && (<div><div className="flex justify-between items-center mb-4"><h2 className="font-bold text-white">Clients & Leads</h2><button onClick={() => openClientModal()} className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm">+ Add Client</button></div>
          <div className="grid grid-cols-4 gap-4 mb-4"><div className="bg-gray-900 p-3 rounded"><div className="text-xl font-bold text-gray-400">{leads.length}</div><div className="text-xs text-gray-400">Leads — {formatINR(leadValue)}</div></div><div className="bg-gray-900 p-3 rounded"><div className="text-xl font-bold text-yellow-400">{prospects.length}</div><div className="text-xs text-gray-400">Prospects — {formatINR(prospectValue)}</div></div><div className="bg-gray-900 p-3 rounded"><div className="text-xl font-bold text-green-400">{active.length}</div><div className="text-xs text-gray-400">Active — {formatINR(activeValue)}</div></div><div className="bg-gray-900 p-3 rounded"><div className="text-xl font-bold text-red-400">{churned.length}</div><div className="text-xs text-gray-400">Churned</div></div></div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-900"><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Phone</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Product</th><th className="p-2 text-right">Deal Value</th><th className="p-2"></th></tr></thead><tbody>
            {clients.map(c => (<tr key={c.id} className="border-t border-gray-800"><td className="p-2 text-white">{c.name}</td><td className="p-2 text-gray-400">{c.email || '—'}</td><td className="p-2 text-gray-400">{c.phone || '—'}</td><td className="p-2"><select value={c.status} onChange={(e) => updateClientStatus(c.id, e.target.value)} className="bg-gray-800 rounded px-2 py-1 text-xs">{['lead', 'prospect', 'active_client', 'churned'].map(s => <option key={s} value={s}>{s}</option>)}</select></td><td className="p-2 text-gray-400">{products.find(p => p.id === c.product_id)?.name || '—'}</td><td className="p-2 text-right text-white font-mono">{c.deal_value ? formatINR(c.deal_value) : '—'}</td><td className="p-2"><button onClick={() => openClientModal(c)} className="text-gray-400 hover:text-white mr-2">✏️</button><button onClick={() => deleteClient(c)} className="text-gray-400 hover:text-red-400">🗑️</button></td></tr>))}
            {clients.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-gray-500">No clients yet</td></tr>}</tbody></table></div></div>)}
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
    </div>
  );
}