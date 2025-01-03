import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, token } = body;

    // Verify the request is legitimate
    if (token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Revalidate the path
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error: unknown) {
    return NextResponse.json({ message: 'Error revalidating' + error }, { status: 500 });
  }
}