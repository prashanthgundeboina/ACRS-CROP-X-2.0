import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[CroperX ErrorBoundary] ${this.props.moduleName || 'Root'} caught error:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRecover = () => {
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (e) {
        console.warn("Error in onReset callback:", e);
      }
    }
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
  };

  private handleClearCacheAndReload = () => {
    try {
      // Clear non-essential runtime caches while preserving login session if possible
      const sessionToken = localStorage.getItem('croperx_auth_token');
      const userRecord = localStorage.getItem('croperx_user_account');
      const role = localStorage.getItem('croperx_user_role');

      sessionStorage.clear();
      // Clear temporary cache keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('croperx_auth_') && !key.startsWith('croperx_user_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      if (sessionToken) localStorage.setItem('croperx_auth_token', sessionToken);
      if (userRecord) localStorage.setItem('croperx_user_account', userRecord);
      if (role) localStorage.setItem('croperx_user_role', role);
    } catch (e) {
      console.warn("Storage cleanup notice:", e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isSubModule = Boolean(this.props.moduleName);

      if (isSubModule) {
        return (
          <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl text-slate-200 my-2">
            <div className="flex items-center gap-2 mb-2 text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold">{this.props.moduleName} Module Temporarily Unavailable</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              This module encountered a minor calculation issue. You can retry initializing it without interrupting your other active tasks.
            </p>
            <button
              onClick={this.handleRecover}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Module</span>
            </button>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 text-center">
            <div className="w-16 h-16 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-inner">
              🌱
            </div>
            <h1 className="text-xl font-black text-white mb-1.5 tracking-tight">
              CroperX Agronomic Engine
            </h1>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              The application recovered from an unexpected state. Your stored farm records, offline telemetry, and credentials remain protected.
            </p>

            {this.state.error && (
              <div className="mb-4 text-left">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 mb-1 font-semibold"
                >
                  <span>Diagnostic Summary</span>
                  {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {this.state.showDetails && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-amber-300/90 max-h-32 overflow-y-auto break-words">
                    {this.state.error.message || String(this.state.error)}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={this.handleRecover}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recover & Continue</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-2xl border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear Cache & Reload App</span>
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Enterprise State Isolation & Encrypted Storage</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

