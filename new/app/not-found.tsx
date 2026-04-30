import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg p-6 text-center">
      <h2 className="text-4xl font-black text-primary mb-4">404</h2>
      <p className="text-secondary mb-8">Halaman tidak ditemukan.</p>
      <Link 
        href="/"
        className="bg-primary text-white px-6 py-3 rounded-[16px] font-bold hover:opacity-90 transition-opacity"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
