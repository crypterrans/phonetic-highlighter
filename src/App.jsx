import React, { useState, useMemo } from 'react';
import config from './phoneticsConfig.json';

// Sort longest patterns first so longer matches take priority (e.g. "tious" before "ous")
const allRules = [...config].sort((a, b) => b.pattern.length - a.pattern.length);

function App() {
  const [rawLyrics, setRawLyrics] = useState('');
  const [fontSize, setFontSize] = useState(32);

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 4, 72));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 4, 16));

  const highlightStyle = (rule) => ({
    backgroundColor: rule.bg,
    color: rule.text,
    borderRadius: '4px',
    padding: '0 2px',
  });

  // Compute only the rules that actually appear in the current text
  const activeRules = useMemo(() => {
    if (!rawLyrics) return [];
    const patternString = allRules.map(r => r.pattern).join('|');
    const regex = new RegExp(patternString, 'gi');
    const matches = rawLyrics.match(regex) || [];
    const foundPatterns = new Set(matches.map(m => m.toLowerCase()));
    return allRules.filter(r => foundPatterns.has(r.pattern.toLowerCase()));
  }, [rawLyrics]);

  const parseLyrics = () => {
    if (!rawLyrics) {
      return <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Paste lyrics here to see the magic...</span>;
    }

    const patternString = allRules.map(r => r.pattern).join('|');
    const regex = new RegExp(`(${patternString})`, 'gi');
    const parts = rawLyrics.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;
      const matchedRule = allRules.find(r => r.pattern.toLowerCase() === part.toLowerCase());
      if (matchedRule) {
        return (
          <span key={index} style={highlightStyle(matchedRule)} title={matchedRule.label}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6 font-sans">

      {/* Header */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 tracking-tight text-center mb-4 md:mb-0">
          Phonetic Highlighter
        </h1>

        <div className="flex items-center space-x-2 bg-gray-700 rounded-xl p-1 border border-gray-600">
          <button onClick={decreaseFontSize} className="px-4 py-1 text-xl font-black text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
            A-
          </button>
          <span className="text-sm font-bold text-gray-400 px-2">{fontSize}px</span>
          <button onClick={increaseFontSize} className="px-4 py-1 text-xl font-black text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
            A+
          </button>
        </div>
      </header>

      {/* Main Content: Input + Output side by side */}
      <main className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 mb-8">

        {/* Left: Input */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-6">
          <h2 className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-4">Input Lyrics</h2>
          <textarea
            value={rawLyrics}
            onChange={(e) => setRawLyrics(e.target.value)}
            placeholder="Paste your song lyrics or text here..."
            className="flex-grow w-full bg-gray-900 text-gray-300 p-4 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-lg"
            style={{ minHeight: '480px' }}
          />
        </div>

        {/* Right: Output */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-6 overflow-auto" style={{ minHeight: '480px' }}>
          <h2 className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-4">Highlighted Output</h2>
          <div
            className="whitespace-pre-wrap leading-relaxed transition-all duration-300 text-white"
            style={{ fontSize: `${fontSize}px` }}
          >
            {parseLyrics()}
          </div>
        </div>
      </main>

      {/* Legend: only shows patterns found in the current text */}
      <div className="w-full max-w-7xl bg-gray-800 rounded-3xl shadow-xl border border-gray-700 p-6">
        <h3 className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-5 border-b border-gray-700 pb-3">
          Phonetics Found in Text {activeRules.length > 0 && <span className="text-purple-400 ml-2">({activeRules.length} patterns)</span>}
        </h3>

        {activeRules.length === 0 ? (
          <p className="text-gray-500 italic">Phonetic patterns detected in your text will appear here...</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {activeRules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                <span style={highlightStyle(rule)} className="text-sm font-semibold">
                  {rule.pattern}
                </span>
                <span className="text-sm font-medium text-gray-300">{rule.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
