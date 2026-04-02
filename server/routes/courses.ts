import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../db';
import { courses, courseClos, courseTopics } from '../db/schema';
import { eq } from 'drizzle-orm';

const courseSchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  name: z.string(),
  deptId: z.string().optional(),
  programmeId: z.string().optional(),
  syllabus: z.string().optional(),
  da: z.any().optional(),
  daMappings: z.any().optional(),
  clos: z.record(z.string()).optional(), // Map of code -> description
  topics: z.array(z.object({
    id: z.string().optional(),
    code: z.string(),
    name: z.string(),
    syllabus: z.string().optional(),
    constructs: z.any().optional(),
  })).optional(),
});

const coursesRoute = new Hono<{ Bindings: { DB: any } }>();

// Helper to map DB course data to Frontend Course type
const mapCourseData = (c: any, clos: any[], topics: any[]) => {
  const closMap: Record<string, string> = {};
  clos.forEach(clo => {
    if (clo.code) closMap[clo.code] = clo.description || "";
  });

  return {
    ...c,
    da: c.mqfs || {},
    daMappings: c.mqfMappings || {},
    clos: closMap,
    topics: topics.map(t => ({
      id: t.id,
      code: t.code,
      name: t.name,
      syllabus: t.syllabus || "",
      constructs: t.constructs || [],
    })),
  };
};

coursesRoute.get('/', async (c) => {
  const db = getDb(c.env);
  const coursesList = await db.select().from(courses);
  const closList = await db.select().from(courseClos);
  const topicsList = await db.select().from(courseTopics);

  const result = coursesList.map(course => {
    const relevantClos = closList.filter(clo => clo.courseId === course.id);
    const relevantTopics = topicsList.filter(topic => topic.courseId === course.id);
    return mapCourseData(course, relevantClos, relevantTopics);
  });

  return c.json(result);
});

coursesRoute.post('/', zValidator('json', courseSchema), async (c) => {
  const db = getDb(c.env);
  const data = c.req.valid('json');

  const [course] = await db.insert(courses).values({
    code: data.code,
    name: data.name,
    deptId: data.deptId,
    programmeId: data.programmeId,
    syllabus: data.syllabus,
    mqfs: data.da,
    mqfMappings: data.daMappings,
  }).returning();

  if (data.clos && Object.keys(data.clos).length > 0) {
    const closToInsert = Object.entries(data.clos).map(([code, description]) => ({
      courseId: course.id,
      code,
      description: description as string,
    }));
    await db.insert(courseClos).values(closToInsert);
  }

  if (data.topics && data.topics.length > 0) {
    const topicsToInsert = data.topics.map(t => ({
      courseId: course.id,
      code: t.code,
      name: t.name,
      syllabus: t.syllabus,
      constructs: t.constructs,
    }));
    await db.insert(courseTopics).values(topicsToInsert);
  }

  // Fetch complete saved data for response
  const savedClos = await db.select().from(courseClos).where(eq(courseClos.courseId, course.id));
  const savedTopics = await db.select().from(courseTopics).where(eq(courseTopics.courseId, course.id));

  return c.json(mapCourseData(course, savedClos, savedTopics));
});

coursesRoute.put('/:id', zValidator('json', courseSchema), async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  const data = c.req.valid('json');

  await db.update(courses).set({
    code: data.code,
    name: data.name,
    deptId: data.deptId,
    programmeId: data.programmeId,
    syllabus: data.syllabus,
    mqfs: data.da,
    mqfMappings: data.daMappings,
  }).where(eq(courses.id, id));

  // Reset related tables for clean re-insert
  await db.delete(courseClos).where(eq(courseClos.courseId, id));
  await db.delete(courseTopics).where(eq(courseTopics.courseId, id));

  if (data.clos && Object.keys(data.clos).length > 0) {
    const closToInsert = Object.entries(data.clos).map(([code, description]) => ({
      courseId: id,
      code,
      description: description as string,
    }));
    await db.insert(courseClos).values(closToInsert);
  }

  if (data.topics && data.topics.length > 0) {
    const topicsToInsert = data.topics.map(t => ({
      courseId: id,
      code: t.code,
      name: t.name,
      syllabus: t.syllabus,
      constructs: t.constructs,
    }));
    await db.insert(courseTopics).values(topicsToInsert);
  }

  const [savedCourse] = await db.select().from(courses).where(eq(courses.id, id));
  const savedClos = await db.select().from(courseClos).where(eq(courseClos.courseId, id));
  const savedTopics = await db.select().from(courseTopics).where(eq(courseTopics.courseId, id));

  return c.json(mapCourseData(savedCourse, savedClos, savedTopics));
});

coursesRoute.delete('/:id', async (c) => {
  const db = getDb(c.env);
  const id = c.req.param('id');
  await db.delete(courses).where(eq(courses.id, id));
  return c.json({ success: true });
});

export default coursesRoute;
