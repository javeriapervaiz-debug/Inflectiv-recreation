'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopIconProps {
  icon: LucideIcon;
  label: string;
  color: string;
  onClick: () => void;
  isSelected?: boolean;
}

export function DesktopIcon({ icon: Icon, label, color, onClick, isSelected }: DesktopIconProps) {
  return (
    <button
      onClick={onClick}
      onDoubleClick={onClick}
      className={cn(
        'desktop-icon group',
        isSelected && 'selected'
      )}
    >
      <div
        className="desktop-icon-image"
        style={{ background: color }}
      >
        <Icon className="w-8 h-8 text-white drop-shadow-sm" />
      </div>
      <span className="desktop-icon-label">{label}</span>
    </button>
  );
}
