import { NextResponse } from 'next/server';

export async function POST() {
  // Create response
  const response = NextResponse.json({ success: true });
  
  // Clear all auth-related cookies
  response.cookies.set('customerId', '', { maxAge: 0 });
  response.cookies.set('customerToken', '', { maxAge: 0 });
  response.cookies.set('customerName', '', { maxAge: 0 });
  response.cookies.set('wcCustomerToken', '', { maxAge: 0 });
  
  return response;
} 