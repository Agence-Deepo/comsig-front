import { defineConfig, devices } from '@playwright/test';

const production = process.env.E2E_PREVIEW === '1';
const frontendPort = process.env.E2E_FRONTEND_PORT || (production ? '4199' : '5199');
const frontendUrl = `http://127.0.0.1:${frontendPort}`;
const backendPort = process.env.E2E_API_PORT || '8019';
const backendUrl = `http://127.0.0.1:${backendPort}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: frontendUrl,
    locale: 'fr-FR',
    timezoneId: 'Africa/Abidjan',
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 960 } } },
  ],
  webServer: [
    {
      command: production
        ? `npx vite preview --host 127.0.0.1 --port ${frontendPort} --strictPort`
        : `npx vite --host 127.0.0.1 --port ${frontendPort} --strictPort`,
      url: frontendUrl,
      env: { API_PROXY_TARGET: backendUrl },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/serve-local.ps1 -Port ${backendPort}${process.env.PHP_BIN ? ` -PhpBinary "${process.env.PHP_BIN}"` : ''}`,
      cwd: '../comsig-v2',
      env: {
        APP_URL: backendUrl,
        FRONTEND_URL: frontendUrl,
        FRONTEND_URLS: frontendUrl,
        SANCTUM_STATEFUL_DOMAINS: `127.0.0.1:${frontendPort}`,
        COMSIG_LOGIN_IP_LIMIT: '100',
        COMSIG_LOGIN_ACCOUNT_LIMIT: '30',
        COMSIG_API_LIMIT: '1000',
      },
      url: `${backendUrl}/api/v1/health`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
