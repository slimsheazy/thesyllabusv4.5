import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { exportAsImage, exportAsPDF } from '../../utils/exportUtils';
import { ReadAloudButton } from './ReadAloudButton';
import { useSyllabusStore } from '../../store';

import Markdown from 'react-markdown';

interface ResultSectionProps {
  id: string;
  type?: string;
  title?: string;
  content: string;
  onClose?: () => void;
  exportName: string;
  className?: string;
  children?: React.ReactNode;
  metadata?: any;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  id,
  type = "Insight",
  title,
  content,
  onClose,
  exportName,
  className = "",
  children,
  metadata
}) => {
  const { addStar, removeStar, isStarred } = useSyllabusStore();
  const starred = isStarred(id);

  const handleToggleStar = () => {
    if (starred) {
      removeStar(id);
    } else {
      addStar({
        id,
        type,
        title: title || type,
        content,
        date: new Date().toISOString(),
        metadata
      });
    }
  };

  return (
    <motion.div 
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 sm:p-10 border border-black/5 bg-white shadow-2xl rounded-2xl relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-8xl heading-marker italic uppercase pointer-events-none">
        {title || "Result"}
      </div>
      
      <div className="flex justify-between items-center mb-6 border-b-2 border-black/5 pb-4 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="handwritten text-[10px] uppercase opacity-40 tracking-widest">{type}</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleToggleStar}
            className={`text-sm transition-all ${starred ? "text-archive-accent scale-125" : "opacity-20 hover:opacity-100"}`}
          >
            {starred ? <Star className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
          </button>
          <ReadAloudButton text={content} className="!py-1 !px-2 !text-[10px]" />
        </div>
      </div>

      <div className="relative z-10">
        {children || (
          <div className="handwritten text-lg md:text-xl italic text-black/80 leading-relaxed font-medium text-left markdown-body">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-black/5 flex flex-wrap justify-center gap-8 relative z-10">
        <button 
          onClick={() => exportAsPDF(id, exportName)}
          className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
        >
          PDF
        </button>
        <button 
          onClick={() => exportAsImage(id, exportName)}
          className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
        >
          IMG
        </button>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
          >
            CLR
          </button>
        )}
      </div>
    </motion.div>
  );
};
