'use client';

import { getToken } from '@/lib/api';

const SSE_GATEWAY_URL = process.env.NEXT_PUBLIC_SSE_GATEWAY_URL ?? 'https://bidmart-b15.duckdns.org';

export interface SseEventMessage {
  event: string;
  data: string;
  id?: string;
}

function parseSseEvent(block: string): SseEventMessage | null {
  let event = 'message';
  let id: string | undefined;
  const data: string[] = [];

  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) continue;
    const separator = line.indexOf(':');
    const field = separator === -1 ? line : line.slice(0, separator);
    const value = separator === -1 ? '' : line.slice(separator + 1).trimStart();

    if (field === 'event') event = value || 'message';
    if (field === 'data') data.push(value);
    if (field === 'id') id = value;
  }

  if (data.length === 0 && !id) return null;
  return { event, data: data.join('\n'), id };
}

export async function openAuthenticatedSse(
  path: string,
  onEvent: (event: SseEventMessage) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error('No auth token available for SSE connection');
  }

  const response = await fetch(`${SSE_GATEWAY_URL}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`SSE connection failed with HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');

    let separatorIndex = buffer.indexOf('\n\n');
    while (separatorIndex >= 0) {
      const block = buffer.slice(0, separatorIndex).trim();
      buffer = buffer.slice(separatorIndex + 2);

      if (block) {
        const parsed = parseSseEvent(block);
        if (parsed) onEvent(parsed);
      }

      separatorIndex = buffer.indexOf('\n\n');
    }
  }
}

export function getSseGatewayUrl(path: string): string {
  return `${SSE_GATEWAY_URL}${path}`;
}
