import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../db';
import { programmes } from '../db/schema';
import { eq } from 'drizzle-orm';

const programmeSchema = z.object({
  name: z.string(),
  code: z.string(),
  deptId: z.string().optional(),
  headOfProgramme: z.string().optional(),
});

const programmesRoute = new Hono<{ Bindings: { DB: any } }>();

programmesRoute.get('/', async (c) => {
  const db = getDb(c.env);
  const result = await db.select().from(programmes);
  return c.json(result);
});

programmesRoute.post('/', zValidator('json', programmeSchema), async (c) => {
  const db = getDb(c.env);
  const data = c.req.valid('json');
  const [prog] = await db.insert(programmes).values(data).returning();
  return c.json(prog);
});

programmesRoute.put('/:id', zValidator('json', programmeSchema), async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const [prog] = await db.update(programmes).set(data).where(eq(programmes.id, id)).returning();
  return c.json(prog);
});

programmesRoute.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  await db.delete(programmes).where(eq(programmes.id, id));
  return c.json({ success: true });
});

export default programmesRoute;
