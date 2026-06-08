'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getToken } from '@/lib/api';
import { openAuthenticatedSse } from '@/lib/sse';
import { getMyNotifications } from '@/modules/booking/api';
import { useAuction } from '@/store/auction-context';
import type { Notification } from '@/types';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markNotificationReadLocally: (id: string) => void;
  markAllNotificationsReadLocally: () => void;
}

interface RealtimeNotificationPayload {
  id: number | string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const NOTIF_TYPE_MAP: Record<string, Notification['type']> = {
  WIN: 'won',
  LOSE: 'out',
  NEW_BID: 'bid',
  OUTBID: 'out',
  PAYMENT_CONFIRMED: 'order',
  BALANCE_RELEASED: 'order',
  SHIPPED: 'order',
  DELIVERED: 'order',
  DISPUTE_FILED: 'order',
  INFO: 'order',
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  if (min < 1) return 'Baru saja';
  if (min < 60) return `${min} menit lalu`;
  if (hour < 24) return `${hour} jam lalu`;
  if (day === 1) return 'Kemarin';
  return `${day} hari lalu`;
}

function mapRealtimeNotification(payload: RealtimeNotificationPayload): Notification {
  return {
    id: String(payload.id),
    type: NOTIF_TYPE_MAP[payload.type] ?? 'order',
    unread: !payload.isRead,
    title: payload.title,
    desc: payload.message,
    when: relativeTime(payload.createdAt),
  };
}

function toastTone(type: Notification['type']): 'success' | 'error' | 'info' {
  if (type === 'won') return 'success';
  if (type === 'out') return 'error';
  return 'info';
}

export function NotificationProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const { addToast } = useAuction();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const refreshNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setNotifications([]);
      return;
    }

    const list = await getMyNotifications();
    setNotifications(list);
    seenIdsRef.current = new Set(list.map(item => item.id));
  }, []);

  const markNotificationReadLocally = useCallback((id: string) => {
    setNotifications(prev => prev.map(item => item.id === id ? { ...item, unread: false } : item));
  }, []);

  const markAllNotificationsReadLocally = useCallback(() => {
    setNotifications(prev => prev.map(item => ({ ...item, unread: false })));
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setNotifications([]);
      setLoading(false);
      seenIdsRef.current = new Set();
      return;
    }

    let reconnectTimer: number | undefined;
    let stopped = false;
    const controller = new AbortController();

    async function bootstrap() {
      setLoading(true);
      try {
        const list = await getMyNotifications();
        if (stopped) return;
        setNotifications(list);
        seenIdsRef.current = new Set(list.map(item => item.id));
      } catch {
        if (!stopped) setNotifications([]);
      } finally {
        if (!stopped) setLoading(false);
      }
    }

    function handleSseEvent(event: { event: string; data: string }) {
      if (event.event === 'heartbeat' || event.event === 'connected') return;

      if (event.event === 'notification') {
        try {
          const parsed = mapRealtimeNotification(JSON.parse(event.data) as RealtimeNotificationPayload);
          setNotifications(prev => {
            const rest = prev.filter(item => item.id !== parsed.id);
            return [{ ...parsed, unread: true }, ...rest];
          });

          if (!seenIdsRef.current.has(parsed.id)) {
            seenIdsRef.current.add(parsed.id);
            addToast({
              tone: toastTone(parsed.type),
              title: parsed.title,
              desc: parsed.desc,
            });
          }
          return;
        } catch {
          // fall back to a refresh if the payload is malformed
        }
      }

      void getMyNotifications()
        .then(list => {
          setNotifications(list);
          list.forEach(item => seenIdsRef.current.add(item.id));
        })
        .catch(() => {});
    }

    async function connect() {
      try {
        await openAuthenticatedSse('/api/notifications/stream', handleSseEvent, controller.signal);
      } catch {
        if (!stopped) reconnectTimer = globalThis.setTimeout(connect, 3000);
      }
    }

    void bootstrap();
    void connect();

    return () => {
      stopped = true;
      controller.abort();
      if (reconnectTimer) globalThis.clearTimeout(reconnectTimer);
    };
  }, [addToast, pathname]);

  const value = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter(item => item.unread).length,
    loading,
    refreshNotifications,
    markNotificationReadLocally,
    markAllNotificationsReadLocally,
  }), [loading, markAllNotificationsReadLocally, markNotificationReadLocally, notifications, refreshNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useRealtimeNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useRealtimeNotifications must be used within NotificationProvider');
  return context;
}
