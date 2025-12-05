'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopWindowProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  defaultWidth?: number;
  defaultHeight?: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
}

export function DesktopWindow({
  id,
  title,
  icon,
  children,
  isOpen,
  isMinimized,
  isMaximized,
  zIndex,
  defaultWidth = 800,
  defaultHeight = 600,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
}: DesktopWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 100, y: 50 });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Center window on first open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const centerX = Math.max(50, (window.innerWidth - defaultWidth) / 2);
      const centerY = Math.max(30, (window.innerHeight - defaultHeight - 48) / 3);
      setPosition({ x: centerX, y: centerY });
    }
  }, [isOpen, defaultWidth, defaultHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    onFocus();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isMaximized) {
      setPosition({
        x: Math.max(0, e.clientX - dragOffset.x),
        y: Math.max(0, e.clientY - dragOffset.y),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset]);

  if (!isOpen) return null;

  // Use a higher z-index when maximized to ensure it's above desktop elements
  const effectiveZIndex = isMaximized ? 900 : zIndex;

  return (
    <div
      ref={windowRef}
      className={cn(
        'fixed flex flex-col transition-all duration-200',
        isMinimized && 'opacity-0 pointer-events-none scale-95',
        isMaximized ? 'inset-0 !w-full !h-[calc(100vh-48px)]' : '',
        isDragging && 'cursor-grabbing select-none'
      )}
      style={{
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        width: isMaximized ? '100%' : size.width,
        height: isMaximized ? 'calc(100vh - 48px)' : size.height,
        zIndex: effectiveZIndex,
      }}
      onClick={onFocus}
    >
      {/* Window Frame */}
      <div className="flex flex-col h-full bg-[#f5f0f7] rounded-t-lg overflow-hidden shadow-[0_8px_32px_rgba(139,123,168,0.25),0_4px_16px_rgba(139,123,168,0.2),inset_-1px_-1px_#b8a8c5,inset_1px_1px_#ffffff,inset_-2px_-2px_#d5c8de,inset_2px_2px_#faf8fc]">
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-[#b4a7d6] to-[#d5a6bd] cursor-grab active:cursor-grabbing select-none rounded-t-lg"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            {icon && <span className="text-white drop-shadow-sm">{icon}</span>}
            <span className="text-white font-semibold text-sm drop-shadow-sm">{title}</span>
          </div>
          <div className="window-controls flex items-center gap-1">
            <button
              onClick={onMinimize}
              className="w-6 h-6 flex items-center justify-center rounded bg-[#ffeaa7] hover:bg-[#fdcb6e] transition-colors shadow-sm"
              title="Minimize"
            >
              <Minus className="w-3 h-3 text-[#5a5a5a]" />
            </button>
            <button
              onClick={onMaximize}
              className="w-6 h-6 flex items-center justify-center rounded bg-[#b5ead7] hover:bg-[#88d8b0] transition-colors shadow-sm"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? (
                <Square className="w-3 h-3 text-[#5a5a5a]" />
              ) : (
                <Maximize2 className="w-3 h-3 text-[#5a5a5a]" />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded bg-[#ffb7b2] hover:bg-[#ff8fab] transition-colors shadow-sm"
              title="Close"
            >
              <X className="w-3 h-3 text-[#5a5a5a]" />
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center gap-1 px-2 py-1 bg-[#f5f0f7] border-b border-[#e8e0ed]">
          <button className="px-3 py-1 text-xs text-[#5a5a5a] hover:bg-[#e8e0ed] rounded transition-colors">
            File
          </button>
          <button className="px-3 py-1 text-xs text-[#5a5a5a] hover:bg-[#e8e0ed] rounded transition-colors">
            Edit
          </button>
          <button className="px-3 py-1 text-xs text-[#5a5a5a] hover:bg-[#e8e0ed] rounded transition-colors">
            View
          </button>
          <button className="px-3 py-1 text-xs text-[#5a5a5a] hover:bg-[#e8e0ed] rounded transition-colors">
            Help
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-[#fff9fb] to-[#fef3f0]">
          {children}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#f5f0f7] border-t border-[#e8e0ed] text-xs text-[#8b7b9b]">
          <span>Ready</span>
          <span>{title}</span>
        </div>
      </div>
    </div>
  );
}
