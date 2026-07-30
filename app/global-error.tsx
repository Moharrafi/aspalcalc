'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center font-sans">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sistem mengalami gangguan</h2>
        <p className="text-slate-500 text-xs mb-6 font-medium">Silakan muat ulang halaman.</p>
        <button
          onClick={() => reset()}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
        >
          Muat Ulang
        </button>
      </body>
    </html>
  );
}
