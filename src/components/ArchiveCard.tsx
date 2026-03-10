import React from 'react';
import { ArchivedSite } from '../types';
import { ExternalLink, Calendar, HardDrive } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface ArchiveCardProps {
  site: ArchivedSite;
  onClick: () => void;
}

export const ArchiveCard: React.FC<ArchiveCardProps> = ({ site, onClick }) => {
  const { triggerRustle } = useHaptics();

  const handleClick = () => {
    triggerRustle();
    onClick();
  };

  return (
    <div 
      onClick={handleClick}
      className="group border border-archive-line bg-white/50 hover:bg-archive-ink hover:text-archive-bg transition-all duration-300 flex flex-col cursor-pointer"
    >
      <div className="aspect-video relative overflow-hidden border-b border-archive-line">
        <img 
          src={site.thumbnail} 
          alt={site.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {site.tags?.map(tag => (
            <span key={tag} className="text-[9px] font-mono bg-archive-ink/80 text-archive-bg px-1.5 py-0.5 uppercase">
              {tag}
            </span>
          ))}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${
          site.status === 'complete' ? 'bg-emerald-500' : 
          site.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
        }`} />
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-kollektif font-bold uppercase text-base leading-tight group-hover:text-archive-bg transition-colors tracking-wide-custom">
            {site.title}
          </h3>
          <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100" />
        </div>

        <p className="label-gidole text-[10px] opacity-50 truncate group-hover:opacity-70">
          {site.url}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-archive-line/50 group-hover:border-archive-bg/20">
          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100">
            <Calendar className="w-3 h-3" />
            <span className="data-value text-[10px]">{site.captureDate.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100">
            <HardDrive className="w-3 h-3" />
            <span className="data-value text-[10px]">{site.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
