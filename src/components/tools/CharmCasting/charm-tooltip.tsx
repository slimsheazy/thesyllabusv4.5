import React from 'react';
import { motion } from 'motion/react';
import { Charm } from '../../../types';

interface CharmTooltipProps {
  charm: Charm;
  position: { x: number; y: number };
  houseInfo?: { houseNumber: number; houseName: string; houseKeyword: string };
  onClose: () => void;
}

export const CharmTooltip: React.FC<CharmTooltipProps> = ({ charm, position, houseInfo, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-[100] bg-archive-bg border border-archive-line p-4 rounded-lg shadow-2xl max-w-xs"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-archive-ink">{charm.name}</h3>
        <button onClick={onClose} className="text-archive-ink/50 hover:text-archive-ink">×</button>
      </div>
      <p className="text-sm text-archive-ink/70 mb-3">{charm.description}</p>
      {houseInfo && (
        <div className="pt-3 border-t border-archive-line">
          <p className="text-[10px] uppercase tracking-widest text-archive-ink/40 mb-1">House {houseInfo.houseNumber}: {houseInfo.houseName}</p>
          <p className="text-xs italic text-archive-accent">"{houseInfo.houseKeyword}"</p>
        </div>
      )}
    </motion.div>
  );
};
