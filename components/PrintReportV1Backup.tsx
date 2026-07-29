import React from 'react';

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

interface PrintReportV1BackupProps {
  isMounted: boolean;
  printingMonth: string | null;
  printSummary: PrintSummary;
  salesToPrint: Sale[];
  formatCurrency: (val: number) => string;
}

export const PrintReportV1Backup: React.FC<PrintReportV1BackupProps> = ({
  isMounted,
  printingMonth,
  printSummary,
  salesToPrint,
  formatCurrency,
}) => {
  return (
    <div className="hidden print:block printable-area bg-white text-black p-10 font-sans">
      {/* Simple Header */}
      <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Laporan Penjualan (V1 Backup)</h1>
          <p className="text-sm font-medium text-gray-600 italic">Aspal Sales Analytics System</p>
        </div>
        <div className="text-right text-xs">
          <p>Tanggal Cetak: {isMounted ? new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
          <p className="mt-1">Ref ID: #{isMounted ? new Date().getTime().toString().slice(-6) : '......'}</p>
        </div>
      </div>

      {/* Summary Table Style */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 border-l-4 border-black pl-3 text-gray-700">
          Ringkasan Penjualan {printingMonth ? `(Periode: ${printingMonth.length > 7
            ? new Date(printingMonth).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : new Date(printingMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})` : ''}
        </h2>
        <div className="grid grid-cols-4 border border-black divide-x divide-black">
          <div className="p-4 bg-gray-50">
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Total Jual</p>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(printSummary.revenue)}</p>
          </div>
          <div className="p-4 bg-gray-50">
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Total Setor</p>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(printSummary.cost)}</p>
          </div>
          <div className="p-4 bg-gray-50">
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Sudah Dibayar</p>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(printSummary.paid)}</p>
          </div>
          <div className="p-4 bg-white">
            <p className="text-[10px] uppercase font-bold text-emerald-700 mb-1">Total Fee (Profit)</p>
            <p className="text-lg font-bold text-emerald-700 tabular-nums">{formatCurrency(printSummary.profit)}</p>
          </div>
        </div>
        <div className="mt-2 flex justify-end text-xs font-bold text-gray-700">
          {printSummary.overpaid > 0
            ? `Kelebihan setoran: ${formatCurrency(printSummary.overpaid)}`
            : `Sisa setoran: ${formatCurrency(printSummary.remaining)}`}
        </div>
      </div>

      {/* Transaction Table */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3 border-l-4 border-black pl-3 text-gray-700">Detail Transaksi</h2>
        <table className="w-full border border-black border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100 divide-x divide-black">
              <th className="p-3 font-bold border-b border-black">Tanggal</th>
              <th className="p-3 font-bold border-b border-black text-left">Deskripsi Produk</th>
              <th className="p-3 font-bold border-b border-black text-center">Qty</th>
              <th className="p-3 font-bold border-b border-black text-right">Harga Jual</th>
              <th className="p-3 font-bold border-b border-black text-right bg-emerald-50">Fee (Profit)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {salesToPrint.map((sale) => (
              <tr key={sale.id} className="divide-x divide-black">
                <td className="p-3">{new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                <td className="p-3">
                  <span className="font-bold uppercase">{sale.type}</span> ({Number(sale.weight)}kg)
                </td>
                <td className="p-3 text-center font-bold">{sale.quantity}</td>
                <td className="p-3 text-right">{formatCurrency(sale.totalPrice)}</td>
                <td className="p-3 text-right font-bold text-emerald-700 bg-emerald-50/50">
                  {formatCurrency(sale.totalPrice - sale.totalCost)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold border-t border-black divide-x divide-black">
              <td colSpan={3} className="p-3 text-right uppercase">Total Seluruhnya:</td>
              <td className="p-3 text-right">{formatCurrency(printSummary.revenue)}</td>
              <td className="p-3 text-right text-emerald-700">{formatCurrency(printSummary.profit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Standard Signatures */}
      <div className="mt-20 flex justify-end gap-24 px-4 text-xs">
        <div className="text-center">
          <p className="mb-20">Diterima Oleh,</p>
          <div className="border-b border-black w-40 mb-1"></div>
          <p>( Pak Jaja )</p>
        </div>
        <div className="text-center font-bold">
          <p className="mb-20">Hormat Kami,</p>
          <div className="border-b border-black w-40 mb-1"></div>
          <p>Rafi</p>
        </div>
      </div>
    </div>
  );
};
