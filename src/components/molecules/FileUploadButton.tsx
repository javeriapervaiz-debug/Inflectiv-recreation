'use client';

import { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  accept?: string;
}

export function FileUploadButton({
  onFileSelect,
  disabled = false,
  accept = '.pdf,.txt,.md,.csv',
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'p-3 rounded-xl border transition-all duration-200',
          'hover:bg-neon-green/10 hover:border-neon-green/50 hover:shadow-neon-sm',
          'focus:outline-none focus:ring-2 focus:ring-neon-green/50',
          disabled
            ? 'opacity-50 cursor-not-allowed border-gray-700 text-gray-600'
            : 'border-gray-700 text-gray-400 hover:text-neon-green'
        )}
        title="Upload a file (PDF, TXT, MD, CSV)"
      >
        <Paperclip className="w-5 h-5" />
      </button>
    </>
  );
}
