import Logo from './Logo';

const cols = [
  { title: 'Beli',       links: ['Cara mendaftar', 'Cara menawar', 'Toko', 'Kartu hadiah'] },
  { title: 'Jual',       links: ['Mulai berjualan', 'Belajar jualan', 'Penjual bisnis', 'Program afiliasi'] },
  { title: 'Kepercayaan', links: ['Jaminan BidMart', 'Standar penjual', 'Keamanan', 'Pusat resolusi'] },
  { title: 'Tentang',    links: ['Perusahaan', 'Berita', 'Investor', 'Karir'] },
];

export default function Footer() {
  return (
    <footer className="bm-footer">
      <div className="bm-footer-inner">
        {cols.map(c => (
          <div className="bm-footer-col" key={c.title}>
            <div className="bm-footer-h">{c.title}</div>
            {c.links.map(l => <a key={l}>{l}</a>)}
          </div>
        ))}
      </div>
      <div className="bm-footer-base">
        <Logo size={18}/>
        <span>© 2026 BidMart Indonesia · Privasi · Syarat · Aksesibilitas</span>
      </div>
    </footer>
  );
}
