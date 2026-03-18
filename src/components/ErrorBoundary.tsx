import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onGoHome?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  confirmingReset: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    confirmingReset: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, confirmingReset: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, confirmingReset: false });
  };

  private handleGoHome = () => {
    if (this.props.onGoHome) {
      this.props.onGoHome();
      this.setState({ hasError: false, error: null, confirmingReset: false });
    } else {
      window.location.href = '/';
    }
  };

  private handleEmergencyReset = async () => {
    if (!this.state.confirmingReset) {
      this.setState({ confirmingReset: true });
      return;
    }

    localStorage.clear();
    try {
      const { del } = await import('idb-keyval');
      await del('the-syllabus-state');
    } catch (e) {
      console.error("Failed to clear IndexedDB:", e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-archive-bg min-h-screen p-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md space-y-8"
          >
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-red-500/5 rounded-full animate-pulse" />
              <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-serif italic text-archive-ink">The Record is Fractured</h2>
              <p className="handwritten text-xl opacity-60 italic">
                A celestial misalignment has occurred. The archive was unable to process this resonance.
              </p>
            </div>

            <div className="p-6 border border-archive-line bg-white/50 text-left relative group">
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-2">Error Log</p>
              <p className="text-xs font-mono text-red-600/70 break-words pr-8">
                {this.state.error?.message || 'Unknown esoteric anomaly'}
              </p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(this.state.error?.stack || this.state.error?.message || 'Unknown error');
                }}
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
                title="Copy Error Stack"
              >
                <div className="text-[8px] font-mono border border-archive-ink px-1">COPY</div>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={this.handleReset}
                className="brutalist-button w-full py-4 flex items-center justify-center gap-3"
              >
                ATTEMPT RECALIBRATION
              </button>
              
              <button 
                onClick={this.handleGoHome}
                className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center justify-center gap-2 transition-opacity"
              >
                RETURN TO SANCTUM
              </button>

              <div className="pt-8 border-t border-archive-line/10">
                <button 
                  onClick={this.handleEmergencyReset}
                  className={`text-[8px] font-mono uppercase tracking-widest transition-all ${this.state.confirmingReset ? 'text-red-600 font-bold' : 'opacity-20 hover:opacity-100 hover:text-red-600'}`}
                >
                  {this.state.confirmingReset ? "ARE YOU ABSOLUTELY SURE? CLICK AGAIN TO WIPE ALL DATA" : "Emergency Reset (Clears All Data)"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
