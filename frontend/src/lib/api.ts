import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const coursesApi = {
  list: (params?: { language?: string; difficulty?: string }) =>
    api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
};

export const lessonsApi = {
  list: (courseId?: string) => api.get('/lessons', { params: { course_id: courseId } }),
  getById: (id: string) => api.get(`/lessons/${id}`),
};

export const quizzesApi = {
  getByLesson: (lessonId: string) => api.get(`/quizzes/${lessonId}`),
  submit: (lessonId: string, answers: { answers: Record<string, number> }) =>
    api.post(`/quizzes/${lessonId}/submit`, answers),
};

export const submissionsApi = {
  submit: (data: { lesson_id: string; code: string; language: string }) =>
    api.post('/submissions', data),
  getByLesson: (lessonId: string) => api.get(`/submissions/${lessonId}`),
};

export const executeApi = {
  run: (data: { code: string; language: string; stdin?: string }) =>
    api.post('/execute', data),
  getLanguages: () => api.get('/execute/languages'),
};

export const progressApi = {
  getStats: () => api.get('/progress/stats'),
  getLessonProgress: () => api.get('/progress/lessons'),
  getLeaderboard: (limit?: number) =>
    api.get('/progress/leaderboard', { params: { limit } }),
  getBadges: () => api.get('/progress/badges'),
};

export const commentsApi = {
  list: (lessonId: string) => api.get(`/comments/${lessonId}`),
  create: (lessonId: string, data: { content: string; parent_id?: string }) =>
    api.post(`/comments/${lessonId}`, data),
  delete: (commentId: string) => api.delete(`/comments/${commentId}`),
};
