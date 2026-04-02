import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  departmentId: z.string().optional(),
  isActive: z.boolean().optional(),
});

const usersRoute = new Hono<{ Bindings: { DB: any } }>();

usersRoute.get('/', async (c) => {
  const db = getDb(c.env);
  const result = await db.select().from(users);
  return c.json(result);
});

usersRoute.put('/:id', zValidator('json', userSchema), async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return c.json(user);
});

usersRoute.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  await db.delete(users).where(eq(users.id, id));
  return c.json({ success: true });
});

export default usersRoute;
