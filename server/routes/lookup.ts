import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../db';
import { learningDomains, taxonomyLevels, dublinAccordStandards } from '../db/schema';
import { eq } from 'drizzle-orm';

const lookupRoute = new Hono<{ Bindings: { DB: any } }>();

// Learning Domains
lookupRoute.get('/learning_domains', async (c) => {
  const db = getDb(c.env);
  const result = await db.select().from(learningDomains);
  return c.json(result);
});

lookupRoute.post('/learning_domains', zValidator('json', z.object({ code: z.string(), name: z.string(), description: z.string().optional() })), async (c) => {
  const db = getDb(c.env);
  const data = c.req.valid('json');
  const [res] = await db.insert(learningDomains).values(data).returning();
  return c.json(res);
});

// Taxonomy Levels
lookupRoute.get('/taxonomy_levels', async (c) => {
  const db = getDb(c.env);
  const result = await db.select().from(taxonomyLevels);
  return c.json(result);
});

// Dublin Accord Standards
lookupRoute.get('/dublin_accord_standards', async (c) => {
  const db = getDb(c.env);
  const result = await db.select().from(dublinAccordStandards);
  return c.json(result);
});

lookupRoute.post('/dublin_accord_standards', zValidator('json', z.object({ code: z.string(), description: z.string() })), async (c) => {
  const db = getDb(c.env);
  const data = c.req.valid('json');
  const [res] = await db.insert(dublinAccordStandards).values(data).returning();
  return c.json(res);
});

lookupRoute.put('/dublin_accord_standards/:id', zValidator('json', z.object({ code: z.string(), description: z.string() })), async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const [res] = await db.update(dublinAccordStandards).set(data).where(eq(dublinAccordStandards.id, id)).returning();
  return c.json(res);
});

lookupRoute.delete('/dublin_accord_standards/:id', async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  await db.delete(dublinAccordStandards).where(eq(dublinAccordStandards.id, id));
  return c.json({ success: true });
});

export default lookupRoute;
