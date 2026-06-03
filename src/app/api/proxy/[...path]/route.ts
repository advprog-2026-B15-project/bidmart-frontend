import { type NextRequest, NextResponse } from "next/server";

const GATEWAY = process.env.GATEWAY_URL ?? "https://bidmart-b15.duckdns.org";

export const maxDuration = 60; 

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = `${GATEWAY}/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((val, key) => {
    if (!["host", "connection", "transfer-encoding", "content-length"].includes(key.toLowerCase())) {
      headers.set(key, val);
    }
  });

  let body: ArrayBuffer | undefined = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      body = await req.arrayBuffer();
    } catch (e) {
      console.error("Proxy error reading body:", e);
    }
  }

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });

    const resHeaders = new Headers();
    res.headers.forEach((val, key) => {
      if (!["transfer-encoding", "content-encoding"].includes(key.toLowerCase())) {
        resHeaders.set(key, val);
      }
    });

    return new NextResponse(res.body, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error(`Proxy error for ${target}:`, err);
    return NextResponse.json(
      { 
        error: "Gateway Connection Failed", 
        message: "Proxy Vercel tidak bisa menghubungi API Gateway.",
        target: target 
      },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
