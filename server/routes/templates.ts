import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../db';
import { assessmentTemplates } from '../db/schema';
import { eq } from 'drizzle-orm';

const templateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.string().optional(),
  sections: z.any().optional(),
  layout: z.any().optional(),
});

const templatesRoute = new Hono<{ Bindings: { DB: any } }>();

templatesRoute.get('/', async (c) => {
  const db = getDb(c.env);
  const result = await db.select().from(assessmentTemplates);
  return c.json(result);
});

templatesRoute.post('/', zValidator('json', templateSchema), async (c) => {
  const db = getDb(c.env);
  const data = c.req.valid('json');
  const [template] = await db.insert(assessmentTemplates).values(data).returning();
  return c.json(template);
});

templatesRoute.put('/:id', zValidator('json', templateSchema), async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const [template] = await db.update(assessmentTemplates).set(data).where(eq(assessmentTemplates.id, id)).returning();
  return c.json(template);
});

templatesRoute.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  await db.delete(assessmentTemplates).where(eq(assessmentTemplates.id, id));
  return c.json({ success: true });
});

export default templatesRoute;
