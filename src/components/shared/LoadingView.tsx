import React from 'react';
import { motion } from 'motion/react';

export const LoadingView: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border border-archive-ink/10 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-16 h-16 border-t border-archive-accent rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-sans opacity-40">♁</span>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="handwritten text-xl italic opacity-60">Consulting the Archive...</p>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-1 h-1 bg-archive-accent rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
