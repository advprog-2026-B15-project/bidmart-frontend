'use client';
import type { Toast } from '@/types';

interface ToasterProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div className="bm-toaster">
      {toasts.map(t => (
        <div key={t.id} className={`bm-toast bm-toast-${t.tone || 'info'}`}>
          <div className="bm-toast-ico">
            {t.tone === 'success' ? '✓' : t.tone === 'error' ? '!' : 'i'}
          </div>
          <div className="bm-toast-body">
            <div className="bm-toast-title">{t.title}</div>
            {t.desc && <div className="bm-toast-desc">{t.desc}</div>}
          </div>
          <button className="bm-toast-close" onClick={() => onDismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
