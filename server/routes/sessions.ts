import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../db';
import { sessions } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const sessionSchema = z.object({
  name: z.string(),
  isActive: z.boolean().optional(),
});

const sessionsRoute = new Hono<{ Bindings: { DB: any } }>();

sessionsRoute.get('/', async (c) => {
  const db = getDb(c.env);
  const result = await db.select().from(sessions).orderBy(desc(sessions.createdAt));
  return c.json(result);
});

sessionsRoute.post('/', zValidator('json', sessionSchema), async (c) => {
  const db = getDb(c.env);
  const data = c.req.valid('json');
  const [session] = await db.insert(sessions).values({
    name: data.name,
    isActive: false,
  }).returning();
  return c.json(session);
});

sessionsRoute.put('/:id', zValidator('json', sessionSchema), async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  const data = c.req.valid('json');

  if (data.isActive) {
    // If activating this session, deactivate all others
    await db.update(sessions).set({ isActive: false });
  }

  const [session] = await db.update(sessions).set(data).where(eq(sessions.id, id)).returning();
  return c.json(session);
});

sessionsRoute.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  await db.delete(sessions).where(eq(sessions.id, id));
  return c.json({ success: true });
});

export default sessionsRoute;
