import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ToolLayoutProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  tooltipTitle?: string;
  tooltipContent?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  title,
  subtitle,
  onBack,
  tooltipTitle,
  tooltipContent,
  children,
  headerRight,
  className = ""
}) => {
  return (
    <div className={`min-h-full flex flex-col items-center justify-start py-12 px-4 md:px-8 relative max-w-7xl mx-auto pb-32 ${className}`}>
      <button 
        onClick={onBack} 
        className="fixed top-4 right-4 sm:top-8 sm:right-8 brutalist-button !text-[10px] sm:!text-sm !px-3 sm:!px-4 !py-1 z-50 bg-surface shadow-xl flex items-center gap-2"
      >
        <ChevronLeft size={14} /> Back
      </button>

      <div className="w-full flex flex-col gap-8 md:gap-12">
        <header className="space-y-4 md:space-y-6 pt-12 lg:pt-0">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="title-main text-5xl sm:text-7xl md:text-8xl">{title}</h2>
                {tooltipTitle && tooltipContent && (
                  <Tooltip title={tooltipTitle} content={tooltipContent} />
                )}
              </div>
              {subtitle && <p className="opacity-60 text-sm sm:text-base">{subtitle}</p>}
            </div>
            {headerRight && <div className="w-full md:w-auto">{headerRight}</div>}
          </div>
        </header>

        {children}
      </div>
    </div>
  );
};
