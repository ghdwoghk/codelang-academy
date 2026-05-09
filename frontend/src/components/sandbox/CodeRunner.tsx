'use client';

import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { executeApi } from '@/lib/api';

interface CodeRunnerProps {
  code: string;
  language: string;
  onResult?: (result: any) => void;
}

export default function CodeRunner({ code, language, onResult }: CodeRunnerProps) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await executeApi.run({ code, language });
      setResult(res.data);
      onResult?.(res.data);
    } catch (err: any) {
      setResult({ output: '', error: err.response?.data?.detail || 'Run failed', exit_code: 1, execution_time_ms: 0, memory_used_kb: 0 });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleRun}
        disabled={running}
        className="btn-primary text-sm"
      >
        {running ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
        ) : (
          <><Play className="w-4 h-4" /> Run Code</>
        )}
      </button>

      {result && (
        <div className="bg-dark-950 rounded-lg p-3 font-mono text-sm space-y-2">
          {result.output && (
            <pre className="text-green-400 whitespace-pre-wrap">{result.output}</pre>
          )}
          {result.error && (
            <pre className="text-red-400 whitespace-pre-wrap">{result.error}</pre>
          )}
          <div className="text-xs text-dark-500 flex gap-3">
            <span>Exit: {result.exit_code}</span>
            <span>Time: {result.execution_time_ms.toFixed(2)}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}
