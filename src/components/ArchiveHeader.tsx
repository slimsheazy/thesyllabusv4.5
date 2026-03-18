import React from 'react';
import { Search, Plus } from 'lucide-react';

interface ArchiveHeaderProps {
  title: string;
  viewMode?: 'grid' | 'list';
  setViewMode?: (mode: 'grid' | 'list') => void;
  showViewControls?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const ArchiveHeader: React.FC<ArchiveHeaderProps> = ({ 
  title, 
  viewMode, 
  setViewMode, 
  showViewControls = false,
  searchQuery = '',
  onSearchChange
}) => {
  return (
    <header className="border-b border-archive-line p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between bg-archive-bg gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto">
        <h1 className="subtitle-main text-center sm:text-left">{title}</h1>
        
        {showViewControls && (
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 w-3 h-3" />
            <input 
              type="text" 
              placeholder="Search archives & tools..." 
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="bg-transparent border border-archive-line rounded-none py-2 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-archive-ink w-full sm:w-64 transition-colors"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
        {showViewControls && setViewMode && viewMode && (
          <div className="flex border border-archive-line">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors text-xs font-mono uppercase tracking-widest ${viewMode === 'list' ? 'bg-archive-ink text-archive-bg' : 'hover:bg-archive-line'}`}
            >
              LIST
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors text-xs font-mono uppercase tracking-widest ${viewMode === 'grid' ? 'bg-archive-ink text-archive-bg' : 'hover:bg-archive-line'}`}
            >
              GRID
            </button>
          </div>
        )}

        <button className="flex items-center gap-2 bg-archive-ink text-archive-bg px-4 py-2 hover:opacity-90 transition-opacity">
          <Plus className="w-3 h-3" />
          <span className="label-gidole">NEW CAPTURE</span>
        </button>
      </div>
    </header>
  );
};
