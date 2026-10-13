import { preview } from 'astro';

// Playwright owns the server process. Astro's CLI backgrounds itself in agent environments.
await preview({ server: { host: '127.0.0.1', port: 4322 } });
