import { Hono } from 'hono';
import { identify, type Env, type Vars } from './lib/auth.ts';
import { me } from './routes/me.ts';
import { hr } from './routes/hr.ts';
import { finance } from './routes/finance.ts';
import { logistics } from './routes/logistics.ts';
import { ai } from './routes/ai.ts';
import { dashboard } from './routes/dashboard.ts';
import { documents } from './routes/documents.ts';

const app = new Hono<{ Bindings: Env; Variables: Vars }>();

app.get('/api/health', (c) => c.json({ ok: true, service: 'stars-orbit-ops', time: new Date().toISOString() }));

app.use('/api/*', identify);
app.use('/api/*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'no-store');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'no-referrer');
});

app.get('/api/me', (c) => c.json(c.get('user')));
app.route('/api/me-data', me);
app.route('/api/hr', hr);
app.route('/api/finance', finance);
app.route('/api/logistics', logistics);
app.route('/api/ai', ai);
app.route('/api/dashboard', dashboard);
app.route('/api/documents', documents);

app.notFound((c) => (c.req.path.startsWith('/api/') ? c.json({ error: 'not found' }, 404) : c.env.ASSETS.fetch(c.req.raw)));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message }, 500);
});

export default app;
