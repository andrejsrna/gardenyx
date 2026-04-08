import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const runtime = 'nodejs';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf'];
const MAX_SIZE_MB = 20;

function buildR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY!,
      secretAccessKey: process.env.R2_SECRET_KEY!,
    },
  });
}

function buildPublicUrl(key: string): string {
  const domain = process.env.R2_DOMAIN;
  const api = process.env.R2_API;
  const trimmed = key.startsWith('/') ? key.slice(1) : key;
  if (domain) return `${domain.replace(/\/$/, '')}/${trimmed}`;
  if (api) return `${api.replace(/\/$/, '')}/${trimmed}`;
  return `${process.env.R2_ENDPOINT?.replace(/\/$/, '')}/${trimmed}`;
}

function checkAdminAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') || '';
  const encoded = Buffer.from(
    `${process.env.ADMIN_DASHBOARD_USER}:${process.env.ADMIN_DASHBOARD_PASSWORD}`,
  ).toString('base64');
  return auth === `Basic ${encoded}`;
}

export async function POST(request: NextRequest) {
  // Auth check — same as admin layout
  const cookie = request.cookies.get('admin_auth');
  if (!cookie?.value && !checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY || !process.env.R2_SECRET_KEY || !process.env.R2_BUCKET) {
    return NextResponse.json({ error: 'R2 not configured' }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string | null) || 'products';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isDoc = ALLOWED_DOC_TYPES.includes(file.type);

  if (!isImage && !isDoc) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `File too large (max ${MAX_SIZE_MB}MB)` }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || (isImage ? 'jpg' : 'pdf');
  const baseName = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60);
  const key = `${folder}/${baseName}-${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const client = buildR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ContentDisposition: isDoc ? `attachment; filename="${file.name}"` : 'inline',
      }),
    );
  } catch (err) {
    console.error('[upload] R2 error', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  return NextResponse.json({ url: buildPublicUrl(key), key });
}
