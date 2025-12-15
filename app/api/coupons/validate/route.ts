import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: 'Kupóny momentálne nepodporujeme' },
    { status: 400 }
  );
}
