'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Terminal, Code2, Zap, Trophy, Globe, Shield, ArrowRight, Star,
} from 'lucide-react';
import { coursesApi } from '@/lib/api';
import type { Course } from '@/types';

const features = [
  {
    icon: Terminal, title: 'Interactive Code Editor', desc: 'Write and run code in real-time with our Monaco-based editor supporting 5+ languages.',
  },
  {
    icon: Shield, title: 'Docker Sandbox', desc: 'Your code runs in isolated Docker containers - safe, secure, and resource-limited.',
  },
  {
    icon: Zap, title: 'Real-time Feedback', desc: 'Get instant compilation results, test outputs, and performance metrics.',
  },
  {
    icon: Trophy, title: 'Gamified Learning', desc: 'Earn XP, unlock badges, maintain streaks, and climb the leaderboard.',
  },
  {
    icon: Globe, title: 'Multi-Language', desc: 'Learn C, C++, Python, JavaScript, HTML, CSS - all in one platform.',
  },
  {
    icon: Star, title: 'Memory Visualization', desc: 'See exactly how pointers, arrays, and memory work with interactive visualizations.',
  },
];

const languages = [
  { name: 'C', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg', color: '#A8B9CC' },
  { name: 'C++', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg', color: '#00599C' },
  { name: 'HTML', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', color: '#E34F26' },
  { name: 'CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', color: '#1572B6' },
  { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', color: '#F7DF1E' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', color: '#3776AB' },
];

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    coursesApi.list({}).then((res) => setCourses(res.data.courses.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-6">
              <Zap className="w-4 h-4" /> Learn 5+ programming languages
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Master Coding with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400"> Interactive Learning</span>
            </h1>
            <p className="text-lg text-dark-400 mb-8 max-w-2xl mx-auto">
              CodeLang Academy offers hands-on programming courses with real-time code execution,
              Docker sandboxing, memory visualization, and gamified progression.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-lg px-8 py-3">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/courses" className="btn-secondary text-lg px-8 py-3">
                View Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            Supported Languages
          </h2>
          <div className="flex flex-wrap justify-center gap-8">
            {languages.map((lang) => (
              <div key={lang.name} className="flex flex-col items-center gap-2 group">
                <div
                  className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center p-3 group-hover:border-primary-500/50 transition-all"
                  style={{ borderColor: `${lang.color}33` }}
                >
                  <img src={lang.icon} alt={lang.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-sm font-medium text-dark-300">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            Why CodeLang Academy?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-hover">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-dark-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {courses.length > 0 && (
        <section className="py-16 border-t border-dark-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Popular Courses</h2>
              <Link href="/courses" className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="card-hover group">
                  <div className="flex items-center gap-3 mb-3">
                    {course.icon && (
                      <img src={course.icon} alt="" className="w-8 h-8" />
                    )}
                    <span className={`badge-${course.difficulty}`}>{course.difficulty}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-primary-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-dark-400 text-sm line-clamp-2 mb-3">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-dark-500">
                    <span>{course.lesson_count} lessons</span>
                    <span>{course.language.toUpperCase()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gradient-to-b from-dark-900 to-dark-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Coding Journey?
          </h2>
          <p className="text-dark-400 mb-8 text-lg">
            Join thousands of learners mastering programming languages the interactive way.
          </p>
          <Link href="/register" className="btn-primary text-lg px-10 py-3">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
