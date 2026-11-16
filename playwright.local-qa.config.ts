import config from './playwright.config';

const apiUrl = 'http://127.0.0.1:8004';
const frontendUrl = 'http://127.0.0.1:5176';
export default {
  ...config,
  use: { ...config.use, baseURL: frontendUrl },
  webServer: [
    {
      command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5176 --strictPort',
      url: frontendUrl,
      env: { API_PROXY_TARGET: apiUrl },
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/serve-local.ps1 -Port 8004',
      cwd: '../comsig-v2',
      stderr: 'ignore',
      url: apiUrl + '/api/v1/health',
      env: {
        CACHE_STORE: 'array',
        COMSIG_LOGIN_IP_LIMIT: '100',
        COMSIG_LOGIN_ACCOUNT_LIMIT: '30',
        COMSIG_SECURITY_IP_LIMIT: '100',
        COMSIG_SECURITY_ACCOUNT_LIMIT: '30',
        FRONTEND_URL: frontendUrl,
        COMSIG_SECURITY_MAILER: 'local_private',
        ...(process.env.P02C_QA_OUTBOX ? { COMSIG_MAIL_OUTBOX: process.env.P02C_QA_OUTBOX } : {}),
        ...(process.env.P02B_QA_STORAGE ? { ATTACHMENTS_ROOT: process.env.P02B_QA_STORAGE } : {}),
        ...(process.env.P02_QA_DATABASE
          ? {
              DB_CONNECTION: 'sqlite',
              DB_DATABASE: process.env.P02_QA_DATABASE,
            }
          : {}),
      },
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
};
