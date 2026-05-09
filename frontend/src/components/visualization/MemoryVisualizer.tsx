'use client';

import { useState, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface MemoryVisualizerProps {
  code: string;
  language: string;
}

interface MemoryCell {
  address: string;
  value: string;
  color: string;
  label?: string;
}

function parseMemoryFromCode(code: string): MemoryCell[] {
  const cells: MemoryCell[] = [];
  const lines = code.split('\n');

  const pointerRegex = /int\s+\*?(\w+)\s*=\s*&?(\w+)?;?/;
  const arrayRegex = /int\s+(\w+)\s*\[\s*(\d+)\s*\]\s*=\s*\{([^}]+)\};?/;
  const mallocRegex = /int\s*\*?(\w+)\s*=\s*(?:int\s*\*)?\s*malloc\s*\(\s*(\d+)\s*\);?/;

  let baseAddress = 0x7fff0000;

  for (const line of lines) {
    const mallocMatch = line.match(mallocRegex);
    if (mallocMatch) {
      const size = parseInt(mallocMatch[2]) / 4 || 4;
      for (let i = 0; i < Math.min(size, 8); i++) {
        cells.push({
          address: `0x${(baseAddress + i * 4).toString(16).toUpperCase()}`,
          value: i === 0 ? mallocMatch[1] : '?',
          color: '#3b82f6',
          label: i === 0 ? `heap: ${mallocMatch[1]}` : undefined,
        });
      }
      baseAddress += 0x100;
    }

    const arrayMatch = line.match(arrayRegex);
    if (arrayMatch) {
      const values = arrayMatch[3].split(',').map((v) => v.trim());
      values.slice(0, 6).forEach((v, i) => {
        cells.push({
          address: `0x${(baseAddress + i * 4).toString(16).toUpperCase()}`,
          value: v,
          color: '#8b5cf6',
          label: i === 0 ? `${arrayMatch[1]}[]` : undefined,
        });
      });
      baseAddress += 0x80;
    }

    const ptrMatch = line.match(pointerRegex);
    if (ptrMatch && ptrMatch[1] && !line.includes('[')) {
      cells.push({
        address: `0x${(baseAddress).toString(16).toUpperCase()}`,
        value: ptrMatch[2] || 'null',
        color: '#10b981',
        label: ptrMatch[1],
      });
      baseAddress += 0x10;
    }
  }

  return cells.slice(0, 16);
}

export default function MemoryVisualizer({ code, language }: MemoryVisualizerProps) {
  const [show, setShow] = useState(false);
  const [activeTab, setActiveTab] = useState<'stack' | 'heap'>('stack');

  const memoryCells = useMemo(() => parseMemoryFromCode(code), [code]);

  if (language !== 'c' && language !== 'cpp') return null;

  return (
    <div className="card">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center justify-between w-full"
      >
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary-400" />
          Memory Visualization
        </h3>
        {show ? <EyeOff className="w-4 h-4 text-dark-400" /> : <Eye className="w-4 h-4 text-dark-400" />}
      </button>

      {show && (
        <div className="mt-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('stack')}
              className={`px-2 py-1 text-xs rounded ${
                activeTab === 'stack' ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300'
              }`}
            >
              Stack
            </button>
            <button
              onClick={() => setActiveTab('heap')}
              className={`px-2 py-1 text-xs rounded ${
                activeTab === 'heap' ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300'
              }`}
            >
              Heap
            </button>
          </div>

          {memoryCells.length === 0 ? (
            <p className="text-dark-500 text-xs">No variables detected. Write C/C++ code to see memory layout.</p>
          ) : (
            <div className="space-y-1 font-mono text-xs">
              <div className="grid grid-cols-3 gap-1 text-dark-500 pb-1 border-b border-dark-700">
                <span>Address</span>
                <span>Value</span>
                <span>Variable</span>
              </div>
              {memoryCells.map((cell, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-1 py-1 border-b border-dark-700/50 hover:bg-dark-700/50"
                >
                  <span className="text-dark-400">{cell.address}</span>
                  <span className="text-white" style={{ color: cell.color }}>{cell.value}</span>
                  <span className="text-dark-400 truncate">{cell.label || '-'}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Pointer</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Array</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Heap</span>
          </div>
        </div>
      )}
    </div>
  );
}
