import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <h2 className="text-4xl font-black text-slate-900 mb-2">404</h2>
      <p className="text-slate-500 text-sm mb-6">Halaman tidak ditemukan.</p>
      <a 
        href="/"
        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
      >
        Kembali ke Beranda
      </a>
    </div>
  );
}
