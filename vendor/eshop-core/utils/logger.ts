interface ErrorLog {
  error: unknown;
  orderId?: string | null;
  customerEmail?: string;
  amount?: number;
  timestamp: string;
}

export function logError(type: string, data: ErrorLog) {
  const logPayload = {
    orderId: data.orderId,
    customerEmail: data.customerEmail ? '***' : undefined,
    amount: data.amount,
    timestamp: data.timestamp, // Keep timestamp here for context
    // Handle the error field specifically
    errorDetails: data.error instanceof Error ? {
      message: data.error.message,
      name: data.error.name,
      // Optionally limit stack trace length for cleaner logs
      stack: data.error.stack?.split('\n').slice(0, 7).join('\n')
    } : data.error // Use the raw error object if not an Error instance
  };

  console.error(`[${type}] ${data.timestamp}`, logPayload);
}
