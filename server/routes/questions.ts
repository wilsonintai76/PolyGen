import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../db';
import { questions } from '../db/schema';
import { eq } from 'drizzle-orm';

const questionSchema = z.object({
  id: z.string().optional(),
  courseId: z.string().optional(),
  topicId: z.string().optional(),
  cloId: z.string().optional(),
  learningDomain: z.string().optional(),
  taxonomyLevel: z.string().optional(),
  itemType: z.string().optional(),
  difficultyLevel: z.string().optional(),
  text: z.string(),
  marks: z.number().optional(),
  constructGs: z.string().optional(),
  constructSs: z.string().optional(),
  daStandard: z.string().optional(),
  answerScheme: z.string().optional(),
  imageUrl: z.string().optional(),
});

const questionsRoute = new Hono<{ Bindings: { DB: any } }>();

questionsRoute.get('/', async (c) => {
  const db = getDb(c.env);
  const result = await db.select().from(questions);
  return c.json(result);
});

questionsRoute.post('/', zValidator('json', questionSchema), async (c) => {
  const db = getDb(c.env);
  const data = c.req.valid('json');
  const [question] = await db.insert(questions).values(data).returning();
  return c.json(question);
});

questionsRoute.put('/:id', zValidator('json', questionSchema), async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const [question] = await db.update(questions).set(data).where(eq(questions.id, id)).returning();
  return c.json(question);
});

questionsRoute.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  await db.delete(questions).where(eq(questions.id, id));
  return c.json({ success: true });
});

export default questionsRoute;
