import {
  Course,
  Question,
  AssessmentPaper,
  AssessmentTemplate,
  User,
  Session,
  Department,
  Programme,
  LearningDomain,
  Taxonomy,
  ItemType,
  DublinAccord,
} from "../types";
import { hc } from 'hono/client';
import type { AppType } from '../../server/index';

// Initialize Hono RPC Client with base path
const client = hc<AppType>('/api');

// Helper to handle RPC responses
async function handleResponse<T>(res: any): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${res.status}`);
  }
  return await res.json();
}

export const isSupabaseConfigured = true;

export const api = {
  auth: {
    signInWithGoogle: () => {
      // Redirect to Hono's Google SSO endpoint
      window.location.href = '/api/auth/google';
    },
    logout: async () => {
      const res = await client.auth.logout.$post();
      return await handleResponse(res);
    },
    getSession: async () => {
      const res = await client.auth.session.$get();
      const session = await handleResponse<any>(res);
      if (!session) return null;
      
      return {
        user: {
          id: session.id,
          email: session.email,
          user_metadata: {
            full_name: session.name,
            role: session.role,
          }
        },
        access_token: 'session-cookie' // Handled by cookies, but kept for interface compatibility
      };
    }
  },
  departments: {
    list: async () => {
      const res = await client.departments.$get();
      return await handleResponse<Department[]>(res);
    },
    save: async (data: Department) => {
      if (data.id) {
        const res = await client.departments[':id'].$put({
          param: { id: data.id },
          json: data as any
        });
        return await handleResponse<Department>(res);
      } else {
        const res = await client.departments.$post({
          json: data as any
        });
        return await handleResponse<Department>(res);
      }
    },
    delete: async (id: string) => {
      const res = await client.departments[':id'].$delete({ param: { id } });
      return await handleResponse<any>(res);
    },
  },
  programmes: {
    list: async () => {
      const res = await client.programmes.$get();
      return await handleResponse<Programme[]>(res);
    },
    save: async (data: Programme) => {
      if (data.id) {
        const res = await client.programmes[':id'].$put({
          param: { id: data.id },
          json: data as any
        });
        return await handleResponse<Programme>(res);
      } else {
        const res = await client.programmes.$post({
          json: data as any
        });
        return await handleResponse<Programme>(res);
      }
    },
    delete: async (id: string) => {
      const res = await client.programmes[':id'].$delete({ param: { id } });
      return await handleResponse<any>(res);
    },
  },
  sessions: {
    list: async () => {
      const res = await client.sessions.$get();
      return await handleResponse<Session[]>(res);
    },
    create: async (name: string) => {
      const res = await client.sessions.$post({ json: { name } });
      return await handleResponse<Session>(res);
    },
    activate: async (id: string) => {
      const res = await client.sessions[':id'].$put({
        param: { id },
        json: { isActive: true, name: '' } // Session name is required by schema, but we're mostly deactivating others
      });
      return await handleResponse<Session>(res);
    },
    delete: async (id: string) => {
      const res = await client.sessions[':id'].$delete({ param: { id } });
      return await handleResponse<any>(res);
    },
  },
  courses: {
    list: async () => {
      const res = await client.courses.$get();
      return await handleResponse<Course[]>(res);
    },
    save: async (data: Course) => {
      if (data.id && !data.id.toString().includes("local")) {
        const res = await client.courses[':id'].$put({
          param: { id: data.id },
          json: data as any
        });
        return await handleResponse<Course>(res);
      } else {
        const res = await client.courses.$post({
          json: data as any
        });
        return await handleResponse<Course>(res);
      }
    },
    delete: async (id: string) => {
      const res = await client.courses[':id'].$delete({ param: { id } });
      return await handleResponse<any>(res);
    },
  },
  questions: {
    list: async () => {
      const res = await client.questions.$get();
      return await handleResponse<Question[]>(res);
    },
    save: async (data: Question) => {
      if (data.id && !data.id.toString().includes("custom")) {
        const res = await client.questions[':id'].$put({
          param: { id: data.id },
          json: data as any
        });
        return await handleResponse<Question>(res);
      } else {
        const res = await client.questions.$post({
          json: data as any
        });
        return await handleResponse<Question>(res);
      }
    },
    delete: async (id: string) => {
      const res = await client.questions[':id'].$delete({ param: { id } });
      return await handleResponse<any>(res);
    },
  },
  papers: {
    list: async () => {
      const res = await client.papers.$get();
      return await handleResponse<AssessmentPaper[]>(res);
    },
    save: async (data: AssessmentPaper) => {
      if (data.id) {
        const res = await client.papers[':id'].$put({
          param: { id: data.id },
          json: data as any
        });
        return await handleResponse<AssessmentPaper>(res);
      } else {
        const res = await client.papers.$post({
          json: data as any
        });
        return await handleResponse<AssessmentPaper>(res);
      }
    },
    delete: async (id: string) => {
      const res = await client.papers[':id'].$delete({ param: { id } });
      return await handleResponse<any>(res);
    },
  },
  templates: {
    list: async () => {
      const res = await client.templates.$get();
      return await handleResponse<AssessmentTemplate[]>(res);
    },
    save: async (data: AssessmentTemplate) => {
      if (data.id) {
        const res = await client.templates[':id'].$put({
          param: { id: data.id },
          json: data as any
        });
        return await handleResponse<AssessmentTemplate>(res);
      } else {
        const res = await client.templates.$post({
          json: data as any
        });
        return await handleResponse<AssessmentTemplate>(res);
      }
    },
    delete: async (id: string) => {
      const res = await client.templates[':id'].$delete({ param: { id } });
      return await handleResponse<any>(res);
    },
  },
  users: {
    list: async () => {
      const res = await client.users.$get();
      return await handleResponse<User[]>(res);
    },
    delete: (id: string) => client.users[':id'].$delete({ param: { id } }).then(handleResponse),
    updateProfile: (id: string, data: Partial<User>) => 
      client.users[':id'].$put({ param: { id }, json: data as any }).then(handleResponse),
  },
  lookup: {
    learningDomains: () => client.lookup.learning_domains.$get().then(handleResponse<LearningDomain[]>),
    taxonomies: () => client.lookup.taxonomy_levels.$get().then(handleResponse<Taxonomy[]>),
    itemTypes: async () => [], // Item types derived from blueprints usually
    dublinAccords: () => client.lookup.dublin_accord_standards.$get().then(handleResponse<DublinAccord[]>),
    initializeDublinAccords: async () => {
      // In this architecture, seeded via migrations or initial setup
      const existing = await client.lookup.dublin_accord_standards.$get().then(handleResponse<DublinAccord[]>);
      return existing;
    },
    saveDublinAccord: async (data: DublinAccord) => {
      if (data.id && !data.id.toString().includes("local")) {
        const res = await client.lookup.dublin_accord_standards[':id'].$put({
          param: { id: data.id },
          json: data as any
        });
        return await handleResponse<DublinAccord>(res);
      } else {
        const res = await client.lookup.dublin_accord_standards.$post({
          json: data as any
        });
        return await handleResponse<DublinAccord>(res);
      }
    },
    deleteDublinAccord: (id: string) => 
      client.lookup.dublin_accord_standards[':id'].$delete({ param: { id } }).then(handleResponse),
  },
  storage: {
    uploadLogo: async (file: File): Promise<string> => {
      const res = await client.storage.upload.$post({
        form: { file }
      });
      const data = await handleResponse<{ publicUrl: string }>(res);
      return data.publicUrl;
    },
    uploadQuestionImage: async (file: File): Promise<string> => {
      const res = await client.storage.upload.$post({
        form: { file }
      });
      const data = await handleResponse<{ publicUrl: string }>(res);
      return data.publicUrl;
    },
  }
};
