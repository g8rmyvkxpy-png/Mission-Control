'use client';

import { useState, useEffect } from 'react';
import TaskBoard from './components/TaskBoard';
import Calendar from './components/Calendar';
import Memory from './components/Memory';
import Team from './components/Team';
import Office from './components/Office';

// Get time of day for background/animations
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
};

// Get time-based emoji (sun/moon/stars)
const getTimeEmoji = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '🌅';  // Morning - sunrise
  if (hour >= 12 && hour < 17) return '☀️';   // Afternoon - sun
  if (hour >= 17 && hour < 20) return '🌇';  // Evening - sunset
  return '🌙';                                 // Night - moon
};

// Get night sky emoji
const getNightEmoji = (): string => {
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 5) return Math.random() > 0.5 ? '⭐' : '✨';
  return '';
};

const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 20) return 'Good Evening';
  return 'Good Night';
};

// Weather code to static icon mapping (WMO codes) - clean static display
const getWeatherIcon = (code: number): string => {
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌧️';
  if (code >= 56 && code <= 57) return '🌧️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 66 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '🌨️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌡️';
};

const getWeatherDesc = (code: number): string => {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 56 && code <= 57) return 'Freezing Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 66 && code <= 67) return 'Freezing Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Unknown';
};

interface Theme {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
}

const darkTheme: Theme = {
  background: '#0a0a0b',
  surface: '#111113',
  border: '#27272a',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
  accent: '#f97316',
  accentHover: '#ea580c',
};

const lightTheme: Theme = {
  background: '#fafafa',
  surface: '#ffffff',
  border: '#e4e4e7',
  text: '#18181b',
  textSecondary: '#71717a',
  accent: '#f97316',
  accentHover: '#ea580c',
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState('team');

  // Save and restore active tab from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('mc_active_tab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem('mc_active_tab', tabId);
  };
  const [weather, setWeather] = useState<any>(null);
  const [weatherUpdated, setWeatherUpdated] = useState<string>('');
  const [location, setLocation] = useState<{name: string, lat: number, lng: number}>({ name: 'Bengaluru', lat: 12.97, lng: 77.59 });
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Restore login state from localStorage
    const savedLogin = localStorage.getItem('mc_logged_in');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    if (isLoggedIn) {
      fetchWeather();
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchWeather = async () => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia/Kolkata`);
      const data = await res.json();
      setWeather(data);
      setWeatherUpdated(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Weather fetch error:', e);
    }
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=city&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '[GOOGLE_API_KEY]'}`);
      const data = await res.json();
      if (data.predictions) {
        setSearchResults(data.predictions.slice(0, 5));
      }
    } catch (e) {
      console.error('Location search error:', e);
    }
  };

  const selectLocation = async (placeId: string, description: string) => {
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '[GOOGLE_API_KEY]'}`);
      const data = await res.json();
      if (data.result?.geometry?.location) {
        setLocation({
          name: description,
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng
        });
        setShowLocationSearch(false);
        setSearchResults([]);
        setLocationSearch('');
        // Fetch weather for new location
        setTimeout(fetchWeather, 100);
      }
    } catch (e) {
      console.error('Error getting location details:', e);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setTasks(data.tasks || []);
      setActivities(data.activities || []);
      setProjects(data.projects || []);
      setContent(data.content || []);
    } catch (e) {
      console.error('Data fetch error:', e);
    }
  };

  const handleLogin = () => {
    if (username === 'Deva' && password === 'Neo123') {
      setIsLoggedIn(true);
      localStorage.setItem('mc_logged_in', 'true');
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  if (!mounted) {
    return null;
  }

  if (!isLoggedIn) {
    const loginTheme = darkTheme;
    return (
      <div style={{
        minHeight: '100vh',
        background: loginTheme.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          background: loginTheme.surface,
          border: `1px solid ${loginTheme.border}`,
          borderRadius: '16px',
          padding: '48px',
          width: '100%',
          maxWidth: '400px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img src="/logo.svg" alt="MC" style={{ width: '64px', height: '64px', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: loginTheme.text }}>Mission Control</h1>
            <p style={{ color: loginTheme.textSecondary, fontSize: '14px' }}>Sign in to access</p>
          </div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              background: loginTheme.background,
              border: `1px solid ${loginTheme.border}`,
              borderRadius: '8px',
              color: loginTheme.text,
              fontSize: '14px',
              marginBottom: '12px',
              outline: 'none',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '14px',
              background: loginTheme.background,
              border: `1px solid ${loginTheme.border}`,
              borderRadius: '8px',
              color: loginTheme.text,
              fontSize: '14px',
              marginBottom: '12px',
              outline: 'none',
            }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '14px',
              background: loginTheme.accent,
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >Sign In</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'memory', label: '🧠 Memory', icon: '🧠' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'office', label: 'Office', icon: '🏢' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        // Filter tasks needing attention (only show failed automated tasks or overdue items)
        const needAttention = tasks.filter((t: any) => 
          (t.isAutomated && t.status === 'failed') || 
          (!t.isAutomated && t.priority === 'high' && t.status === 'todo')
        );
        
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: currentTheme.text }}>Dashboard</h2>
            
            {/* Need Attention Section */}
            {needAttention.length > 0 && (
              <div style={{ 
                background: '#ff4d4d20', 
                border: '1px solid #ff4d4d', 
                borderRadius: '12px', 
                padding: '20px', 
                marginBottom: '24px' 
              }}>
                <h3 style={{ color: '#ff4d4d', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  ⚠️ Need Attention ({needAttention.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {needAttention.map((task: any) => (
                    <div 
                      key={task.id} 
                      onClick={() => handleTabChange('tasks')}
                      style={{ 
                        padding: '12px', 
                        background: currentTheme.background, 
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <p style={{ color: currentTheme.text, fontSize: '14px', fontWeight: '500' }}>{task.title}</p>
                      <p style={{ color: currentTheme.textSecondary, fontSize: '12px' }}>{task.description?.split('\n')[0]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Today's Tasks Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 
                  onClick={() => handleTabChange('tasks')}
                  style={{ color: currentTheme.text, fontSize: '18px', fontWeight: '600', cursor: 'pointer' }}
                >
                  📋 Today's Tasks
                </h3>
                <span style={{ color: currentTheme.textSecondary, fontSize: '12px' }}>Click to view all →</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {tasks.length > 0 ? tasks.slice(0, 4).map((task: any) => (
                  <div 
                    key={task.id} 
                    style={{ 
                      padding: '16px', 
                      background: currentTheme.surface, 
                      border: `1px solid ${currentTheme.border}`, 
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleTabChange('tasks')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <p style={{ color: currentTheme.text, fontSize: '14px', fontWeight: '500' }}>{task.title}</p>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '10px',
                        background: task.status === 'done' ? '#22c55e20' : task.status === 'in_progress' ? '#f59e0b20' : task.status === 'failed' ? '#ef444420' : task.isAutomated ? '#8b5cf620' : '#3b82f620',
                        color: task.status === 'done' ? '#22c55e' : task.status === 'in_progress' ? '#f59e0b' : task.status === 'failed' ? '#ef4444' : task.isAutomated ? '#8b5cf6' : '#3b82f6',
                      }}>
                        {task.status === 'done' ? '✅ Done' : task.status === 'in_progress' ? '🔄 In Progress' : task.status === 'failed' ? '❌ Failed' : task.isAutomated ? '🤖 Scheduled' : '📋 To Do'}
                      </span>
                    </div>
                    <p style={{ color: currentTheme.textSecondary, fontSize: '12px' }}>{task.description?.split('\n')[0]}</p>
                  </div>
                )) : (
                  <p style={{ color: currentTheme.textSecondary, gridColumn: '1/-1' }}>No tasks for today</p>
                )}
              </div>
            </div>
            
            {/* Tasks and Activities Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Tasks List */}
              <div 
                onClick={() => handleTabChange('tasks')}
                style={{ 
                  background: currentTheme.surface, 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '12px', 
                  padding: '20px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ color: currentTheme.textSecondary, fontSize: '14px' }}>✅ All Tasks</p>
                  <span style={{ color: currentTheme.accent, fontSize: '12px' }}>View all →</span>
                </div>
                {tasks.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {tasks.map((task: any) => (
                      <div key={task.id} style={{ padding: '10px', background: currentTheme.background, borderRadius: '6px' }}>
                        <p style={{ color: currentTheme.text, fontSize: '13px', fontWeight: '500' }}>{task.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: currentTheme.textSecondary, fontSize: '13px' }}>No tasks</p>
                )}
              </div>
              {/* Activities List */}
              <div 
                onClick={() => handleTabChange('memory')}
                style={{ 
                  background: currentTheme.surface, 
                  border: `1px solid ${currentTheme.border}`, 
                  borderRadius: '12px', 
                  padding: '20px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ color: currentTheme.textSecondary, fontSize: '14px' }}>📝 Recent Activities</p>
                  <span style={{ color: currentTheme.accent, fontSize: '12px' }}>View all →</span>
                </div>
                {activities.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {activities.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} style={{ padding: '10px', background: currentTheme.background, borderRadius: '6px' }}>
                        <p style={{ color: currentTheme.text, fontSize: '13px', fontWeight: '500' }}>{activity.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: currentTheme.textSecondary, fontSize: '13px' }}>No activities</p>
                )}
              </div>
            </div>
          </div>
        );
      case 'tasks':
        return <TaskBoard theme={currentTheme} />;
      case 'calendar':
        return <Calendar theme={currentTheme} />;
      case 'memory':
        return <Memory theme={currentTheme} />;
      case 'team':
        return <Team theme={currentTheme} />;
      case 'projects':
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: currentTheme.text }}>Projects</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {projects.length > 0 ? (
                projects.map((project: any) => (
                  <div 
                    key={project.id} 
                    style={{ 
                      background: currentTheme.surface, 
                      border: `1px solid ${currentTheme.border}`, 
                      borderRadius: '12px', 
                      padding: '20px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      minHeight: '140px',
                    }}
                    onClick={() => project.url && window.open(project.url, '_blank')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
                      e.currentTarget.style.borderColor = currentTheme.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = currentTheme.border;
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: currentTheme.text, margin: 0 }}>{project.name}</h3>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px',
                        background: project.status === 'active' ? '#22c55e20' : '#f9731620',
                        color: project.status === 'active' ? '#22c55e' : '#f97316',
                      }}>
                        {project.status}
                      </span>
                    </div>
                    <p style={{ color: currentTheme.textSecondary, fontSize: '14px', marginBottom: '8px' }}>{project.description}</p>
                    {project.tech && (
                      <p style={{ color: currentTheme.accent, fontSize: '12px', marginBottom: '8px' }}>🛠️ {project.tech}</p>
                    )}
                    {project.details && (
                      <p style={{ color: currentTheme.textSecondary, fontSize: '13px', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${currentTheme.border}` }}>
                        📋 {project.details}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                      {project.url && (
                        <p style={{ color: currentTheme.accent, fontSize: '12px' }}>🔗 Open →</p>
                      )}
                      <p style={{ color: currentTheme.textSecondary, fontSize: '11px' }}>{project.lastUpdated}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: currentTheme.textSecondary }}>No projects</p>
              )}
            </div>
          </div>
        );
      case 'content':
        const stages = ['idea', 'drafting', 'review', 'scheduled', 'published'];
        const stageLabels: Record<string, string> = {
          idea: '💡 Ideas',
          drafting: '✍️ Drafting',
          review: '👀 Review',
          scheduled: '📅 Scheduled',
          published: '✅ Published'
        };
        const platformIcons: Record<string, string> = {
          twitter: '𝕏',
          linkedin: '💼',
          x: '𝕏'
        };
        return (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: currentTheme.text }}>Content Pipeline</h2>
              <button
                style={{
                  padding: '8px 16px',
                  background: currentTheme.accent,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                + New Content
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px' }}>
              {stages.map((stage) => (
                <div
                  key={stage}
                  style={{
                    minWidth: '220px',
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: currentTheme.text, marginBottom: '12px' }}>
                    {stageLabels[stage]}
                    <span style={{ color: currentTheme.textSecondary, fontWeight: '400', marginLeft: '8px' }}>
                      {content.filter((c: any) => c.stage === stage).length}
                    </span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {content.filter((c: any) => c.stage === stage).map((item: any) => (
                      <div
                        key={item.id}
                        style={{
                          background: currentTheme.background,
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <p style={{ fontSize: '13px', fontWeight: '500', color: currentTheme.text, marginBottom: '4px' }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: '11px', color: currentTheme.textSecondary, marginBottom: '8px' }}>
                          {item.description}
                        </p>
                        {item.platform && (
                          <span style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px', 
                            background: currentTheme.border, 
                            borderRadius: '4px',
                            color: currentTheme.textSecondary 
                          }}>
                            {platformIcons[item.platform] || ''} {item.platform}
                          </span>
                        )}
                        {item.scheduledAt && (
                          <p style={{ fontSize: '10px', color: currentTheme.accent, marginTop: '4px' }}>
                            📅 {new Date(item.scheduledAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', padding: '16px', background: currentTheme.surface, borderRadius: '12px', border: `1px solid ${currentTheme.border}` }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: currentTheme.text, marginBottom: '12px' }}>🔗 Social Media Integration</h3>
              <p style={{ fontSize: '12px', color: currentTheme.textSecondary, marginBottom: '8px' }}>
                To enable automatic posting to X and LinkedIn, add API credentials:
              </p>
              <ul style={{ fontSize: '12px', color: currentTheme.textSecondary, paddingLeft: '20px' }}>
                <li>X (Twitter): API Key, API Secret, Access Token, Access Token Secret</li>
                <li>LinkedIn: Access Token</li>
              </ul>
              <p style={{ fontSize: '11px', color: currentTheme.accent, marginTop: '8px' }}>
                Update TOOLS.md with API keys to enable posting.
              </p>
            </div>
          </div>
        );
      case 'office':
        return <Office theme={currentTheme} />;
      default:
        return (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: currentTheme.text }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p style={{ color: currentTheme.textSecondary }}>Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: currentTheme.background, transition: 'background 0.3s' }}>
      {/* Sidebar */}
      <div style={{
        width: '240px',
        background: currentTheme.surface,
        borderRight: `1px solid ${currentTheme.border}`,
        padding: '16px 0',
      }}>
        <div style={{ padding: '0 16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.svg" alt="MC" style={{ width: '40px', height: '40px' }} />
          <span style={{ fontSize: '18px', fontWeight: '700', color: currentTheme.text }}>Mission Control</span>
        </div>
        <nav>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: activeTab === tab.id ? `${currentTheme.accent}20` : 'transparent',
                border: 'none',
                borderLeft: activeTab === tab.id ? `3px solid ${currentTheme.accent}` : '3px solid transparent',
                color: activeTab === tab.id ? currentTheme.accent : currentTheme.textSecondary,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <header style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${currentTheme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: currentTheme.text }}>
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {weather && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                padding: '6px 10px',
                background: currentTheme.surface,
                borderRadius: '8px',
                border: `1px solid ${currentTheme.border}`,
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={fetchWeather}
              onMouseEnter={() => setShowLocationSearch(true)}
              title="Click to refresh, hover for location"
            >
              <span style={{ fontSize: '18px' }}>{getWeatherIcon(weather.current?.weather_code)}</span>
              <span style={{ color: currentTheme.text, fontSize: '14px', fontWeight: '600' }}>
                {Math.round(weather.current?.temperature_2m)}°
              </span>
              <span style={{ color: currentTheme.textSecondary, fontSize: '10px' }}>
                {location.name}
              </span>
              {showLocationSearch && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '250px',
                    background: currentTheme.surface,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    padding: '12px',
                    zIndex: 1000,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                  onMouseLeave={() => setShowLocationSearch(false)}
                >
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      searchLocations(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${currentTheme.border}`,
                      background: currentTheme.background,
                      color: currentTheme.text,
                      fontSize: '14px',
                      outline: 'none',
                      marginBottom: '8px',
                    }}
                  />
                  {searchResults.map((result) => (
                    <div
                      key={result.place_id}
                      onClick={() => selectLocation(result.place_id, result.description)}
                      style={{
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: currentTheme.text,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = currentTheme.border}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {result.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: `1px solid ${currentTheme.border}`,
                background: currentTheme.surface,
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >{theme === 'dark' ? '☀️' : '🌙'}</button>
            <span style={{ color: currentTheme.textSecondary, fontSize: '14px' }}>{username}</span>
            <button
              onClick={() => { setIsLoggedIn(false); localStorage.removeItem('mc_logged_in'); }}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                color: currentTheme.textSecondary,
                cursor: 'pointer',
              }}
            >Logout</button>
          </div>
        </header>
        {renderContent()}
      </div>
    </div>
  );
}
