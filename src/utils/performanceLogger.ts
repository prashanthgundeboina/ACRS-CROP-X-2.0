export interface PerformanceLogEntry {
  id: string;
  timestamp: string;
  mlTimeMs: number;
  geminiTimeMs: number;
  totalTimeMs: number;
  cropCount: number;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  note: string;
}

class PerformanceLogger {
  private logs: PerformanceLogEntry[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    try {
      const stored = localStorage.getItem('croperx_perf_logs');
      if (stored) {
        this.logs = JSON.parse(stored).slice(0, 20);
      }
    } catch {
      this.logs = [];
    }
  }

  public recordLog(log: Omit<PerformanceLogEntry, 'id' | 'timestamp'>) {
    const entry: PerformanceLogEntry = {
      ...log,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString()
    };

    this.logs = [entry, ...this.logs.slice(0, 19)];
    try {
      localStorage.setItem('croperx_perf_logs', JSON.stringify(this.logs));
    } catch {
      // ignore
    }
    this.notify();
  }

  public getLogs(): PerformanceLogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('croperx_perf_logs');
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const perfLogger = new PerformanceLogger();
