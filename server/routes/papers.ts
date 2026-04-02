import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../db';
import { assessmentPapers } from '../db/schema';
import { eq } from 'drizzle-orm';

const paperSchema = z.object({
  title: z.string(),
  courseId: z.string().optional(),
  sessionId: z.string().optional(),
  templateId: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  sections: z.any().optional(),
  metadata: z.any().optional(),
});

const papersRoute = new Hono<{ Bindings: { DB: any } }>();

papersRoute.get('/', async (c) => {
  const db = getDb(c.env);
  const result = await db.select().from(assessmentPapers);
  return c.json(result);
});

papersRoute.post('/', zValidator('json', paperSchema), async (c) => {
  const db = getDb(c.env);
  const data = c.req.valid('json');
  const [paper] = await db.insert(assessmentPapers).values(data).returning();
  return c.json(paper);
});

papersRoute.put('/:id', zValidator('json', paperSchema), async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const [paper] = await db.update(assessmentPapers).set(data).where(eq(assessmentPapers.id, id)).returning();
  return c.json(paper);
});

papersRoute.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  await db.delete(assessmentPapers).where(eq(assessmentPapers.id, id));
  return c.json({ success: true });
});

export default papersRoute;
