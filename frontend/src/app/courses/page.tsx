'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Filter, Search } from 'lucide-react';
import { coursesApi } from '@/lib/api';
import type { Course } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const languages = ['All', 'c', 'cpp', 'html', 'javascript', 'python'];
const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [langFilter, setLangFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (langFilter !== 'All') params.language = langFilter;
    if (diffFilter !== 'All') params.difficulty = diffFilter;

    coursesApi.list(params)
      .then((res) => setCourses(res.data.courses))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [langFilter, diffFilter]);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-400" /> Courses
          </h1>
          <p className="text-dark-400 text-sm mt-1">Choose a language and start learning</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            className="input pl-10"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLangFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                langFilter === l
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-300 hover:text-white border border-dark-700'
              }`}
            >
              {l === 'All' ? 'All' : l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                diffFilter === d
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-300 hover:text-white border border-dark-700'
              }`}
            >
              {d === 'All' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-dark-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="card-hover group">
              <div className="flex items-center justify-between mb-3">
                {course.icon ? (
                  <img src={course.icon} alt="" className="w-10 h-10" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-dark-400" />
                  </div>
                )}
                <span className={`badge-${course.difficulty}`}>{course.difficulty}</span>
              </div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                {course.title}
              </h3>
              <p className="text-dark-400 text-sm line-clamp-2 mb-4">
                {course.description}
              </p>
              <div className="flex items-center justify-between text-xs text-dark-500">
                <span>{course.lesson_count} lessons</span>
                <span className="font-mono">{course.language.toUpperCase()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
