import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../db';
import { departments } from '../db/schema';
import { eq } from 'drizzle-orm';

const departmentSchema = z.object({
  name: z.string(),
  code: z.string(),
});

const departmentsRoute = new Hono<{ Bindings: { DB: any } }>();

departmentsRoute.get('/', async (c) => {
  const db = getDb(c.env);
  const result = await db.select().from(departments);
  return c.json(result);
});

departmentsRoute.post('/', zValidator('json', departmentSchema), async (c) => {
  const db = getDb(c.env);
  const data = c.req.valid('json');
  const [dept] = await db.insert(departments).values(data).returning();
  return c.json(dept);
});

departmentsRoute.put('/:id', zValidator('json', departmentSchema), async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const [dept] = await db.update(departments).set(data).where(eq(departments.id, id)).returning();
  return c.json(dept);
});

departmentsRoute.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  await db.delete(departments).where(eq(departments.id, id));
  return c.json({ success: true });
});

export default departmentsRoute;
