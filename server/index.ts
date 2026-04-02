import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import modular routes
import authRoute from './routes/auth';
import departmentsRoute from './routes/departments';
import programmesRoute from './routes/programmes';
import sessionsRoute from './routes/sessions';
import coursesRoute from './routes/courses';
import questionsRoute from './routes/questions';
import papersRoute from './routes/papers';
import templatesRoute from './routes/templates';
import usersRoute from './routes/users';
import lookupRoute from './routes/lookup';
import storageRoute from './routes/storage';

const app = new Hono<{
  Bindings: {
    DB: any;
    BUCKET: any;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    AUTH_REDIRECT_URI: string;
  }
}>().basePath('/api');

// Middleware
app.use('*', cors());

// Mount Routes
const routes = app
  .route('/auth', authRoute)
  .route('/departments', departmentsRoute)
  .route('/programmes', programmesRoute)
  .route('/sessions', sessionsRoute)
  .route('/courses', coursesRoute)
  .route('/questions', questionsRoute)
  .route('/papers', papersRoute)
  .route('/templates', templatesRoute)
  .route('/users', usersRoute)
  .route('/lookup', lookupRoute)
  .route('/storage', storageRoute);

// Export Type for Hono Client (HC)
export type AppType = typeof routes;

// Export for Cloudflare Workers
export default app;

// Node.js development server
if (process.env.NODE_ENV !== 'production') {
  const port = 3001;
  console.log(`Server is running on port ${port}`);
  serve({
    fetch: app.fetch,
    port
  });
}
