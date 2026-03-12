import React from 'react';
import { motion } from 'motion/react';
import { TarotCard } from '../../../data/tarotData';

interface CardDisplayProps {
  card: TarotCard;
  isFlipped?: boolean;
  isReversed?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ 
  card, 
  isFlipped = true, 
  isReversed = false, 
  onClick,
  className = "w-48 h-80"
}) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      onClick={onClick}
      className={`relative cursor-pointer perspective-1000 group ${className}`}
    >
      <motion.div 
        initial={false}
        animate={{ 
          rotateY: isFlipped ? 0 : 180,
          rotateZ: isReversed ? 180 : 0
        }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d"
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden border border-archive-line bg-white p-2 md:p-4 flex flex-col items-center justify-between shadow-lg">
          <div className="w-full flex-1 bg-archive-line overflow-hidden mb-2">
            <img src={card.image} alt={card.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
          </div>
          <div className="text-center">
            <span className="text-[8px] md:text-[10px] font-mono uppercase opacity-40">{card.arcana} arcana</span>
            <h3 className="font-serif italic text-sm md:text-lg text-archive-ink leading-tight">{card.name}</h3>
          </div>
          <div className="w-full pt-1 md:pt-2 border-t border-archive-line mt-1">
            <p className="text-[6px] md:text-[8px] font-mono uppercase tracking-widest opacity-40 text-center">the syllabus archive</p>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 border border-archive-line bg-archive-ink flex items-center justify-center shadow-lg">
          <div className="w-full h-full m-2 border border-archive-bg/20 flex items-center justify-center">
            <span className="text-4xl text-archive-bg opacity-10"></span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
