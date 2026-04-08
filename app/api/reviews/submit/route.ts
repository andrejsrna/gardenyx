import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    { error: 'Recenzie sú momentálne deaktivované' },
    { status: 410 }
  );
}
