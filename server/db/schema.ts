import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const departments = sqliteTable('departments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  code: text('code').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const programmes = sqliteTable('programmes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  code: text('code').notNull(),
  deptId: text('department_id').references(() => departments.id),
  headOfProgramme: text('head_of_programme'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('lecturer'),
  departmentId: text('department_id').references(() => departments.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  passwordHash: text('password_hash'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull(),
  name: text('name').notNull(),
  deptId: text('department_id'),
  programmeId: text('programme_id'),
  syllabus: text('syllabus'),
  mqfs: text('mqfs', { mode: 'json' }),
  mqfMappings: text('mqf_mappings', { mode: 'json' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const courseClos = sqliteTable('course_clos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  description: text('description').notNull(),
});

export const courseTopics = sqliteTable('course_topics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').references(() => courses.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  syllabus: text('syllabus'),
  constructs: text('constructs', { mode: 'json' }),
});

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text('course_id').references(() => courses.id),
  topicId: text('topic_id'),
  cloId: text('clo_id'),
  learningDomain: text('learning_domain'),
  taxonomyLevel: text('taxonomy_level'),
  itemType: text('item_type'),
  difficultyLevel: text('difficulty_level'),
  text: text('text').notNull(),
  marks: integer('marks'),
  constructGs: text('construct_gs'),
  constructSs: text('construct_ss'),
  daStandard: text('da_standard'),
  answerScheme: text('answer_scheme'),
  imageUrl: text('image_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const assessmentPapers = sqliteTable('assessment_papers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  courseId: text('course_id').references(() => courses.id),
  sessionId: text('session_id'),
  templateId: text('template_id'),
  type: text('type'),
  status: text('status').default('draft'),
  sections: text('sections', { mode: 'json' }),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const assessmentTemplates = sqliteTable('assessment_templates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type'),
  sections: text('sections', { mode: 'json' }),
  layout: text('layout', { mode: 'json' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const learningDomains = sqliteTable('learning_domains', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
});

export const taxonomyLevels = sqliteTable('taxonomy_levels', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  domain: text('domain').notNull(),
  level: text('level').notNull(),
  description: text('description'),
});

export const dublinAccordStandards = sqliteTable('dublin_accord_standards', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text('code').notNull(),
  description: text('description').notNull(),
});
