import React from 'react';
import { motion } from 'motion/react';
import { TarotCard } from '../../../data/tarotData';

interface CardDisplayProps {
  card: TarotCard;
  isFlipped?: boolean;
  isReversed?: boolean;
  onClick?: () => void;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card, isFlipped = true, isReversed = false, onClick }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="relative w-48 h-80 cursor-pointer perspective-1000 group"
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
        <div className="absolute inset-0 backface-hidden border border-archive-line bg-white p-4 flex flex-col items-center justify-between shadow-lg">
          <div className="w-full h-48 bg-archive-line overflow-hidden">
            <img src={card.image} alt={card.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
          </div>
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase opacity-40">{card.arcana} arcana</span>
            <h3 className="font-serif italic text-lg text-archive-ink">{card.name}</h3>
          </div>
          <div className="w-full pt-2 border-t border-archive-line">
            <p className="text-[8px] font-mono uppercase tracking-widest opacity-40 text-center">the syllabus archive</p>
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
