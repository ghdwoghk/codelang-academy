export interface User {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  avatar_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  language: string;
  difficulty: string;
  icon?: string;
  color?: string;
  order_index: number;
  is_published: boolean;
  lesson_count: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content?: string;
  lesson_type: string;
  order_index: number;
  xp_reward: number;
  estimated_minutes: number;
  starter_code?: string;
  expected_output?: string;
  is_free: boolean;
  created_at: string;
}

export interface LessonDetail extends Lesson {
  content: string;
  starter_code?: string;
  expected_output?: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  order_index: number;
}

export interface Submission {
  id: string;
  lesson_id: string;
  code: string;
  language: string;
  status: string;
  passed?: boolean;
  execution_time_ms?: number;
  error_message?: string;
  created_at: string;
}

export interface ExecuteResult {
  output: string;
  error: string;
  exit_code: number;
  execution_time_ms: number;
  memory_used_kb: number;
}

export interface UserStats {
  total_xp: number;
  level: number;
  streak: number;
  completed_lessons: number;
  total_lessons: number;
  completion_percentage: number;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
  avatar_url?: string;
}

export interface Comment {
  id: string;
  user_id: string;
  username: string;
  lesson_id: string;
  parent_id?: string;
  content: string;
  is_solution: boolean;
  created_at: string;
  replies: Comment[];
}
