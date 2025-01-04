import { NextResponse } from 'next/server';
import { logError } from './logger';

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): NextResponse<ErrorResponse> {
  // Log the error with our logging utility
  logError('Global Error Handler', { 
    error,
    timestamp: new Date().toISOString()
  });

  // Handle known application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && { details: error.details })
      },
      { status: error.statusCode }
    );
  }

  // Handle rate limiting errors
  if (error instanceof Error && error.message.includes('rate limit')) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      {
        status: 429,
        headers: {
          'Retry-After': '900'
        }
      }
    );
  }

  // Handle validation errors
  if (error instanceof Error && error.name === 'ZodError') {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.message
      },
      { status: 400 }
    );
  }

  // Generic error response for unknown errors
  const genericError: ErrorResponse = {
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR'
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    genericError.details = error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error;
  }

  return NextResponse.json(genericError, { status: 500 });
} 