import { NextResponse } from "next/server";

export async function POST() {
  // ... coupon application logic ...
  return NextResponse.json({
    // ... response with explicit free_shipping: false ...
    free_shipping: false
  });
} 