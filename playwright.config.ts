import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3103',
    url: 'http://127.0.0.1:3103',
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://127.0.0.1:3103',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath:
            process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ??
            '/home/lexang/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',
        },
      },
    },
  ],
});
