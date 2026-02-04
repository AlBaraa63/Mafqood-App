/**
 * Logger Utility
 * Provides structured logging with levels
 * In production, logs only warnings and errors
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const IS_DEV = __DEV__;

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (IS_DEV) return true;
    return level === 'warn' || level === 'error';
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: any, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error, ...args);
    }
  }

  api(method: string, endpoint: string, data?: any): void {
    if (IS_DEV) {
      console.log(`[API] ${method} ${endpoint}`, data || '');
    }
  }
}

export const logger = new Logger();
export default logger;
