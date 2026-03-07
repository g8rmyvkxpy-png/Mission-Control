# AI Agent Command Centre

A full-stack AI Agent management dashboard with Supabase backend and Next.js frontend.

## Quick Start

### 1. Set up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor
3. Copy and paste the contents of `SUPABASE_SCHEMA.sql`
4. Run the SQL to create all tables
5. Get your Supabase URL and keys from Settings → API

### 2. Configure Environment

```bash
# Copy the template
cp .env.local.example .env.local

# Edit with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start the dev server on port 3001
npm run dev
```

The Command Centre will be available at **http://localhost:3001**

## Running Both Apps Simultaneously

### Option 1: Terminal Background

```bash
# Terminal 1 - Main App (port 3000)
cd /path/to/main-app
npm run dev

# Terminal 2 - Command Centre (port 3001)
cd command-centre
npm run dev
```

### Option 2: Use concurrently

```bash
# In your main app directory
npm install concurrently --save-dev

# Update main app package.json:
# "dev": "concurrently \"next dev\" \"cd ../command-centre && npm run dev\""
```

### Option 3: PM2 Process Manager

```bash
# Install PM2
npm install pm2 -g

# Start both apps
pm2 start "npm run dev" --name main-app
pm2 start "cd command-centre && npm run dev" --name command-centre
```

## Adding Agents

### Via Dashboard (Coming Soon)
Manual agent creation through the UI.

### Via Supabase Console

```sql
INSERT INTO agents (name, avatar_color, api_key) VALUES 
  ('Neo', '#10b981', 'agent_neo_sk_123'),
  ('Atlas', '#3b82f6', 'agent_atlas_sk_456');
```

### Via API

Agents are auto-created when they first send a heartbeat.

## Agent Integration

Import the agent client into any OpenClaw agent:

```javascript
import { initAgent, log, getTasks, updateTaskStatus } from './agentClient';

// Initialize at startup
initAgent({
  name: 'MyAgent',
  apiKey: 'agent_myagent_sk_xxx',
  color: '#10b981',
  onTask: async (task) => {
    log(`Processing: ${task.title}`, 'task');
    // Do work...
    await updateTaskStatus(task.id, 'in-progress');
    // Complete work...
    await updateTaskStatus(task.id, 'review');
    log('Task completed', 'task');
  }
});

// Or manually poll
const tasks = await getTasks('backlog');
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/heartbeat` | POST | Agent heartbeat |
| `/api/tasks` | GET | List tasks |
| `/api/tasks` | POST | Create task |
| `/api/tasks/:id` | PATCH | Update task |
| `/api/logs` | POST | Log activity |
| `/api/crons` | GET | List cron jobs |
| `/api/crons` | POST | Create cron job |
| `/api/crons/:id` | PATCH | Toggle cron |
| `/api/trigger` | POST | Trigger task |

## Features

- **Real-time Updates** - Supabase Realtime powers live activity feed
- **Kanban Task Board** - Drag & drop task management
- **Cron Scheduling** - Schedule recurring tasks for agents
- **Agent Monitoring** - Heartbeat tracking, online/offline status
- **Dark Terminal UI** - Clean, hacker-style interface

## Project Structure

```
command-centre/
├── app/
│   ├── api/           # API routes
│   │   ├── heartbeat/
│   │   ├── tasks/
│   │   ├── logs/
│   │   ├── crons/
│   │   └── trigger/
│   ├── dashboard/     # Main dashboard pages
│   │   ├── overview/
│   │   ├── board/
│   │   └── calendar/
│   └── globals.css
├── components/        # React components
├── lib/
│   ├── supabaseClient.js
│   └── agentClient.js  # Agent integration
├── SUPABASE_SCHEMA.sql
└── package.json
```

## Tech Stack

- **Frontend:** Next.js 14, React
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime
- **Styling:** Custom CSS (dark terminal theme)

---

## 📲 Mobile App (PWA Installation)

### Access on iPhone

1. Open **Safari** on your iPhone
2. Navigate to: `http://YOUR-SERVER-IP:3001`
   - Replace `YOUR-SERVER-IP` with your computer's local IP address
3. Tap the **Share** button (square with arrow)
4. Scroll down and tap **"Add to Home Screen"**
5. The app will appear on your home screen as "CC"

### Access on Android

1. Open **Chrome** on your Android device
2. Navigate to: `http://YOUR-SERVER-IP:3001`
   - Replace `YOUR-SERVER-IP` with your computer's local IP address
3. Tap the **three dots** menu (top right)
4. Tap **"Add to Home Screen"** or **"Install App"**
5. The app will be installed and appear in your app drawer

### Finding Your Server IP Address

#### On Mac:
```bash
# Open Terminal and run:
ipconfig getifaddr en0
```

#### On Windows:
```bash
# Open Command Prompt and run:
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

#### On Linux:
```bash
# Open Terminal and run:
hostname -I
```

### Setting Up Local Network Access

For your phone to access the server:

1. Make sure your phone is on the **same WiFi network** as the computer running the server
2. Find your computer's local IP address (see above)
3. Use `http://192.168.x.x:3001` (replace with your IP)

### PWA Features

- **Offline Support:** App works even without internet (basic caching)
- **Installable:** Add to home screen like a native app
- **Push Notifications:** Get notified when agents complete tasks
- **Mobile-Optimized:** Bottom tab navigation, swipe gestures

### First-Time Push Notification Permission

On first visit, you'll be asked to enable push notifications. Tap **Allow** to receive:
- Task completion alerts
- Agent offline warnings
- Review requests
