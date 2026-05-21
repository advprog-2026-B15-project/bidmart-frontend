'use client';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { AuctionItem, Toast, ModalState } from '@/types';

interface AuctionContextValue {
  activeItem: AuctionItem | null;
  setActiveItem: (item: AuctionItem | null) => void;
  toasts: Toast[];
  addToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  modal: ModalState | null;
  openModal: (item: AuctionItem, amount: number) => void;
  closeModal: () => void;
}

const AuctionContext = createContext<AuctionContextValue | null>(null);

function createToastId() {
  return globalThis.crypto?.randomUUID?.() ?? `toast-${Date.now()}`;
}

export function AuctionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [activeItem, setActiveItem] = useState<AuctionItem | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = createToastId();
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => dismissToast(id), 4000);
  }, [dismissToast]);

  const openModal = useCallback((item: AuctionItem, amount: number) => {
    setModal({ item, amount });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);
  const value = useMemo(() => ({
    activeItem, setActiveItem,
    toasts, addToast, dismissToast,
    modal, openModal, closeModal,
  }), [activeItem, toasts, addToast, dismissToast, modal, openModal, closeModal]);

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be used within AuctionProvider');
  return ctx;
}
