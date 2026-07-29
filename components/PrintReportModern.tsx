import React, { useMemo } from 'react';

interface Sale {
  id: string;
  date: string;
  type: string;
  weight: number;
  quantity: number;
  totalPrice: number;
  totalCost: number;
}

interface PrintSummary {
  revenue: number;
  cost: number;
  profit: number;
  paid: number;
  remaining: number;
  overpaid: number;
}

interface PrintReportModernProps {
  isMounted: boolean;
  printingMonth: string | null;
  printSummary: PrintSummary;
  salesToPrint: Sale[];
  formatCurrency: (val: number) => string;
}

export const PrintReportModern: React.FC<PrintReportModernProps> = ({
  isMounted,
  printingMonth,
  printSummary,
  salesToPrint,
  formatCurrency,
}) => {
  // Compute Product Breakdown Summary (using baseline price as modal)
  const productSummary = useMemo(() => {
    const map: Record<string, { type: string; weight: number; qty: number; cost: number }> = {};

    salesToPrint.forEach((sale) => {
      const key = `${sale.type.toUpperCase()}_${sale.weight}kg`;
      if (!map[key]) {
        map[key] = {
          type: sale.type,
          weight: sale.weight,
          qty: 0,
          cost: 0,
        };
      }
      map[key].qty += sale.quantity;
      map[key].cost += sale.totalPrice; // Using baseline price as modal for now
    });

    return Object.values(map);
  }, [salesToPrint]);

  const formattedPeriod = useMemo(() => {
    if (!printingMonth) return '';
    return printingMonth.length > 7
      ? new Date(printingMonth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date(printingMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [printingMonth]);

  const totalQuantity = useMemo(() => {
    return salesToPrint.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [salesToPrint]);

  // Using revenue (baseline prices: 33k for 1kg, etc.) as total modal setoran
  const totalModalCost = printSummary.revenue;
  const remainingModal = Math.max(0, totalModalCost - printSummary.paid);
  const isFullyPaid = remainingModal <= 0;

  return (
    <div className="hidden print:block printable-area bg-white text-slate-900 p-8 font-sans leading-relaxed">
      {/* Top Header & Brand */}
      <div className="border-b-2 border-slate-800 pb-5 mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-900 text-white text-[11px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              Laporan Setoran Modal
            </span>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest">
              • Aspal Sales Analytics
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            Laporan Penjualan
          </h1>
          <p className="text-xs font-medium text-slate-600 mt-0.5">
            Periode: <strong className="text-slate-900">{formattedPeriod || 'Semua Waktu'}</strong>
          </p>
        </div>

        <div className="text-right text-xs space-y-1">
          <div className="inline-block bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-right">
            <p className="text-[10px] uppercase font-bold text-slate-500">Tanggal Cetak</p>
            <p className="font-bold text-slate-800">
              {isMounted ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </p>
          </div>
          <p className="text-[11px] font-mono text-slate-500 pt-1">
            Ref ID: #{isMounted ? new Date().getTime().toString().slice(-6) : '......'}
          </p>
        </div>
      </div>

      {/* Main Financial Summary (4 Deposit Cards) */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-800"></span>
            1. Ringkasan Kewajiban Setoran
          </h2>
          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
            isFullyPaid 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}>
            {isFullyPaid ? '✓ Setoran Lunas' : `Sisa Tagihan: ${formatCurrency(remainingModal)}`}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Card 1: Total Barang Terjual */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Total Barang Terjual</p>
            <p className="text-base font-bold text-slate-900 tabular-nums">{totalQuantity} Pcs</p>
            <p className="text-[9px] text-slate-500 mt-1">Total jumlah barang</p>
          </div>

          {/* Card 2: Total Wajib Setor */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-900">
            <p className="text-[10px] font-bold uppercase text-slate-300 mb-0.5">Total Wajib Setor (Modal)</p>
            <p className="text-lg font-extrabold text-amber-400 tabular-nums">{formatCurrency(totalModalCost)}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Total kewajiban modal</p>
          </div>

          {/* Card 3: Sudah Ditransfer */}
          <div className="p-3.5 bg-sky-50/80 rounded-xl border border-sky-200">
            <p className="text-[10px] font-bold uppercase text-sky-800 mb-0.5">Sudah Ditransfer</p>
            <p className="text-base font-bold text-sky-900 tabular-nums">{formatCurrency(printSummary.paid)}</p>
            <p className="text-[9px] text-sky-700 mt-1">Setoran masuk ke pusat</p>
          </div>

          {/* Card 4: Sisa Tagihan Setoran */}
          <div className={`p-3.5 rounded-xl border ${
            isFullyPaid 
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900' 
              : 'bg-rose-50/80 border-rose-300 text-rose-900'
          }`}>
            <p className="text-[10px] font-bold uppercase mb-0.5">Sisa Setoran (Tagihan)</p>
            <p className="text-base font-extrabold tabular-nums">
              {remainingModal > 0 ? formatCurrency(remainingModal) : 'Rp 0 (LUNAS)'}
            </p>
            <p className="text-[9px] mt-1 font-semibold">
              {isFullyPaid ? 'Setoran sudah lunas' : 'Belum ditransfer'}
            </p>
          </div>
        </div>
      </div>

      {/* Product Volume Breakdown Summary */}
      {productSummary.length > 0 && (
        <div className="mb-6 bg-slate-50 rounded-xl border border-slate-200 p-3.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
            2. Rekap Barang Diminta / Diambil
          </h2>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {productSummary.map((item, idx) => (
              <div key={idx} className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 uppercase">{item.type}</span>
                  <span className="text-[10px] text-slate-500 ml-1">({item.weight}kg)</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                    {item.qty} Pcs
                  </span>
                  <p className="text-[9px] font-bold text-slate-600 mt-0.5">
                    Setor: {formatCurrency(item.cost)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Details Table */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-800"></span>
          3. Rincian Detail Setoran Per Transaksi
        </h2>

        <table className="w-full text-xs border border-slate-300 rounded-lg overflow-hidden border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white text-[11px] font-bold">
              <th className="p-2.5 text-center w-10">No</th>
              <th className="p-2.5 text-left w-32">Tanggal</th>
              <th className="p-2.5 text-left">Deskripsi Produk</th>
              <th className="p-2.5 text-center w-20">Qty</th>
              <th className="p-2.5 text-right w-36">Harga Modal (Satuan)</th>
              <th className="p-2.5 text-right w-40 bg-slate-900 text-amber-300">Total Wajib Setor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {salesToPrint.map((sale, index) => {
              // Use sale.totalPrice (e.g. 33k for 1kg) as the unit modal for report
              const unitModal = sale.quantity > 0 ? sale.totalPrice / sale.quantity : 0;
              const saleModalTotal = sale.totalPrice;

              return (
                <tr key={sale.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  <td className="p-2.5 text-center font-semibold text-slate-400">{index + 1}</td>
                  <td className="p-2.5 font-medium text-slate-700">
                    {new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="p-2.5 font-bold text-slate-800">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase mr-1.5 ${
                      sale.type === 'hijau' ? 'bg-emerald-100 text-emerald-800' :
                      sale.type === 'hitam' ? 'bg-slate-900 text-white' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {sale.type}
                    </span>
                    <span className="text-slate-600">({sale.weight} kg)</span>
                  </td>
                  <td className="p-2.5 text-center font-extrabold text-slate-900">{sale.quantity} Pcs</td>
                  <td className="p-2.5 text-right tabular-nums text-slate-600">{formatCurrency(unitModal)}</td>
                  <td className="p-2.5 text-right font-extrabold tabular-nums text-slate-900 bg-slate-100/80">
                    {formatCurrency(saleModalTotal)}
                  </td>
                </tr>
              );
            })}

            {/* Total Row (Appears ONCE at the end of transaction list) */}
            <tr className="bg-slate-800 text-white font-bold border-t-2 border-slate-900 break-inside-avoid">
              <td colSpan={3} className="p-2.5 text-right uppercase text-[10px] tracking-wider">
                Total Perhitungan Setoran:
              </td>
              <td className="p-2.5 text-center text-amber-300 font-extrabold">
                {totalQuantity} Pcs
              </td>
              <td className="p-2.5 text-right text-slate-400 text-[10px] italic">
                -
              </td>
              <td className="p-2.5 text-right text-amber-300 font-black tabular-nums bg-slate-950 text-sm">
                {formatCurrency(totalModalCost)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures & Footer info */}
      <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
        <div className="text-[10px] text-slate-500 space-y-1">
          <p className="font-bold text-slate-700">Catatan untuk Reseller:</p>
          <p>• Laporan ini berisi rincian barang yang diambil dan kewajiban total setor modal ke distributor.</p>
          <p>• Mohon pastikan transfer sisa setoran dilakukan tepat waktu sesuai tagihan di atas.</p>
        </div>

        <div className="flex gap-16 px-4">
          <div className="text-center">
            <p className="mb-14 text-slate-600 font-medium">Diterima Oleh,</p>
            <div className="border-b border-slate-800 w-36 mb-1"></div>
            <p className="font-bold text-slate-800">( Pak Jaja )</p>
          </div>
          <div className="text-center">
            <p className="mb-14 text-slate-600 font-medium">Hormat Kami,</p>
            <div className="border-b border-slate-800 w-36 mb-1"></div>
            <p className="font-bold text-slate-800">Rafi</p>
          </div>
        </div>
      </div>
    </div>
  );
};
