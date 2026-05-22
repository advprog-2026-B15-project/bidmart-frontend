import { type NextRequest, NextResponse } from 'next/server';

const GATEWAY = process.env.GATEWAY_URL ?? 'https://bidmart-b15.duckdns.org';

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = `${GATEWAY}/${path.join('/')}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((val, key) => {
    if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
      headers.set(key, val);
    }
  });

  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined;

  const isStream = path.join('/').includes('stream');
  const res = await fetch(target, {
    method: req.method,
    headers,
    body,
    signal: isStream ? undefined : AbortSignal.timeout(25000),
  });

  const resHeaders = new Headers();
  res.headers.forEach((val, key) => {
    if (!['transfer-encoding'].includes(key.toLowerCase())) {
      resHeaders.set(key, val);
    }
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
