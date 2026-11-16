import config from './playwright.config';

// Public screens can be compared without MySQL. The source dev server is read-only.
export default {
  ...config,
  testMatch: '**/crm-parity.spec.ts',
  grep: /parité visuelle/,
  webServer: Array.isArray(config.webServer) ? config.webServer.slice(0, 1) : config.webServer,
};
