/**
 * Centralized logging utility
 * Replaces console.log with proper logging that respects environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error'
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    
    if (data) {
      return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`
    }
    return `${prefix} ${message}`
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data))
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data))
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data))
    }
  }

  error(message: string, error?: Error | unknown, data?: any): void {
    if (this.shouldLog('error')) {
      const errorDetails = error instanceof Error 
        ? { message: error.message, stack: error.stack }
        : error
      
      console.error(this.formatMessage('error', message, { error: errorDetails, ...data }))
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export type for use in other files
export type { LogLevel }

