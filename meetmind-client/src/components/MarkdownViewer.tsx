import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useStore();

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    addToast('Copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <strong key={index} className="font-semibold text-slate-900 dark:text-white">{part}</strong>
      ) : (
        part
      )
    );
  };

  const renderContent = () => {
    if (!content) {
      return <p className="text-slate-500 italic text-sm">No content available yet.</p>;
    }

    const lines = content.split('\n');
    let insideCode = false;
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        insideCode = !insideCode;
        return;
      }

      if (insideCode) {
        elements.push(
          <pre key={`code-${index}`} className="bg-slate-100 dark:bg-slate-950/80 p-3 rounded-lg border border-slate-200 dark:border-white/5 font-mono text-sm text-brand-600 dark:text-brand-300 my-2 overflow-x-auto">
            <code>{line}</code>
          </pre>
        );
        return;
      }

      if (trimmed.startsWith('###')) {
        elements.push(
          <h4 key={index} className="text-base font-semibold text-slate-900 dark:text-white mt-4 mb-2">
            {trimmed.replace(/^###\s*/, '')}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('##')) {
        elements.push(
          <h3 key={index} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2 border-b border-slate-200 dark:border-white/5 pb-1">
            {trimmed.replace(/^##\s*/, '')}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('#')) {
        elements.push(
          <h2 key={index} className="text-xl font-extrabold text-brand-400 mt-6 mb-3">
            {trimmed.replace(/^#\s*/, '')}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('>')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-brand-500 bg-brand-500/5 px-4 py-2 my-3 rounded-r-lg italic text-slate-600 dark:text-slate-300 text-sm">
            {trimmed.replace(/^>\s*/, '')}
          </blockquote>
        );
        return;
      }

      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        elements.push(
          <li key={index} className="list-disc list-inside text-slate-600 dark:text-slate-300 ml-2 mb-1.5 text-sm">
            {parseBoldText(trimmed.replace(/^[-*]\s*/, ''))}
          </li>
        );
        return;
      }

      if (/^\d+\./.test(trimmed)) {
        elements.push(
          <li key={index} className="list-decimal list-inside text-slate-300 ml-2 mb-1.5 text-sm">
            {parseBoldText(trimmed.replace(/^\d+\.\s*/, ''))}
          </li>
        );
        return;
      }

      if (trimmed === '') {
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      elements.push(
        <p key={index} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2 text-sm">
          {parseBoldText(trimmed)}
        </p>
      );
    });

    return elements;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="relative group rounded-2xl bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-5 sm:p-6 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
    >
      <button
        type="button"
        onClick={handleCopy}
        disabled={!content}
        className="
          absolute top-4 right-4 p-2 rounded-xl
          bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700
          text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white
          opacity-100 sm:opacity-0 sm:group-hover:opacity-100
          transition-all duration-200
          disabled:opacity-30 focus-visible:opacity-100
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30
        "
        aria-label="Copy content"
      >
        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
      </button>
      <div className="prose prose-invert max-w-none pr-10">{renderContent()}</div>
    </motion.div>
  );
};
