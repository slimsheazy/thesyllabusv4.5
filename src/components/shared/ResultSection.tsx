import React from 'react';
import { motion } from 'motion/react';
import { FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { exportAsImage, exportAsPDF } from '../../utils/exportUtils';
import { ReadAloudButton } from '../ReadAloudButton';

interface ResultSectionProps {
  id: string;
  title?: string;
  content: string;
  onClose?: () => void;
  exportName: string;
  className?: string;
  children?: React.ReactNode;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  id,
  title,
  content,
  onClose,
  exportName,
  className = "",
  children
}) => {
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
          <span className="handwritten text-[10px] uppercase opacity-40 tracking-widest">Insight</span>
        </div>
        <ReadAloudButton text={content} className="!py-1 !px-2 !text-[10px]" />
      </div>

      <div className="relative z-10">
        {children || (
          <p className="handwritten text-lg md:text-xl italic text-black/80 leading-relaxed font-medium text-left">
            {content}
          </p>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-black/5 flex flex-wrap justify-center gap-8 relative z-10">
        <button 
          onClick={() => exportAsPDF(id, exportName)}
          className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
        >
          <FileText className="w-3 h-3" />
          Export PDF
        </button>
        <button 
          onClick={() => exportAsImage(id, exportName)}
          className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
        >
          <ImageIcon className="w-3 h-3" />
          Export Image
        </button>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </motion.div>
  );
};
