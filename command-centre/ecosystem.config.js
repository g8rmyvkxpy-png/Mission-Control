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
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
