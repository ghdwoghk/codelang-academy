'use client';

import { useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import CodeEditor from '@/components/editor/CodeEditor';
import { executeApi } from '@/lib/api';

const DEFAULT_CODES: Record<string, string> = {
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
  python: 'print("Hello from Python!")',
  javascript: 'console.log("Hello from JavaScript!");',
};

interface RunResult {
  language: string;
  output: string;
  error: string;
  execution_time_ms: number;
}

export default function MultiLanguageCompare() {
  const [codes, setCodes] = useState<Record<string, string>>({ ...DEFAULT_CODES });
  const [results, setResults] = useState<RunResult[]>([]);
  const [running, setRunning] = useState(false);

  const runAll = async () => {
    setRunning(true);
    setResults([]);
    const newResults: RunResult[] = [];

    for (const [lang, code] of Object.entries(codes)) {
      try {
        const res = await executeApi.run({ code, language: lang });
        newResults.push({
          language: lang,
          output: res.data.output || '(no output)',
          error: res.data.error,
          execution_time_ms: res.data.execution_time_ms,
        });
      } catch (err: any) {
        newResults.push({
          language: lang,
          output: '',
          error: err.response?.data?.detail || 'Execution failed',
          execution_time_ms: 0,
        });
      }
    }
    setResults(newResults);
    setRunning(false);
  };

  const resetCode = (lang: string) => {
    setCodes((prev) => ({ ...prev, [lang]: DEFAULT_CODES[lang] || '' }));
  };

  const langs = Object.keys(codes);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Multi-Language Compare</h3>
          <p className="text-dark-400 text-sm">See how the same logic works in different languages</p>
        </div>
        <button
          onClick={runAll}
          disabled={running}
          className="btn-primary"
        >
          <Play className="w-4 h-4" /> {running ? 'Running...' : 'Run All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {langs.map((lang) => (
          <div key={lang} className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-dark-800 border-b border-dark-700">
              <span className="text-xs font-bold text-primary-400 uppercase">{lang}</span>
              <button
                onClick={() => resetCode(lang)}
                className="text-dark-500 hover:text-red-400 transition-colors"
                title="Reset code"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <CodeEditor
              value={codes[lang]}
              onChange={(v) => setCodes((prev) => ({ ...prev, [lang]: v }))}
              language={lang}
              height="200px"
            />
            {results.find((r) => r.language === lang) && (
              <div className="p-3 border-t border-dark-700 bg-dark-900">
                <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">
                  {results.find((r) => r.language === lang)?.output || results.find((r) => r.language === lang)?.error}
                </pre>
                <p className="text-xs text-dark-500 mt-1">
                  {results.find((r) => r.language === lang)?.execution_time_ms.toFixed(2)}ms
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
