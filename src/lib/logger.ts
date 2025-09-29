type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  installationId?: string | number;
  repositoryId?: string;
  jobId?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;

    return level === "warn" || level === "error";
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog("debug")) {
      // biome-ignore lint/suspicious/noConsole: Logger intentionally uses console
      console.debug(this.formatMessage("debug", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog("info")) {
      // biome-ignore lint/suspicious/noConsole: Logger intentionally uses console
      console.info(this.formatMessage("info", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog("warn")) {
      // biome-ignore lint/suspicious/noConsole: Logger intentionally uses console
      console.warn(this.formatMessage("warn", message, context));
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog("error")) {
      const errorDetails = error ? `\nError: ${error.message}\nStack: ${error.stack}` : "";
      // biome-ignore lint/suspicious/noConsole: Logger intentionally uses console
      console.error(this.formatMessage("error", message, context) + errorDetails);
    }
  }

  trpc(path: string, duration: number, error?: Error): void {
    if (error) {
      this.error(`tRPC failed on ${path}: ${error.message}`, error);
    } else {
      this.info(`tRPC ${path} took ${duration}ms to execute`);
    }
  }
}

export const logger = new Logger();
export const { debug, info, warn, error, trpc } = logger;
