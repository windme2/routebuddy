'use client';

import { useState, useEffect } from 'react';
import { searchContacts } from '@/app/actions/contact.actions';
import { UserPlus } from 'lucide-react';

interface ContactSuggestionsProps {
  query: string;
  onSelect: (name: string) => void;
}

export default function ContactSuggestions({ query, onSelect }: ContactSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(async () => {
      if (query.trim().length > 0) {
        const results = await searchContacts(query);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (query.trim().length === 0) return null;

  return (
    <div className="py-1">
      {suggestions.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50">
            รายชื่อที่บันทึกไว้
          </div>
          {suggestions.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelect(contact.name)}
              className="w-full text-left px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-between"
            >
              <span>{contact.name}</span>
              <UserPlus size={14} className="text-zinc-400" />
            </button>
          ))}
        </>
      )}
      
      {/* Option to just use the typed name if it's not in the list (implicit) */}
    </div>
  );
}
