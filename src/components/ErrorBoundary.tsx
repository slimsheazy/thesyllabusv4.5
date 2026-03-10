import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
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
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-red-500/5 rounded-full animate-pulse" />
              <AlertTriangle className="w-full h-full text-red-500 opacity-20 absolute inset-0" />
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-serif italic text-archive-ink">The Record is Fractured</h2>
              <p className="handwritten text-xl opacity-60 italic">
                A celestial misalignment has occurred. The archive was unable to process this resonance.
              </p>
            </div>

            <div className="p-6 border border-archive-line bg-white/50 text-left">
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-2">Error Log</p>
              <p className="text-xs font-mono text-red-600/70 break-words">
                {this.state.error?.message || 'Unknown esoteric anomaly'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={this.handleReset}
                className="brutalist-button w-full py-4 flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-4 h-4" />
                ATTEMPT RECALIBRATION
              </button>
              
              <button 
                onClick={this.handleGoHome}
                className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 hover:opacity-100 flex items-center justify-center gap-2 transition-opacity"
              >
                <Home className="w-3 h-3" />
                RETURN TO SANCTUM
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
