interface ErrorLog {
  error: unknown;
  orderId?: string | null;
  customerEmail?: string;
  amount?: number;
  timestamp: string;
}

export function logError(type: string, data: ErrorLog) {
  console.error(`[${type}] ${data.timestamp}`, {
    ...data,
    customerEmail: data.customerEmail ? '***' : undefined,
    error: data.error instanceof Error ? {
      message: data.error.message,
      name: data.error.name,
      stack: data.error.stack
    } : data.error
  });
} 