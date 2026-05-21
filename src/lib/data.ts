import type {
  AuctionItem,
  CategoryPill,
  Transaction,
  Order,
  Notification,
  BidEntry,
  AdminUser,
  AdminFlag,
  AdminDispute,
} from '@/types';

// ── Formatters ────────────────────────────────────────────────────────────────

export function fmtRp(n: number): string {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function fmtRpShort(n: number): string {
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + ' M';
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' jt';
  if (n >= 1_000) return 'Rp ' + (n / 1_000).toFixed(0) + 'rb';
  return 'Rp ' + n;
}

// ── Category pills ────────────────────────────────────────────────────────────

export const CAT_PILLS: CategoryPill[] = [
  { id: 'all',   name: 'Semua',        icon: 'Grid' },
  { id: 'elec',  name: 'Elektronik',   icon: 'Cpu',      art: 'bm-art-elec' },
  { id: 'fash',  name: 'Fashion',      icon: 'Shirt',    art: 'bm-art-fash' },
  { id: 'auto',  name: 'Otomotif',     icon: 'Car',      art: 'bm-art-veh' },
  { id: 'coll',  name: 'Koleksi',      icon: 'Sparkles', art: 'bm-art-coll' },
  { id: 'home',  name: 'Rumah & Taman',icon: 'Home',     art: 'bm-art-home' },
  { id: 'sport', name: 'Olahraga',     icon: 'Trophy' },
  { id: 'music', name: 'Musik',        icon: 'Music',    art: 'bm-art-music' },
  { id: 'toys',  name: 'Mainan & Hobi',icon: 'Gamepad',  art: 'bm-art-toys' },
  { id: 'book',  name: 'Buku',         icon: 'Book' },
  { id: 'art',   name: 'Seni & Antik', icon: 'Palette' },
  { id: 'watch', name: 'Jam Tangan',   icon: 'Watch' },
];

// ── Time helpers ──────────────────────────────────────────────────────────────

const NOW = Date.now();
const m = (n: number) => n * 60 * 1000;
const h = (n: number) => n * 60 * 60 * 1000;
const d = (n: number) => n * 24 * 60 * 60 * 1000;

// ── Auction items ─────────────────────────────────────────────────────────────

export const ITEMS: AuctionItem[] = [
  { id: 'L01', title: "Sony WH-1000XM5 Wireless Noise-Cancelling — Garansi resmi",
    price: 4_250_000, bids: 27, ends: NOW + m(1) + 38 * 1000,
    art: 'bm-art-elec', cat: 'elec', seller: 'audiophile_id', rating: 4.9, ratingCount: 1284,
    badge: { tone: 'red', text: 'BERAKHIR' } },
  { id: 'L02', title: "iPhone 14 Pro Max 256GB Deep Purple — Mulus, Fullset",
    price: 13_900_000, bids: 41, ends: NOW + h(4) + m(12),
    art: 'bm-art-elec', cat: 'elec', seller: 'mobile_market', rating: 4.8, ratingCount: 642 },
  { id: 'L03', title: "Levi's 501 Vintage Selvedge Jeans 32x34 — Made in USA",
    price: 1_850_000, bids: 9, ends: NOW + h(11) + m(4),
    art: 'bm-art-fash', cat: 'fash', seller: 'denim_archive', rating: 4.95, ratingCount: 320 },
  { id: 'L04', title: "Yamaha NMAX 155 Connected ABS 2024 — Bekas Pribadi, KM 3.2K",
    price: 24_500_000, bids: 16, ends: NOW + d(1) + h(6),
    art: 'bm-art-veh', cat: 'auto', seller: 'motor_bos', rating: 4.7, ratingCount: 188,
    badge: { tone: 'blue', text: 'NEGO' } },
  { id: 'L05', title: "Charizard Holo 1st Edition Base Set PSA 8 — Sealed pack",
    price: 72_000_000, bids: 38, ends: NOW + h(11) + m(50),
    art: 'bm-art-toys', cat: 'coll', seller: 'rare_cards_jkt', rating: 5.0, ratingCount: 215,
    badge: { tone: 'blue', text: 'LANGKA' } },
  { id: 'L06', title: "Apple Watch Series 9 GPS 45mm Midnight — Like New",
    price: 4_650_000, bids: 11, ends: NOW + d(1) + h(2),
    art: 'bm-art-elec', cat: 'elec', seller: 'wearables_co', rating: 4.85, ratingCount: 432 },
  { id: 'L07', title: "Hermès Silk Scarf 'Brides de Gala' Authentic 1990s",
    price: 4_400_000, bids: 6, ends: NOW + d(2) + h(5),
    art: 'bm-art-fash', cat: 'fash', seller: 'luxe_vintage', rating: 4.92, ratingCount: 540 },
  { id: 'L08', title: "Polaroid SX-70 Land Camera Folding — Restored",
    price: 2_900_000, bids: 14, ends: NOW + d(3) + h(2),
    art: 'bm-art-music', cat: 'elec', seller: 'analog_camera', rating: 4.88, ratingCount: 96 },
  { id: 'L09', title: "Lampu Baca Kuningan Tahun 1960an — Karya Mauri Almari, Finland",
    price: 8_200_000, bids: 5, ends: NOW + d(5) + h(18),
    art: 'bm-art-home', cat: 'home', seller: 'rumah_lampu', rating: 4.81, ratingCount: 74 },
  { id: 'L10', title: "Nike Air Jordan 1 Retro High OG 'Chicago' 2022 — Size 42, DS",
    price: 6_300_000, bids: 22, ends: NOW + h(8) + m(20),
    art: 'bm-art-toys', cat: 'fash', seller: 'deadstock_jkt', rating: 4.93, ratingCount: 1102,
    badge: { tone: 'amber', text: 'DEADSTOCK' } },
  { id: 'L11', title: "Karpet Persia Tabriz Handknotted 200x300 cm — c.1970",
    price: 28_500_000, bids: 19, ends: NOW + d(1) + h(22),
    art: 'bm-art-coll', cat: 'home', seller: 'permadani_pusaka', rating: 4.96, ratingCount: 142 },
  { id: 'L12', title: "Canon AE-1 35mm Film Camera + Lensa 50mm f/1.8 — Tested",
    price: 2_350_000, bids: 11, ends: NOW + h(3) + m(45),
    art: 'bm-art-elec', cat: 'elec', seller: 'analog_camera', rating: 4.88, ratingCount: 96,
    badge: { tone: 'red', text: 'BERAKHIR' } },
];

// ── Category tree for create listing ─────────────────────────────────────────

export const CAT_TREE: Record<string, Record<string, string[]>> = {
  'Elektronik': {
    'Handphone & Tablet': ['Smartphone', 'Tablet', 'Aksesoris HP', 'Power Bank', 'Casing & Pelindung'],
    'Komputer & Laptop':  ['Laptop', 'PC Desktop', 'Monitor', 'Keyboard & Mouse', 'Storage'],
    'Audio & Video':      ['Headphone', 'Speaker', 'Soundbar', 'Turntable', 'Mikrofon'],
    'Kamera':             ['Mirrorless', 'DSLR', 'Lensa', 'Kamera Film', 'Aksesoris Kamera'],
  },
  'Fashion': {
    'Pakaian Pria':   ['Kemeja', 'Kaos', 'Jaket', 'Celana', 'Setelan Jas'],
    'Pakaian Wanita': ['Dress', 'Atasan', 'Bawahan', 'Outerwear'],
    'Sepatu':         ['Sneakers', 'Boots', 'Formal', 'Sandal'],
    'Aksesoris':      ['Tas', 'Dompet', 'Ikat Pinggang', 'Kacamata', 'Topi'],
  },
  'Otomotif': {
    'Mobil':       ['Sedan', 'SUV', 'MPV', 'Hatchback', 'Klasik'],
    'Motor':       ['Sport', 'Matic', 'Bebek', 'Trail', 'Vintage'],
    'Suku Cadang': ['Velg', 'Ban', 'Audio Mobil', 'Lampu', 'Interior'],
  },
  'Koleksi & Antik': {
    'Trading Cards':  ['Pokémon', 'Yu-Gi-Oh!', 'Magic: The Gathering', 'One Piece TCG'],
    'Action Figures': ['Anime', 'Marvel & DC', 'Star Wars', 'Tamiya'],
    'Mata Uang':      ['Koin Kuno', 'Uang Kertas', 'Kemasan Sealed'],
    'Memorabilia':    ['Olahraga', 'Musik', 'Film'],
  },
  'Rumah & Taman': {
    'Furnitur':     ['Kursi', 'Meja', 'Sofa', 'Tempat Tidur', 'Rak'],
    'Pencahayaan':  ['Lampu Meja', 'Lampu Gantung', 'Lampu Dinding', 'Outdoor'],
    'Dekorasi':     ['Karpet', 'Lukisan', 'Vas & Pot', 'Cermin'],
  },
};

// ── Wallet transactions ───────────────────────────────────────────────────────

export const TXNS: Transaction[] = (() => {
  const todayMs = Date.now();
  const dayMs = 86400000;
  const fmtDate = (offsetDays: number) => {
    const dt = new Date(todayMs - offsetDays * dayMs);
    return (
      dt.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    );
  };
  let balance = 18_420_000;
  const rows = [
    { type: 'Top Up',   desc: 'BCA Virtual Account · 7714822091',                     amount: +5_000_000,  d: 0.1 },
    { type: 'Bid Hold', desc: 'Sony WH-1000XM5 Wireless — bid Rp 4.250.000',          amount: -4_250_000,  d: 0.5 },
    { type: 'Refund',   desc: 'Bid release · Outbid on iPhone 14 Pro',                 amount: +3_800_000,  d: 1.1 },
    { type: 'Payment',  desc: 'Pembayaran #BM-2024-04211 — Nike AJ1 Chicago',          amount: -6_300_000,  d: 2.4 },
    { type: 'Bid Hold', desc: 'Charizard PSA 8 — bid Rp 68.500.000',                  amount: -68_500_000, d: 3.0 },
    { type: 'Refund',   desc: 'Bid release · Outbid on Charizard PSA 8',               amount: +68_500_000, d: 3.6 },
    { type: 'Top Up',   desc: 'Mandiri Virtual Account · 88909233',                    amount: +10_000_000, d: 4.0 },
    { type: 'Withdraw', desc: 'Transfer ke BCA xxxx-3421',                             amount: -2_500_000,  d: 6.2 },
    { type: 'Payment',  desc: 'Pembayaran #BM-2024-04018 — Canon AE-1',               amount: -2_350_000,  d: 8.3 },
    { type: 'Top Up',   desc: 'OVO Wallet · 0812-3344-5566',                           amount: +1_500_000,  d: 12.0 },
    { type: 'Bid Hold', desc: 'Karpet Persia Tabriz — bid Rp 27.000.000',             amount: -27_000_000, d: 14.1 },
    { type: 'Refund',   desc: 'Bid release · Auction ended below reserve',              amount: +27_000_000, d: 14.6 },
    { type: 'Top Up',   desc: 'GoPay · 0813-2244-9988',                                amount: +2_000_000,  d: 18.3 },
    { type: 'Payment',  desc: 'Pembayaran #BM-2024-03889 — Vintage Walkman',           amount: -3_400_000,  d: 22.0 },
    { type: 'Top Up',   desc: 'BCA Virtual Account · 7714822091',                      amount: +8_000_000,  d: 27.2 },
  ];
  return rows.map((r) => {
    balance -= r.amount;
    return { ...r, balance: balance + r.amount, date: fmtDate(r.d) };
  });
})();

// ── Orders ────────────────────────────────────────────────────────────────────

export const ORDERS: Order[] = [
  {
    id: 'BM-2024-04211', role: 'buyer', status: 'ship',
    item: { title: "Nike Air Jordan 1 Retro High OG 'Chicago' 2022 — Size 42, DS", art: 'bm-art-toys' },
    counterpart: 'deadstock_jkt', price: 6_300_000,
    when: 'Dimenangkan 4 Mei 2026',
    tracking: { courier: 'JNE Express', num: 'JX240519487123', lastUpd: 'Hari ini, 09:42 — Tiba di Gateway Jakarta' },
    history: [
      { t: 'Hari ini, 09:42', desc: 'Tiba di Gateway Jakarta',        where: 'JNE Halim, Jakarta Timur', curr: true },
      { t: 'Kemarin, 21:18',  desc: 'Berangkat dari Origin',           where: 'JNE Bandung Hub' },
      { t: '16 Mei, 14:30',   desc: 'Dikemas dan diserahkan ke kurir', where: 'Penjual: deadstock_jkt' },
      { t: '16 Mei, 11:02',   desc: 'Pembayaran dikonfirmasi',          where: 'BidMart Wallet' },
    ],
    step: 2,
  },
  {
    id: 'BM-2024-04195', role: 'buyer', status: 'wait',
    item: { title: 'Canon AE-1 35mm Film Camera + Lensa 50mm f/1.8', art: 'bm-art-elec' },
    counterpart: 'analog_camera', price: 2_350_000,
    when: 'Dimenangkan 10 Mei 2026', step: 1,
  },
  {
    id: 'BM-2024-04122', role: 'buyer', status: 'recv',
    item: { title: 'Polaroid SX-70 Land Camera Folding — Restored Body', art: 'bm-art-music' },
    counterpart: 'analog_camera', price: 2_900_000,
    when: 'Dimenangkan 24 Apr 2026 · Diterima 1 Mei', step: 4,
  },
  {
    id: 'BM-2024-04088', role: 'buyer', status: 'disp',
    item: { title: 'Karpet Persia Tabriz 200x300 — c.1970', art: 'bm-art-coll' },
    counterpart: 'permadani_pusaka', price: 28_500_000,
    when: 'Sengketa dibuka 6 Mei 2026', step: 3,
  },
];

// ── Notifications ─────────────────────────────────────────────────────────────

export const NOTIFS: Notification[] = [
  { id: 'n1', type: 'ending', unread: true,  title: 'Sony WH-1000XM5 akan berakhir',     desc: 'Lelang berakhir dalam 1 menit 38 detik. Kamu masih jadi penawar tertinggi.',      when: 'Baru saja' },
  { id: 'n2', type: 'out',    unread: true,  title: 'Kamu disalip di iPhone 14 Pro',      desc: 'Penawar lain mengajukan Rp 13.900.000. Tawar lagi untuk tetap unggul.',           when: '8 menit lalu' },
  { id: 'n3', type: 'won',    unread: true,  title: 'Selamat — kamu memenangkan lelang',  desc: "Nike Air Jordan 1 'Chicago'. Selesaikan pembayaran dalam 48 jam.",               when: '3 jam lalu' },
  { id: 'n4', type: 'bid',    unread: false, title: 'Tawaran kamu masuk',                 desc: 'Rp 4.250.000 di Sony WH-1000XM5. Kamu jadi penawar tertinggi.',                  when: '5 jam lalu' },
  { id: 'n5', type: 'order',  unread: false, title: 'Pesanan dikirim',                    desc: 'BM-2024-04211 — Nike AJ1 Chicago telah diserahkan ke JNE Express.',              when: 'Kemarin' },
  { id: 'n6', type: 'bid',    unread: false, title: 'Tawaran kamu masuk',                 desc: "Rp 1.850.000 di Levi's 501 Vintage Selvedge.",                                   when: 'Kemarin' },
  { id: 'n7', type: 'order',  unread: false, title: 'Pengiriman diperbarui',              desc: 'BM-2024-04211 telah tiba di Gateway Jakarta.',                                    when: 'Hari ini, 09:42' },
  { id: 'n8', type: 'won',    unread: false, title: 'Kamu menang Polaroid SX-70',         desc: 'Pembayaran berhasil. Penjual sedang mempersiapkan paket.',                        when: '1 minggu lalu' },
];

// ── Admin data ────────────────────────────────────────────────────────────────

export const ADMIN_USERS: AdminUser[] = [
  { name: 'Aulia Ramadhan',  email: 'aulia.r@gmail.com',           role: 'seller', status: 'active',    joined: '12 Mar 2024', lifetime: 142_400_000 },
  { name: 'Dimas Setiawan',  email: 'dimas.set@yahoo.com',         role: 'buyer',  status: 'active',    joined: '04 Jan 2024', lifetime:  28_100_000 },
  { name: 'Pradipta Wibowo', email: 'pradipta.w@outlook.com',      role: 'admin',  status: 'active',    joined: '15 Jul 2023', lifetime:           0 },
  { name: 'Citra Halimah',   email: 'citra.halimah@gmail.com',     role: 'seller', status: 'suspended', joined: '02 Sep 2024', lifetime:  62_800_000 },
  { name: 'Bayu Pratama',    email: 'bayu.pratama@protonmail.com', role: 'buyer',  status: 'active',    joined: '21 Nov 2024', lifetime:  11_200_000 },
  { name: 'Maya Lestari',    email: 'maya.lestari@gmail.com',      role: 'seller', status: 'active',    joined: '08 Feb 2025', lifetime:  95_600_000 },
  { name: 'Reza Mahendra',   email: 'rezamhd@gmail.com',           role: 'buyer',  status: 'active',    joined: '30 Mar 2025', lifetime:   4_200_000 },
];

export const ADMIN_FLAGS: AdminFlag[] = [
  { id: 'F-2419', title: "Rolex Submariner 'Hulk' 116610LV — Original BNIB",  art: 'bm-art-coll', reason: 'Possible counterfeit · No serial photo', seller: 'lux_watches_id', time: '2 jam lalu' },
  { id: 'F-2418', title: 'iPhone 15 Pro 1TB — Termurah, Garansi 2 Tahun',     art: 'bm-art-elec', reason: 'Price below market floor · Suspicious',  seller: 'newcomer_3344',  time: '5 jam lalu' },
  { id: 'F-2417', title: 'Replika 1:1 Hermès Birkin Togo Leather',            art: 'bm-art-fash', reason: 'Replica disclosed in title (banned)',    seller: 'tas_collection', time: 'Kemarin' },
];

export const ADMIN_DISPUTES: AdminDispute[] = [
  { id: 'D-1029', title: 'Karpet Persia Tabriz — Tidak sesuai deskripsi',    buyer: 'diana_a',  seller: 'permadani_pusaka', status: 'investigation',   amount: 28_500_000, age: 'Dibuka 2 hari lalu' },
  { id: 'D-1028', title: 'Apple Watch S9 — Tidak diterima dalam 14 hari',    buyer: 'ridwan_p', seller: 'wearables_co',     status: 'awaiting-seller', amount:  4_650_000, age: 'Dibuka 6 hari lalu' },
  { id: 'D-1027', title: "Levi's 501 — Cacat tidak diungkap",                buyer: 'ari_w',    seller: 'denim_archive',    status: 'buyer-favored',   amount:  1_850_000, age: 'Dibuka 9 hari lalu' },
];

// ── Bid history ───────────────────────────────────────────────────────────────

export const BID_HISTORY: BidEntry[] = [
  { bidder: 'ady****92',    amount: 4_250_000, time: 'Baru saja',            you: false, top: true },
  { bidder: 'kamu (you)',   amount: 4_100_000, time: '2 menit lalu',         you: true,  top: false },
  { bidder: 'ady****92',    amount: 4_050_000, time: '4 menit lalu',         you: false, top: false },
  { bidder: 'rian****8',    amount: 3_900_000, time: '11 menit lalu',        you: false, top: false },
  { bidder: 'kamu (you)',   amount: 3_850_000, time: '12 menit lalu',        you: true,  top: false },
  { bidder: 'fauzi***',     amount: 3_700_000, time: '18 menit lalu',        you: false, top: false },
  { bidder: 'rian****8',    amount: 3_600_000, time: '32 menit lalu',        you: false, top: false },
  { bidder: 'fauzi***',     amount: 3_500_000, time: '48 menit lalu',        you: false, top: false },
  { bidder: 'dina****1',    amount: 3_350_000, time: '1 jam lalu',           you: false, top: false },
  { bidder: 'fauzi***',     amount: 3_200_000, time: '1 jam 12 menit lalu', you: false, top: false },
  { bidder: 'rian****8',    amount: 3_050_000, time: '2 jam lalu',           you: false, top: false },
  { bidder: 'starting bid', amount: 2_500_000, time: '1 hari lalu',          you: false, top: false, opener: true },
];
