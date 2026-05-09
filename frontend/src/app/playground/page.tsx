'use client';

import { useState } from 'react';
import {
  Terminal, Play, RotateCcw, Download, ChevronDown,
} from 'lucide-react';
import CodeEditor from '@/components/editor/CodeEditor';
import MultiLanguageCompare from '@/components/playground/MultiLanguageCompare';
import MemoryVisualizer from '@/components/visualization/MemoryVisualizer';
import { executeApi } from '@/lib/api';

const LANGUAGE_OPTIONS = [
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
];

const STARTER_CODES: Record<string, string> = {
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  python: 'print("Hello, World!")',
  javascript: 'console.log("Hello, World!");',
};

export default function PlaygroundPage() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_CODES.python);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [execTime, setExecTime] = useState(0);
  const [showMulti, setShowMulti] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(STARTER_CODES[lang] || '');
    setOutput('');
    setError('');
    setShowLangMenu(false);
  };

  const handleRun = async () => {
    setLoading(true);
    setOutput('');
    setError('');
    try {
      const res = await executeApi.run({ code, language, stdin });
      setOutput(res.data.output);
      setError(res.data.error);
      setExecTime(res.data.execution_time_ms);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode(STARTER_CODES[language] || '');
    setOutput('');
    setError('');
    setStdin('');
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = { c: 'c', cpp: 'cpp', python: 'py', javascript: 'js' };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extMap[language] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.id === language);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary-400" /> Code Playground
          </h1>
          <p className="text-dark-400 text-sm mt-1">Write, run, and experiment with code in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMulti(!showMulti)}
            className={`btn-secondary text-sm ${showMulti ? 'bg-primary-600 text-white border-primary-600' : ''}`}
          >
            Multi-Language Compare
          </button>
        </div>
      </div>

      {showMulti ? (
        <MultiLanguageCompare />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700">
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center gap-2 text-sm font-medium text-white hover:text-primary-400"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    {currentLang?.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showLangMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                      <div className="absolute top-full left-0 mt-1 w-32 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-20 py-1">
                        {LANGUAGE_OPTIONS.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => handleLanguageChange(l.id)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-dark-700 ${
                              language === l.id ? 'text-primary-400 bg-dark-700' : 'text-dark-200'
                            }`}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleReset} className="btn-ghost text-xs py-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                  <button onClick={handleDownload} className="btn-ghost text-xs py-1">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleRun}
                    disabled={loading}
                    className="btn-primary text-xs py-1.5 px-4"
                  >
                    <Play className="w-3.5 h-3.5" /> {loading ? 'Running...' : 'Run'}
                  </button>
                </div>
              </div>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                height="450px"
              />
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-white mb-2">Stdin (optional)</h3>
              <textarea
                className="input font-mono text-sm"
                rows={2}
                placeholder="Input for your program..."
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Output</h3>
                {execTime > 0 && (
                  <span className="text-xs text-dark-400">{execTime.toFixed(2)}ms</span>
                )}
              </div>
              {output || error ? (
                <div className="space-y-2">
                  {output && (
                    <pre className="bg-dark-950 rounded-lg p-3 text-sm text-green-400 overflow-x-auto font-mono whitespace-pre-wrap">
                      {output}
                    </pre>
                  )}
                  {error && (
                    <pre className="bg-dark-950 rounded-lg p-3 text-sm text-red-400 overflow-x-auto font-mono whitespace-pre-wrap">
                      {error}
                    </pre>
                  )}
                </div>
              ) : (
                <p className="text-dark-500 text-sm text-center py-8">
                  Run your code to see output here
                </p>
              )}
            </div>

            <MemoryVisualizer code={code} language={language} />
          </div>
        </div>
      )}
    </div>
  );
}
