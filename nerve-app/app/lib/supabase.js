import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bazaehguvkjicjjxgluq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhemFlaGd1dmtqaWNqanhnbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4Mjk2NzgsImV4cCI6MjA4OTQwNTY3OH0.oHj6tJ8AtRUHMKvaFf8SbAadKwtXh8_iLmqKw0ZDIIo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

export const timeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const logActivity = async (action, entityType, entityId) => {
  await supabase.from('activity_log').insert([{ action, entity_type: entityType, entity_id: entityId }]);
};

export const statusColors = {
  product: {
    idea: 'bg-yellow-900 text-yellow-200',
    in_development: 'bg-blue-900 text-blue-200',
    live: 'bg-green-900 text-green-200',
    paused: 'bg-gray-700 text-gray-300',
  },
  task: {
    todo: 'bg-gray-700 text-gray-200',
    in_progress: 'bg-blue-700 text-blue-200',
    done: 'bg-green-700 text-green-200',
    blocked: 'bg-red-700 text-red-200',
  },
  client: {
    lead: 'bg-gray-600 text-gray-200',
    prospect: 'bg-yellow-600 text-yellow-100',
    active_client: 'bg-green-600 text-green-100',
    churned: 'bg-red-900 text-red-300',
  },
  priority: {
    low: 'bg-gray-600 text-gray-200',
    medium: 'bg-blue-800 text-blue-200',
    high: 'bg-orange-700 text-orange-200',
    urgent: 'bg-red-800 text-red-200',
  },
  stage: {
    mvp: 'bg-purple-800 text-purple-200',
    beta: 'bg-cyan-800 text-cyan-200',
    v1: 'bg-indigo-800 text-indigo-200',
    growth: 'bg-teal-800 text-teal-200',
  }
};
