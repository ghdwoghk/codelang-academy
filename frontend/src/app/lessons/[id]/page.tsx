'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, Clock, Zap, Play, CheckCircle, MessageCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { lessonsApi, quizzesApi, submissionsApi, commentsApi, progressApi } from '@/lib/api';
import type { LessonDetail, Quiz, Submission, Comment } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CodeEditor from '@/components/editor/CodeEditor';
import MemoryVisualizer from '@/components/visualization/MemoryVisualizer';
import CommentSection from '@/components/community/CommentSection';

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      lessonsApi.getById(id),
      quizzesApi.getByLesson(id).catch(() => ({ data: [] })),
      submissionsApi.getByLesson(id).catch(() => ({ data: [] })),
    ])
      .then(([lessonRes, quizRes, subRes]) => {
        setLesson(lessonRes.data);
        setCode(lessonRes.data.starter_code || '');
        setQuizzes(quizRes.data);
        setSubmissions(subRes.data);
      })
      .catch(() => router.push('/courses'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleRunCode = async () => {
    if (!lesson) return;
    setSubmitting(true);
    setOutput('Running...');
    try {
      const res = await submissionsApi.submit({
        lesson_id: lesson.id,
        code,
        language: lesson.course_id ? getLanguageFromCourse(lesson.course_id) : 'python',
      });
      setOutput(res.data.passed ? '✅ Passed!' : '⏳ Submitted (check expected output)');
      setSubmissions((prev) => [res.data, ...prev]);
    } catch (err: any) {
      setOutput(`Error: ${err.response?.data?.detail || 'Submission failed'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!lesson) return;
    setSubmitting(true);
    try {
      const res = await quizzesApi.submit(lesson.id, { answers: quizAnswers });
      setQuizResult(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getLanguageFromCourse = (courseId: string) => {
    const map: Record<string, string> = {};
    return 'python';
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (!lesson) return <div className="text-center py-20 text-dark-400">Lesson not found</div>;

  const isCodeLesson = lesson.lesson_type === 'code';
  const isQuizLesson = lesson.lesson_type === 'quiz' || quizzes.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/courses/${lesson.course_id}`} className="text-dark-400 hover:text-white text-sm flex items-center gap-1 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Course
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-dark-700 text-dark-300 capitalize">
                {lesson.lesson_type}
              </span>
              <span className="flex items-center gap-1 text-xs text-dark-400">
                <Clock className="w-3 h-3" /> {lesson.estimated_minutes} min
              </span>
              <span className="flex items-center gap-1 text-xs text-yellow-400">
                <Zap className="w-3 h-3" /> {lesson.xp_reward} XP
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">{lesson.title}</h1>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{lesson.content || ''}</ReactMarkdown>
            </div>
          </div>

          {isQuizLesson && !quizResult && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Quiz</h2>
              <div className="space-y-4">
                {quizzes.map((q, qi) => (
                  <div key={q.id} className="p-4 rounded-lg bg-dark-700/50">
                    <p className="text-white font-medium mb-3">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <label
                          key={oi}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            quizAnswers[q.id] === oi
                              ? 'bg-primary-500/20 border border-primary-500/30'
                              : 'bg-dark-800 border border-dark-700 hover:border-dark-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz-${q.id}`}
                            value={oi}
                            checked={quizAnswers[q.id] === oi}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: oi })}
                            className="accent-primary-500"
                          />
                          <span className="text-dark-200 text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleQuizSubmit}
                disabled={submitting || Object.keys(quizAnswers).length !== quizzes.length}
                className="btn-primary mt-4 w-full justify-center"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          )}

          {quizResult && (
            <div className="card text-center">
              <div className={`text-4xl mb-3 ${quizResult.passed ? 'text-green-400' : 'text-yellow-400'}`}>
                {quizResult.passed ? '🎉' : '📚'}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {quizResult.passed ? 'Congratulations!' : 'Keep Trying!'}
              </h3>
              <p className="text-dark-400 mb-2">
                Score: {quizResult.score}/{quizResult.total}
              </p>
              {quizResult.xp_earned > 0 && (
                <p className="text-yellow-400 text-sm">+{quizResult.xp_earned} XP earned!</p>
              )}
              <button
                onClick={() => { setQuizResult(null); setQuizAnswers({}); }}
                className="btn-secondary mt-4"
              >
                Retry Quiz
              </button>
            </div>
          )}

          <CommentSection lessonId={lesson.id} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          {isCodeLesson && (
            <div className="card p-0 overflow-hidden">
              <div className="p-3 bg-dark-800 border-b border-dark-700 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Code Editor</h3>
                <button
                  onClick={handleRunCode}
                  disabled={submitting}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Play className="w-3 h-3" /> {submitting ? 'Running...' : 'Run'}
                </button>
              </div>
              <CodeEditor
                value={code}
                onChange={setCode}
                height="400px"
              />
            </div>
          )}

          {isCodeLesson && output && (
            <div className="card">
              <h3 className="text-sm font-medium text-white mb-2">Output</h3>
              <pre className="bg-dark-950 rounded-lg p-3 text-sm text-green-400 overflow-x-auto font-mono">
                {output}
              </pre>
            </div>
          )}

          {isCodeLesson && submissions.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium text-white mb-3">Previous Submissions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {submissions.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded bg-dark-700/50 text-xs">
                    <span className="text-dark-300 font-mono truncate max-w-[200px]">
                      {s.code.substring(0, 50)}...
                    </span>
                    <span className={s.passed ? 'text-green-400' : 'text-yellow-400'}>
                      {s.passed ? 'Passed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <MemoryVisualizer code={code} language="c" />
        </div>
      </div>
    </div>
  );
}
