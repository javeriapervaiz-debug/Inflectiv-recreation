'use client';

import { useState, useEffect } from 'react';
import { Sparkles, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WindowInfo {
  id: string;
  title: string;
  icon: React.ReactNode;
  isMinimized: boolean;
}

interface TaskbarProps {
  windows: WindowInfo[];
  activeWindowId: string | null;
  onWindowClick: (id: string) => void;
  onStartClick?: () => void;
  userName?: string;
  onLogout?: () => void;
}

export function Taskbar({
  windows,
  activeWindowId,
  onWindowClick,
  onStartClick,
  userName,
  onLogout,
}: TaskbarProps) {
  const [time, setTime] = useState('');
  const [showStartMenu, setShowStartMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Start Menu */}
      {showStartMenu && (
        <div
          className="fixed bottom-[48px] left-2 w-64 bg-[#f5f0f7] rounded-t-lg shadow-[0_-4px_20px_rgba(139,123,168,0.25)] z-[1001] overflow-hidden"
          style={{ boxShadow: 'inset -1px -1px #b8a8c5, inset 1px 1px #ffffff, 0 -4px 20px rgba(139,123,168,0.25)' }}
        >
          {/* User Header */}
          <div className="p-4 bg-gradient-to-r from-[#b4a7d6] to-[#d5a6bd]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{userName || 'User'}</p>
                <p className="text-white/70 text-xs">Welcome back!</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                setShowStartMenu(false);
                onLogout?.();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#5a5a5a] hover:bg-[#ffb7b2]/30 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="taskbar">
        {/* Start Button */}
        <button
          onClick={() => setShowStartMenu(!showStartMenu)}
          className={cn(
            'taskbar-start-button',
            showStartMenu && 'shadow-[inset_1px_1px_#88d8b0,inset_-1px_-1px_#ffffff,inset_2px_2px_#a8e6cf,inset_-2px_-2px_#c7f5de]'
          )}
        >
          <Sparkles className="w-4 h-4" />
          <span>Start</span>
        </button>

        {/* Window Items */}
        <div className="taskbar-items">
          {windows.filter(w => !w.isMinimized || true).map((window) => (
            <button
              key={window.id}
              onClick={() => onWindowClick(window.id)}
              className={cn(
                'taskbar-item',
                activeWindowId === window.id && !windows.find(w => w.id === window.id)?.isMinimized && 'active'
              )}
            >
              {window.icon}
              <span className="truncate">{window.title}</span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="taskbar-tray">
          <div className="w-2 h-2 rounded-full bg-[#b5ead7] animate-pulse" title="Connected" />
          <span>{time}</span>
        </div>
      </div>

      {/* Click outside to close start menu */}
      {showStartMenu && (
        <div
          className="fixed inset-0 z-[1000]"
          onClick={() => setShowStartMenu(false)}
        />
      )}
    </>
  );
}
