import React from 'react';
import { Search, Plus, Filter, LayoutGrid, List } from 'lucide-react';

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
    <header className="border-b border-archive-line p-6 flex items-center justify-between bg-archive-bg">
      <div className="flex items-center gap-8">
        <h1 className="subtitle-main">{title}</h1>
        
        {showViewControls && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input 
              type="text" 
              placeholder="Search archives & tools..." 
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="bg-transparent border border-archive-line rounded-none py-2 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-archive-ink w-64 transition-colors"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showViewControls && setViewMode && viewMode && (
          <div className="flex border border-archive-line">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-archive-ink text-archive-bg' : 'hover:bg-archive-line'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-archive-ink text-archive-bg' : 'hover:bg-archive-line'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        )}

        <button className="flex items-center gap-2 bg-archive-ink text-archive-bg px-4 py-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          <span className="label-gidole">NEW CAPTURE</span>
        </button>
      </div>
    </header>
  );
};
