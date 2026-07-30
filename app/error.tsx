'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h2>
      <p className="text-slate-500 text-xs mb-6">Maaf, ada kendala saat memuat halaman.</p>
      <button
        onClick={() => reset()}
        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
      >
        Coba Lagi
      </button>
    </div>
  );
}
