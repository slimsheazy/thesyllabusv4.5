import React from 'react';
import { useSyllabusStore } from '../store';
import { useHaptics } from '../hooks/useHaptics';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ isOpen, onClick }) => {
  const { transitNotifications } = useSyllabusStore();
  const { triggerClick } = useHaptics();
  const unreadCount = transitNotifications.filter(n => !n.isRead).length;

  const handleClick = () => {
    triggerClick();
    onClick();
  };

  return (
    <button 
      onClick={handleClick}
      className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[3000] w-12 h-12 flex flex-col items-center justify-center gap-1.5 bg-archive-bg border border-archive-line rounded-lg shadow-xl hover:scale-105 transition-all group"
    >
      {unreadCount > 0 && !isOpen && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-archive-accent rounded-full border-2 border-archive-bg animate-pulse" />
      )}
      <div className={`w-6 h-0.5 bg-archive-ink transition-all ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
      <div className={`w-6 h-0.5 bg-archive-ink transition-all ${isOpen ? "opacity-0" : ""}`} />
      <div className={`w-6 h-0.5 bg-archive-ink transition-all ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
    </button>
  );
};
