
import { InstitutionalBranding, Course, Question, AssessmentPaper, User, Session, Department } from '../types';
import { DEFAULT_BRANDING, QUESTION_BANK } from '../constants';

const getApiBase = () => {
  try {
    // @ts-ignore
    return import.meta.env?.VITE_API_URL;
  } catch {
    return undefined;
  }
};

const API_BASE = getApiBase() || 'http://localhost:8000/api';

const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    const item = localStorage.getItem(`poly_v3_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  },
  set: (key: string, value: any) => {
    localStorage.setItem(`poly_v3_${key}`, JSON.stringify(value));
  }
};

const INITIAL_USERS = [
  { username: 'creator', role: 'creator', full_name: 'AHMAD FAIZAL', position: 'Lecturer', deptId: '1' },
  { username: 'reviewer', role: 'reviewer', full_name: 'SITI AMINAH', position: 'Coordinator', deptId: '2' },
  { username: 'endorser', role: 'endorser', full_name: 'DR. WONG', position: 'Head of Department', deptId: '1' },
  { username: 'admin', role: 'admin', full_name: 'SYSTEM ADMIN', position: 'IT Department', deptId: '2' }
];

const INITIAL_SESSIONS: Session[] = [
  { id: 's1', name: 'SESSION II: 2024/2025', isActive: true, isArchived: false },
  { id: 's0', name: 'SESSION I: 2024/2025', isActive: false, isArchived: true }
];

const INITIAL_DEPARTMENTS: Department[] = [
  { id: '1', name: 'DEPARTMENT OF MECHANICAL ENGINEERING', headOfDept: 'TN. HJ. RAMLI' },
  { id: '2', name: 'DEPARTMENT OF INFORMATION TECHNOLOGY', headOfDept: 'DR. SITI AMINAH' },
  { id: '3', name: 'DEPARTMENT OF GENERAL STUDIES', headOfDept: 'PN. NURUL' }
];

/**
 * Primary API Gateway
 * Designed for Django REST Framework with PostgreSQL backend.
 */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    // Falls back to browser storage only if the Django server is unavailable
    return handleFallback<T>(path, options);
  }
}

async function handleFallback<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method || 'GET';
  
  if (path.includes('/auth/login')) {
    const body = JSON.parse(options?.body as string || '{}');
    const username = body.username || '';
    const registeredUsers = storage.get<any[]>('users', INITIAL_USERS);
    const userMatch = registeredUsers.find(u => u.username === username);
    if (!userMatch) throw new Error("User not found");
    return { user: userMatch, token: 'mock-jwt-token-' + Date.now() } as unknown as T;
  }

  if (path.includes('/auth/register')) {
    const data = JSON.parse(options?.body as string || '{}');
    const list = storage.get<any[]>('users', INITIAL_USERS);
    if (list.some(u => u.username === data.username)) throw new Error("Username already taken");
    let mappedRole: 'creator' | 'reviewer' | 'endorser' | 'admin' = 'creator';
    if (data.position === 'Coordinator') mappedRole = 'reviewer';
    if (data.position === 'Head of Programme' || data.position === 'Head of Department') mappedRole = 'endorser';
    const newUser = { 
      username: data.username, 
      full_name: data.full_name, 
      position: data.position, 
      role: mappedRole,
      deptId: data.deptId 
    };
    storage.set('users', [...list, newUser]);
    return { user: newUser, token: 'mock-jwt-token-' + Date.now() } as unknown as T;
  }

  if (path.includes('/departments')) {
    const list = storage.get<Department[]>('departments', INITIAL_DEPARTMENTS);
    if (method === 'GET') return list as T;
    const data = JSON.parse(options?.body as string || '{}');
    if (method === 'POST') {
      const newItem = { ...data, id: `dept-${Date.now()}` };
      storage.set('departments', [...list, newItem]);
      return newItem as T;
    }
    if (method === 'PUT') {
      const updated = list.map(d => d.id === data.id ? data : d);
      storage.set('departments', updated);
      return data as T;
    }
    if (method === 'DELETE') {
      const id = path.split('/').filter(Boolean).pop();
      storage.set('departments', list.filter(d => d.id !== id));
      return {} as T;
    }
  }

  if (path.includes('/sessions')) {
    const list = storage.get<Session[]>('sessions', INITIAL_SESSIONS);
    if (method === 'GET') return list as T;
    const data = JSON.parse(options?.body as string || '{}');
    if (method === 'POST') {
      const newSession = { ...data, id: `s-${Date.now()}`, isArchived: false, isActive: false };
      const updated = [...list, newSession];
      storage.set('sessions', updated);
      return newSession as T;
    }
    if (method === 'PUT') {
      if (data.isActive) {
        const updated = list.map(s => s.id === data.id 
          ? { ...s, isActive: true, isArchived: false } 
          : { ...s, isActive: false, isArchived: true }
        );
        storage.set('sessions', updated);
        return updated.find(s => s.id === data.id) as T;
      }
      const updated = list.map(s => s.id === data.id ? { ...s, ...data } : s);
      storage.set('sessions', updated);
      return data as T;
    }
    if (method === 'DELETE') {
      const id = path.split('/').filter(Boolean).pop();
      const updated = list.filter(s => s.id !== id);
      storage.set('sessions', updated);
      return {} as T;
    }
  }

  if (path.includes('/branding/')) {
    if (method === 'GET') return storage.get('branding', [DEFAULT_BRANDING]) as T;
    const data = JSON.parse(options?.body as string);
    storage.set('branding', [data]);
    return data as T;
  }
  
  if (path.includes('/courses/')) {
    const list = storage.get<Course[]>('courses', []);
    if (method === 'GET') return list as T;
    const data = JSON.parse(options?.body as string);
    if (method === 'POST') {
      data.id = `local-${Date.now()}`;
      const newList = [...list, data];
      storage.set('courses', newList);
      return data as T;
    }
    if (method === 'PUT') {
      const newList = list.map(c => c.id === data.id ? data : c);
      storage.set('courses', newList);
      return data as T;
    }
    if (method === 'DELETE') {
      const id = path.split('/').filter(Boolean).pop();
      storage.set('courses', list.filter(c => c.id.toString() !== id));
      return {} as T;
    }
  }
  
  if (path.includes('/questions/')) {
    const list = storage.get<Question[]>('questions', QUESTION_BANK);
    if (method === 'GET') return list as T;
    const data = JSON.parse(options?.body as string);
    const id = data.id || `custom-${Date.now()}`;
    const updated = { ...data, id };
    const newList = list.some(q => q.id === id) ? list.map(q => q.id === id ? updated : q) : [...list, updated];
    storage.set('questions', newList);
    return updated as T;
  }
  
  if (path.includes('/papers/')) {
    const list = storage.get<AssessmentPaper[]>('papers', []);
    if (method === 'GET') return list as T;
    const data = JSON.parse(options?.body as string);
    data.id = `paper-${Date.now()}`;
    storage.set('papers', [data, ...list]);
    return data as T;
  }

  throw new Error(`Fallback Error for ${path}`);
}

export const api = {
  auth: {
    login: (username: string, password: string) => request<{user: User, token: string}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
    register: (data: { username: string, full_name: string, position: string, deptId: string }) => request<{user: User, token: string}>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  departments: {
    list: () => request<Department[]>('/departments/'),
    save: (data: Department) => request<Department>(`/departments/${data.id ? data.id + '/' : ''}`, {
      method: data.id ? 'PUT' : 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id: string) => request(`/departments/${id}/`, { method: 'DELETE' }),
  },
  sessions: {
    list: () => request<Session[]>('/sessions/'),
    create: (name: string) => request<Session>('/sessions/', { method: 'POST', body: JSON.stringify({ name }) }),
    activate: (id: string) => request<Session>(`/sessions/${id}/`, { method: 'PUT', body: JSON.stringify({ id, isActive: true }) }),
    delete: (id: string) => request(`/sessions/${id}/`, { method: 'DELETE' }),
  },
  branding: {
    get: () => request<InstitutionalBranding[]>('/branding/').then(res => res[0] || DEFAULT_BRANDING),
    update: (data: InstitutionalBranding) => request<InstitutionalBranding>(`/branding/1/`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  courses: {
    list: () => request<Course[]>('/courses/'),
    save: (data: Course) => request<Course>(`/courses/${data.id.toString().includes('local') ? '' : data.id + '/'}`, { 
      method: data.id.toString().includes('local') ? 'POST' : 'PUT', 
      body: JSON.stringify(data) 
    }),
    delete: (id: string) => request(`/courses/${id}/`, { method: 'DELETE' }),
  },
  questions: {
    list: () => request<Question[]>('/questions/'),
    save: (data: Question) => request<Question>(`/questions/${data.id.toString().includes('custom') ? '' : data.id + '/'}`, {
      method: data.id.toString().includes('custom') ? 'POST' : 'PUT',
      body: JSON.stringify(data)
    }),
  },
  papers: {
    list: () => request<AssessmentPaper[]>('/papers/'),
    save: (data: AssessmentPaper) => request<AssessmentPaper>('/papers/', { method: 'POST', body: JSON.stringify(data) }),
  }
};
