module.exports = {
  apps: [
    {
      name: 'command-centre',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      cwd: '/home/deva/.openclaw/workspace/command-centre',
      env: {
        NODE_ENV: 'production'
      },
      restart_delay: 5000,
      max_restarts: 10,
      watch: false
    },
    {
      name: 'agents',
      script: 'start-agents.js',
      cwd: '/home/deva/.openclaw/workspace/command-centre',
      restart_delay: 5000,
      max_restarts: 50,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NEXT_PUBLIC_SUPABASE_URL: 'https://iglfjgsqqknionzmmprj.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGZqZ3NxcWtuaW9uem1tcHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjI1NjIsImV4cCI6MjA4ODE5ODU2Mn0.y6rfeWhG-ExBCiQarPXgvLqaDv6NBaA4MB9FbSbB_3w',
        SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGZqZ3NxcWtuaW9uem1tcHJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYyMjU2MiwiZXhwIjoyMDg4MTk4NTYyfQ.PnJsNMApnfKxGNE_bIiWapEpinVp1xkIXlORGV7pf7A',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3001',
        MINIMAX_API_KEY: 'sk-cp-NqFRRQNA-1x-d-EC_gcbmQqXhsDvAyEymDw3J6-rKbrVqCd1k7Y4fa3r7jD7uCC2fA0Jy8gP0g9t5MohWx0RaLJkpGwEi9pToK-9A8Qo7YMHt_7yw2AlDjg',
        MINIMAX_GROUP_ID: '2024071113721524967',
        TAVILY_API_KEY: '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',
        PPVENTURES_PATH: '/home/deva/ppventures-next'
      }
    }
  ]
};
