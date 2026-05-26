import React, { useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (value: string) => void;
}

function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search workspace…',
  className = '',
  onSearch,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const shortcutLabel = isMacPlatform() ? '⌘K' : 'Ctrl+K';

  const focusSearch = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        focusSearch();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusSearch]);

  return (
    <div className={`relative w-full min-w-0 ${className}`}>
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
        <Search size={15} aria-hidden />
      </span>
      <input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        aria-label="Search workspace"
        onChange={(e) => onSearch?.(e.target.value)}
        className="
          search-field w-full min-w-0
          pl-9 pr-[4.25rem] py-2 h-9
          text-sm text-slate-200 placeholder-slate-500
          rounded-xl border border-white/[0.06]
          bg-white/[0.04] backdrop-blur-md
          transition-all duration-200
          focus:outline-none focus:border-brand-500/35
          focus:ring-2 focus:ring-brand-500/20 focus:bg-white/[0.06]
          focus:shadow-[0_0_20px_-4px_rgba(139,92,246,0.25)]
        "
      />
      <kbd
        className="
          absolute right-2 top-1/2 -translate-y-1/2
          hidden sm:inline-flex items-center gap-0.5
          px-1.5 py-0.5 rounded-md
          text-[10px] font-medium text-slate-500
          bg-white/[0.06] border border-white/[0.08]
          pointer-events-none select-none
        "
        aria-hidden
      >
        {shortcutLabel}
      </kbd>
    </div>
  );
};
