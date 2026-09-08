import type { Context, MiddlewareHandler } from 'hono';
import { canApprove, type Role } from './rules.ts';

export type Env = {
  DB: D1Database;
  AI: Ai;
  ASSETS: Fetcher;
  AI_PROVIDER: 'workers-ai' | 'anthropic' | 'mock';
  WORKERS_AI_MODEL: string;
  ANTHROPIC_MODEL: string;
  ANTHROPIC_API_KEY?: string;
  DEV_USER_EMAIL?: string;
};

export type User = { id: string; email: string; name: string; role: Role; staff_id: string | null };

export type Vars = { user: User };

/**
 * Identity comes from Cloudflare Access (Zero Trust) which sets Cf-Access-Authenticated-User-Email
 * after validating the JWT at the edge. The Worker never sees a password.
 * For local dev without Access, DEV_USER_EMAIL (or an X-Dev-User header) is used.
 * In production, set DEV_USER_EMAIL empty so an unauthenticated request is rejected.
 */
export const identify: MiddlewareHandler<{ Bindings: Env; Variables: Vars }> = async (c, next) => {
  const accessEmail = c.req.header('cf-access-authenticated-user-email');
  const devEmail = c.env.DEV_USER_EMAIL ? (c.req.header('x-dev-user') || c.env.DEV_USER_EMAIL) : undefined;
  const email = (accessEmail || devEmail || '').toLowerCase();
  if (!email) return c.json({ error: 'unauthenticated: no Cloudflare Access identity' }, 401);
  const row = await c.env.DB.prepare('SELECT id, email, name, role, staff_id FROM users WHERE lower(email) = ?').bind(email).first<User>();
  const user: User = row ?? { id: 'guest:' + email, email, name: email.split('@')[0], role: 'STAFF', staff_id: null };
  c.set('user', user);
  await next();
};

export function requireRole(required: Role) {
  const mw: MiddlewareHandler<{ Bindings: Env; Variables: Vars }> = async (c, next) => {
    const u = c.get('user');
    if (!canApprove(u.role, required)) return c.json({ error: `requires role ${required} or above, you are ${u.role}` }, 403);
    await next();
  };
  return mw;
}

export async function audit(c: Context<{ Bindings: Env; Variables: Vars }>, action: string, entity: string, entityId: string, detail?: unknown) {
  const u = c.get('user');
  await c.env.DB.prepare('INSERT INTO audit_log (actor, action, entity, entity_id, detail) VALUES (?,?,?,?,?)')
    .bind(u.email, action, entity, entityId, detail === undefined ? null : JSON.stringify(detail)).run();
}

export function newId(prefix: string): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${y}-${rand}`;
}
