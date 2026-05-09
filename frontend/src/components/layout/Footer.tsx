import { Terminal, Github, Twitter, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Terminal className="w-6 h-6 text-primary-400" />
              <span className="text-lg font-bold text-white">
                Code<span className="text-primary-400">Lang</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm max-w-md">
              Master C, C++, HTML, CSS, JavaScript, Python and more with interactive lessons,
              real-time code execution, and gamified learning.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Learn</h3>
            <div className="space-y-2 text-sm text-dark-400">
              <Link href="/courses" className="block hover:text-white transition-colors">Courses</Link>
              <Link href="/playground" className="block hover:text-white transition-colors">Playground</Link>
              <Link href="/leaderboard" className="block hover:text-white transition-colors">Leaderboard</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Community</h3>
            <div className="space-y-2 text-sm text-dark-400">
              <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
                <Github className="w-4 h-4" /> GitHub
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" /> Twitter
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> Contact
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-dark-700 text-center text-sm text-dark-500">
          &copy; {new Date().getFullYear()} CodeLang Academy. Built with Next.js &amp; FastAPI.
        </div>
      </div>
    </footer>
  );
}
