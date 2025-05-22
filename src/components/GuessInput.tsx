'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface GuessInputProps {
  onSubmit: (guess: string) => void;
  suggestions: { title: string; artist: string }[];
  disabled?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
}

export function GuessInput({ onSubmit, suggestions, disabled, onSkip, skipLabel }: GuessInputProps) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<{ title: string; artist: string }[]>(suggestions);
  const [selected, setSelected] = useState<{ title: string; artist: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setFiltered(
      suggestions.filter(s =>
        s.title.toLowerCase().includes(value.toLowerCase())
      )
    );
    setSelected(null);
  };

  const handleSelect = (title: string) => {
    const found = suggestions.find(s => s.title === title);
    setQuery(title);
    setSelected(found || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      onSubmit(selected.title);
      setQuery('');
      setSelected(null);
      setFiltered(suggestions);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelected(null);
    setFiltered(suggestions);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex flex-col">
        {/* Autocomplete dropdown above input */}
        {query && filtered.length > 0 && (
          <ul className="absolute bottom-full mb-2 left-0 w-full bg-white text-black border border-gray-200 rounded shadow max-h-48 overflow-y-auto z-20">
            {filtered.map((s, idx) => (
              <li
                key={s.title + s.artist + idx}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(s.title)}
              >
                <span className="font-semibold text-black">{s.title}</span> <span className="text-xs text-gray-500">{s.artist}</span>
              </li>
            ))}
          </ul>
        )}
        {/* Input with icons */}
        <div className="flex items-center bg-[#18181b] border border-[#23232a] rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-[#a78bfa]">
          <Search className="w-5 h-5 text-white/60 mr-2" />
          <input
            type="text"
            placeholder="Know it? Search for the title"
            value={query}
            onChange={handleChange}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none text-white placeholder:text-white/60 text-lg"
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={handleClear} className="ml-2 text-white/60 hover:text-white focus:outline-none">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      {/* Buttons below input */}
      <div className="flex items-center justify-between mt-3">
        <Button
          type="button"
          variant="secondary"
          className="h-12 px-4 bg-[#23232a] text-white border border-[#23232a] hover:bg-[#2d2d36] font-bold tracking-widest"
          disabled={disabled}
          onClick={onSkip}
        >
          {skipLabel || 'SKIP'}
        </Button>
        <Button
          type="submit"
          className="h-12 px-8 bg-[#a78bfa] text-white font-bold text-lg rounded-md shadow hover:bg-[#7c3aed] ml-4"
          disabled={disabled || !selected}
        >
          SUBMIT
        </Button>
      </div>
    </form>
  );
} 