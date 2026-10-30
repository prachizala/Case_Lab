/**
 * Institutional Error Monitoring and Observability Subsystem
 * SBS CaseLab - Shanti Business School (SBS)
 * 
 * Provides centralized error capturing, telemetry breadcrumbs,
 * severity classification, and production observability hooks.
 */

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export interface ErrorBreadcrumb {
  timestamp: string;
  category: string;
  message: string;
  data?: Record<string, any>;
}

export interface CapturedError {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  userId?: string;
  route?: string;
  context?: Record<string, any>;
  breadcrumbs: ErrorBreadcrumb[];
}

class ErrorMonitor {
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private capturedErrors: CapturedError[] = [];
  private maxBreadcrumbs: number = 20;

  addBreadcrumb(category: string, message: string, data?: Record<string, any>) {
    const crumb: ErrorBreadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
    };
    this.breadcrumbs.push(crumb);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  captureException(
    error: Error | unknown,
    context?: {
      severity?: ErrorSeverity;
      userId?: string;
      route?: string;
      extra?: Record<string, any>;
    }
  ): CapturedError {
    const errObj = error instanceof Error ? error : new Error(String(error));
    const captured: CapturedError = {
      id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      severity: context?.severity || "error",
      message: errObj.message,
      stack: errObj.stack,
      userId: context?.userId,
      route: context?.route,
      context: context?.extra,
      breadcrumbs: [...this.breadcrumbs],
    };

    this.capturedErrors.unshift(captured);
    if (this.capturedErrors.length > 100) {
      this.capturedErrors.pop();
    }

    if (process.env.NODE_ENV !== "production") {
      console.error(
        `[ErrorMonitor][${captured.severity.toUpperCase()}] ${captured.message}`,
        {
          id: captured.id,
          route: captured.route,
          userId: captured.userId,
          context: captured.context,
        }
      );
    }

    return captured;
  }

  getCapturedErrors(limit: number = 20): CapturedError[] {
    return this.capturedErrors.slice(0, limit);
  }

  clear() {
    this.breadcrumbs = [];
    this.capturedErrors = [];
  }
}

// Global singleton
const globalForMonitor = globalThis as unknown as { __sbsCaseLabErrorMonitor?: ErrorMonitor };
export const errorMonitor = globalForMonitor.__sbsCaseLabErrorMonitor ?? new ErrorMonitor();
if (process.env.NODE_ENV !== "production") {
  globalForMonitor.__sbsCaseLabErrorMonitor = errorMonitor;
}

/**
 * Universal error reporting helper
 */
export function reportError(
  error: unknown,
  context?: {
    severity?: ErrorSeverity;
    userId?: string;
    route?: string;
    extra?: Record<string, any>;
  }
) {
  return errorMonitor.captureException(error, context);
}
