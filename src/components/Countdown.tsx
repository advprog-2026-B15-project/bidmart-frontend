'use client';
import { useState, useEffect } from 'react';

export function useCountdown(endTimestamp: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, endTimestamp - now);
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { d, h, m, s: sec, total: ms, urgent: ms < 2 * 60 * 1000 && ms > 0 };
}

export function CompactCountdown({ end }: Readonly<{ end: number }>) {
  const { d, h, m, s, total } = useCountdown(end);
  if (total <= 0) return <span>Berakhir</span>;
  if (d > 0) return <span>{d}h {h}j tersisa</span>;
  if (h > 0) return <span>{h}j {String(m).padStart(2, '0')}m tersisa</span>;
  if (m > 0) return <span>{m}m {String(s).padStart(2, '0')}d tersisa</span>;
  return <span>{s}d tersisa</span>;
}

export function BlocksCountdown({ end }: Readonly<{ end: number }>) {
  const { d, h, m, s, total } = useCountdown(end);
  const urgent = total < 2 * 60 * 1000 && total > 0;
  const safe = total > 60 * 60 * 1000;
  const color = urgent ? 'var(--red-600)' : safe ? 'var(--green-700)' : 'var(--ink)';
  if (total <= 0) {
    return (
      <div className="bm-countdown-blocks">
        <span><b>00</b>h</span><span><b>00</b>m</span><span><b>00</b>d</span>
      </div>
    );
  }
  return (
    <div className="bm-countdown-blocks" style={{ color }}>
      {d > 0 && <span><b>{d}</b>h</span>}
      <span><b>{String(h).padStart(2, '0')}</b>j</span>
      <span><b>{String(m).padStart(2, '0')}</b>m</span>
      <span><b>{String(s).padStart(2, '0')}</b>d</span>
    </div>
  );
}
