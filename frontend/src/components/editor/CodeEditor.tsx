'use client';

import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <LoadingSpinner size="md" />,
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  c: 'c',
  cpp: 'cpp',
  python: 'python',
  javascript: 'javascript',
  html: 'html',
  css: 'css',
};

export default function CodeEditor({
  value,
  onChange,
  language = 'python',
  height = '300px',
  readOnly = false,
}: CodeEditorProps) {
  const monacoLanguage = LANGUAGE_MAP[language] || 'python';

  return (
    <MonacoEditor
      height={height}
      language={monacoLanguage}
      value={value}
      onChange={(val) => onChange(val || '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        readOnly,
        wordWrap: 'on',
        padding: { top: 8 },
      }}
    />
  );
}
