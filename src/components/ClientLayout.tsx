'use client';
import { usePathname } from 'next/navigation';
import { AuctionProvider, useAuction } from '@/store/auction-context';
import TopNav from './TopNav';
import Footer from './Footer';
import Toaster from './Toaster';
import BidConfirmModal from './BidConfirmModal';

const NO_SHELL_ROUTES = ['/login'];

function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toasts, dismissToast, modal, closeModal, addToast } = useAuction();
  const noShell = NO_SHELL_ROUTES.includes(pathname);

  function handleConfirm() {
    closeModal();
    addToast({ tone: 'success', title: 'Tawaran berhasil!', desc: `Kamu menjadi penawar tertinggi.` });
  }

  return (
    <>
      {!noShell && <TopNav alerts={3}/>}
      {children}
      {!noShell && <Footer/>}
      <Toaster toasts={toasts} onDismiss={dismissToast}/>
      <BidConfirmModal
        open={!!modal}
        item={modal?.item ?? null}
        bidAmount={modal?.amount ?? 0}
        onClose={closeModal}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuctionProvider>
      <InnerLayout>{children}</InnerLayout>
    </AuctionProvider>
  );
}
