import React from 'react';
import { ArchivedSite } from '../types';
import { X, ExternalLink, Download, Share2, Trash2, Clock, Shield, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface ArchiveDetailProps {
  site: ArchivedSite;
  onClose: () => void;
}

export const ArchiveDetail: React.FC<ArchiveDetailProps> = ({ site, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-end bg-archive-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl h-full bg-archive-bg border-l border-archive-line shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-archive-line flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-archive-line transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="subtitle-main">Archive Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-archive-line transition-colors text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="bg-archive-ink text-archive-bg px-4 py-2 flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="label-gidole">EXPORT WACZ</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <div className="aspect-video border border-archive-line overflow-hidden mb-6 group relative">
              <img 
                src={site.thumbnail} 
                alt={site.title} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-archive-ink/20">
                <button className="bg-white text-archive-ink px-6 py-3 flex items-center gap-2 shadow-xl">
                  <ExternalLink className="w-4 h-4" />
                  <span className="label-gidole">BROWSE SNAPSHOT</span>
                </button>
              </div>
            </div>

            <h1 className="text-3xl subtitle-main mb-2">{site.title}</h1>
            <div className="flex items-center gap-2 text-archive-accent font-mono text-sm">
              <Globe className="w-4 h-4" />
              <span>{site.url}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div>
                <p className="col-header mb-2">Capture Metadata</p>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-archive-line/50 pb-2">
                    <span className="data-value opacity-50">Timestamp</span>
                    <span className="data-value">{site.captureDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-archive-line/50 pb-2">
                    <span className="data-value opacity-50">Payload Size</span>
                    <span className="data-value">{site.size}</span>
                  </div>
                  <div className="flex justify-between border-b border-archive-line/50 pb-2">
                    <span className="data-value opacity-50">MIME Type</span>
                    <span className="data-value">text/html</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="col-header mb-2">Security Scan</p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="data-value text-emerald-800 text-xs uppercase">Verified Clean</p>
                    <p className="data-value text-[10px] text-emerald-700 opacity-70">No malicious scripts or trackers detected in this snapshot.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="col-header mb-2">Capture Engine</p>
                <div className="flex items-center gap-3 p-4 border border-archive-line bg-white/30">
                  <Activity className="w-5 h-5 opacity-40" />
                  <div>
                    <p className="data-value text-xs uppercase">Puppeteer v21.0</p>
                    <p className="data-value text-[10px] opacity-50">Full DOM + Resources</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="col-header mb-2">Tags & Taxonomy</p>
                <div className="flex flex-wrap gap-2">
                  {site.tags?.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-archive-line text-[10px] font-mono uppercase">
                      {tag}
                    </span>
                  ))}
                  <button className="px-2 py-1 border border-dashed border-archive-line text-[10px] font-mono uppercase opacity-50 hover:opacity-100">
                    + Add Tag
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="col-header mb-4">Version History</p>
            <div className="space-y-2">
              {[1, 2, 3].map(v => (
                <div key={v} className="flex items-center justify-between p-3 border border-archive-line hover:bg-white/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 opacity-30" />
                    <div>
                      <p className="data-value text-xs">Revision v{4-v}.0.0</p>
                      <p className="data-value text-[10px] opacity-40">Captured 2 days ago</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-archive-line bg-white/50 flex gap-4">
          <button className="flex-1 border border-archive-line py-3 hover:bg-archive-line transition-colors flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            <span className="label-gidole">SHARE ARCHIVE</span>
          </button>
          <button className="flex-1 bg-archive-ink text-archive-bg py-3 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Info className="w-4 h-4" />
            <span className="label-gidole">VIEW LOGS</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

import { Globe, Activity, ChevronRight } from 'lucide-react';
