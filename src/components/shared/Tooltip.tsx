import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  title?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-2 align-middle">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-archive-ink/20 hover:text-archive-accent transition-colors"
        aria-label="What is this?"
      >
        <HelpCircle size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[6000] bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-white border border-archive-line shadow-2xl rounded-xl pointer-events-none"
          >
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-archive-line rotate-45" />
            {title && (
              <h4 className="text-[10px] uppercase text-archive-accent tracking-widest mb-2">
                {title}
              </h4>
            )}
            <p className="handwritten text-sm leading-relaxed text-archive-ink">
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
