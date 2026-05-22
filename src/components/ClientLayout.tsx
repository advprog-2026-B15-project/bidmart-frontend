'use client';
import { usePathname } from 'next/navigation';
import { AuctionProvider, useAuction } from '@/store/auction-context';
import TopNav from './TopNav';
import Footer from './Footer';
import Toaster from './Toaster';

const NO_SHELL_ROUTES = ['/login'];

function InnerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const { toasts, dismissToast, modal, closeModal, addToast } = useAuction();
  const noShell = NO_SHELL_ROUTES.includes(pathname);

  return (
    <>
      {!noShell && <TopNav/>}
      {children}
      {!noShell && <Footer/>}
      <Toaster toasts={toasts} onDismiss={dismissToast}/>
    </>
  );
}

export default function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuctionProvider>
      <InnerLayout>{children}</InnerLayout>
    </AuctionProvider>
  );
}
