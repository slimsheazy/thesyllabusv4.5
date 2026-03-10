import React from 'react';
import { motion } from 'motion/react';
import { SabianSymbol } from '../../data/sabianData';

interface SymbolCardProps {
  symbol: SabianSymbol;
  onClick?: () => void;
}

export const SymbolCard: React.FC<SymbolCardProps> = ({ symbol, onClick }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="p-6 border border-archive-line bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="data-value text-archive-accent">{symbol.degree}° {symbol.sign.toUpperCase()}</span>
        <span className="text-[10px] font-mono opacity-20 group-hover:opacity-100 transition-opacity"></span>
      </div>
      <p className="font-serif italic text-lg leading-relaxed text-archive-ink">
        "{symbol.symbol}"
      </p>
    </motion.div>
  );
};
