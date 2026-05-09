'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, ChevronLeft, Clock, Zap, CheckCircle, Lock, Play,
} from 'lucide-react';
import { coursesApi, lessonsApi, progressApi } from '@/lib/api';
import type { Course, Lesson } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      coursesApi.getById(id),
      lessonsApi.list(id),
      progressApi.getLessonProgress().catch(() => ({ data: [] })),
    ])
      .then(([courseRes, lessonsRes, progressRes]) => {
        setCourse(courseRes.data);
        setLessons(lessonsRes.data.lessons);
        const completed = new Set(
          (progressRes.data as any[])
            .filter((p: any) => p.completed)
            .map((p: any) => p.lesson_id)
        );
        setCompletedLessons(completed);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!course) return <div className="text-center py-20 text-dark-400">Course not found</div>;

  const completedCount = lessons.filter((l) => completedLessons.has(l.id)).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/courses" className="text-dark-400 hover:text-white text-sm flex items-center gap-1 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Courses
      </Link>

      <div className="card mb-8">
        <div className="flex items-start gap-4">
          {course.icon && (
            <img src={course.icon} alt="" className="w-14 h-14" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge-${course.difficulty}`}>{course.difficulty}</span>
              <span className="badge bg-dark-700 text-dark-300">{course.language.toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
            <p className="text-dark-400">{course.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-dark-400">
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {lessons.length} lessons</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {completedCount} completed</span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                {lessons.reduce((sum, l) => sum + l.xp_reward, 0)} XP total
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-dark-700 rounded-full h-2 mb-6">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all"
          style={{ width: `${(completedCount / lessons.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {lessons.map((lesson, idx) => {
          const isCompleted = completedLessons.has(lesson.id);
          return (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className={`card-hover flex items-center gap-4 ${
                isCompleted ? 'border-primary-500/20' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCompleted
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-dark-700 text-dark-400'
                }`}
              >
                {isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium truncate ${
                  isCompleted ? 'text-primary-300' : 'text-white'
                }`}>
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-dark-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {lesson.estimated_minutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {lesson.xp_reward} XP
                  </span>
                  <span className="capitalize">{lesson.lesson_type}</span>
                </div>
              </div>
              {lesson.lesson_type === 'code' || lesson.lesson_type === 'quiz' ? (
                <Play className="w-4 h-4 text-primary-400" />
              ) : (
                <BookOpen className="w-4 h-4 text-dark-500" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
