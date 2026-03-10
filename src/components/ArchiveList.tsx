import React from 'react';
import { ArchivedSite } from '../types';
import { ExternalLink, MoreVertical } from 'lucide-react';

interface ArchiveListProps {
  archives: ArchivedSite[];
  onSelect: (site: ArchivedSite) => void;
}

export const ArchiveList: React.FC<ArchiveListProps> = ({ archives, onSelect }) => {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[40px_1.5fr_1fr_1fr] p-4 border-b border-archive-line bg-archive-line/20">
        <div className="col-header">#</div>
        <div className="col-header">Target URL / Title</div>
        <div className="col-header">Capture Date</div>
        <div className="col-header">Size / Status</div>
      </div>

      {archives?.map((site, index) => (
        <div key={site.id} className="data-row group" onClick={() => onSelect(site)}>
          <div className="data-value opacity-40">{String(index + 1).padStart(2, '0')}</div>
          
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{site.title}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
            </div>
            <span className="data-value text-xs opacity-50 truncate">{site.url}</span>
          </div>

          <div className="data-value opacity-80 flex items-center">
            {site.captureDate}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="data-value">{site.size}</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  site.status === 'complete' ? 'bg-emerald-500' : 
                  site.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span className="text-[10px] uppercase font-mono tracking-tighter opacity-60">
                  {site.status}
                </span>
              </div>
            </div>
            <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-archive-line">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
