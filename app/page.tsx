'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Trash2,
  Package,
  Calendar,
  BarChart3,
  History,
  Calculator,
  Printer
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Data Types & Constants ---

type ProductType = 'bitumax' | 'hijau' | 'hitam';

interface PricePoint {
  weight: number;
  price: number;
  cost: number;
}

const PRICES: Record<ProductType, PricePoint[]> = {
  bitumax: [
    { weight: 1, price: 50000, cost: 40000 },
    { weight: 5, price: 190000, cost: 152000 },
    { weight: 20, price: 720000, cost: 606000 },
  ],
  hijau: [
    { weight: 1, price: 33000, cost: 26400 },
    { weight: 5, price: 130000, cost: 104000 },
    { weight: 20, price: 600000, cost: 480000 },
    { weight: 25, price: 650000, cost: 520000 },
  ],
  hitam: [
    { weight: 1, price: 33000, cost: 26400 },
    { weight: 5, price: 130000, cost: 104000 },
    { weight: 20, price: 600000, cost: 480000 },
    { weight: 25, price: 650000, cost: 520000 },
  ],
};

interface Sale {
  id: string;
  date: string;
  type: ProductType;
  weight: number;
  quantity: number;
  totalPrice: number;
  totalCost: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const calculatePricing = (type: ProductType, weight: number): { price: number; cost: number } => {
  const options = [...PRICES[type]].sort((a, b) => b.weight - a.weight);
  let remainingWeight = weight;
  let totalPrice = 0;
  let totalCost = 0;

  for (const option of options) {
    const count = Math.floor(remainingWeight / option.weight);
    if (count > 0) {
      totalPrice += count * option.price;
      totalCost += count * option.cost;
      remainingWeight %= option.weight;
    }
  }

  if (remainingWeight > 0) {
    const firstOption = PRICES[type].find(p => p.weight === 1) || PRICES[type][0];
    const ratio = remainingWeight / firstOption.weight;
    totalPrice += ratio * firstOption.price;
    totalCost += ratio * firstOption.cost;
  }

  return { price: totalPrice, cost: totalCost };
};

export default function BituCalcApp() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; saleId: string | null }>({ isOpen: false, saleId: null });
  const [activeTab, setActiveTab] = useState<'calculator' | 'analysis' | 'history'>('calculator');
  const [filterDate, setFilterDate] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // Form State
  const [selectedType, setSelectedType] = useState<ProductType>('bitumax');
  const [weight, setWeight] = useState<number>(1);
  const [customWeight, setCustomWeight] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [statPeriod, setStatPeriod] = useState<'daily' | 'monthly'>('daily');

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch sales');
      
      const formattedData = data.map((s: any) => ({
        ...s,
        weight: Number(s.weight),
        totalPrice: Number(s.totalPrice),
        totalCost: Number(s.totalCost) || 0,
        quantity: Number(s.quantity) || 1
      }));
      setSales(formattedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSales();
  }, []);

  const filteredSales = useMemo(() => {
    if (!filterDate) return sales;
    return sales.filter(s => s.date === filterDate || s.date.startsWith(filterDate));
  }, [sales, filterDate]);

  const effectiveWeight = useMemo(() => {
    return weight === 0 ? (parseFloat(customWeight) || 0) : weight;
  }, [weight, customWeight]);

  const currentPrice = useMemo(() => {
    return calculatePricing(selectedType, effectiveWeight).price * quantity;
  }, [selectedType, effectiveWeight, quantity]);

  const handleAddSale = async () => {
    const pricing = calculatePricing(selectedType, effectiveWeight);
    const newSale: Sale = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString().split('T')[0],
      type: selectedType,
      weight: effectiveWeight,
      quantity,
      totalPrice: pricing.price * quantity,
      totalCost: pricing.cost * quantity,
    };

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSale),
      });
      if (!res.ok) throw new Error('Failed to save sale');
      setSales([newSale, ...sales]);
      setNotification({ message: 'Berhasil disimpan!', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ message: 'Gagal menyimpan.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteSale = async (id: string) => {
    setConfirmModal({ isOpen: true, saleId: id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.saleId) return;
    const id = confirmModal.saleId;
    try {
      const res = await fetch(`/api/sales?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete sale');
      setSales(sales.filter(s => s.id !== id));
      setNotification({ message: 'Berhasil dihapus.', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ message: 'Gagal menghapus.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setConfirmModal({ isOpen: false, saleId: null });
    }
  };

  const totalRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.totalPrice, 0), [sales]);
  const totalCost = useMemo(() => sales.reduce((acc, s) => acc + s.totalCost, 0), [sales]);
  const totalProfit = useMemo(() => totalRevenue - totalCost, [totalRevenue, totalCost]);

  const salesByPeriod = useMemo(() => {
    const data: Record<string, { revenue: number }> = {};
    [...sales].reverse().forEach(s => {
      const key = statPeriod === 'daily' ? s.date.split('-').slice(1).join('/') : s.date.substring(0, 7);
      if (!data[key]) data[key] = { revenue: 0 };
      data[key].revenue += s.totalPrice;
    });
    return Object.entries(data).map(([period, stats]) => ({ period, ...stats }));
  }, [sales, statPeriod]);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-bold text-sm tracking-widest uppercase italic">Memuat Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
        <Trash2 size={48} className="text-red-500 mb-4" />
        <p className="font-bold mb-2">Gagal Terhubung</p>
        <p className="text-xs text-secondary mb-6 italic">{error}</p>
        <button onClick={() => fetchSales()} className="px-6 py-2 bg-primary text-white rounded-full text-xs font-bold">Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] bg-card flex flex-col overflow-hidden relative font-sans antialiased text-primary selection:bg-primary/10">
      <header className="px-6 pt-6 pb-2 shrink-0">
        <h1 className="text-[22px] font-[900] tracking-[-0.5px]">Sales Calc</h1>
        <p className="text-[12px] text-secondary">Aspal Distribution App</p>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-32">
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="bg-primary text-white p-6 rounded-[24px] shadow-lg shadow-primary/10">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Total Bagian (Fee)</p>
              <h2 className="text-[28px] font-bold tracking-tight">{formatCurrency(totalProfit)}</h2>
              <div className="mt-4 flex items-center justify-between text-[11px] border-t border-white/10 pt-4">
                <div className="flex flex-col">
                  <span className="text-white/60 uppercase font-bold text-[9px]">Total Jual</span>
                  <span className="font-medium text-[13px]">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-white/60 uppercase font-bold text-[9px]">Total Setor</span>
                  <span className="font-medium text-[13px]">{formatCurrency(totalCost)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black text-secondary uppercase tracking-[1.5px] block mb-4">Tipe Produk</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['bitumax', 'hijau', 'hitam'] as ProductType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        "py-3 rounded-[14px] text-[12px] font-bold capitalize border-2 transition-all",
                        selectedType === type ? "bg-primary border-primary text-white" : "bg-white border-border text-secondary"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-secondary uppercase tracking-[1.5px] block mb-4">Pilihan Berat</span>
                <div className="grid grid-cols-2 gap-3">
                  {PRICES[selectedType].map((p) => (
                    <button
                      key={p.weight}
                      onClick={() => setWeight(p.weight)}
                      className={cn(
                        "flex flex-col items-center justify-center p-5 rounded-[20px] border-2 transition-all",
                        weight === p.weight ? "bg-primary border-primary text-white shadow-md shadow-primary/20" : "bg-white border-border text-primary"
                      )}
                    >
                      <span className="text-[18px] font-black">{p.weight}kg</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setWeight(0)}
                    className={cn(
                      "flex items-center justify-center p-5 rounded-[20px] border-2 transition-all font-black text-[16px]",
                      weight === 0 ? "bg-primary border-primary text-white" : "bg-white border-border text-primary"
                    )}
                  >Custom</button>
                </div>
              </div>

              {weight === 0 && (
                <div className="bg-bg p-4 rounded-[18px] border-2 border-primary/20">
                  <span className="text-[10px] font-black text-secondary uppercase block mb-1">Kg Manual</span>
                  <input
                    type="number"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                    className="w-full bg-transparent text-2xl font-black focus:outline-none"
                    placeholder="0"
                  />
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-[10px] font-black text-secondary uppercase tracking-[1.5px] block mb-4">Quantity</span>
                <div className="flex items-center justify-between bg-bg p-2 rounded-[18px] border border-border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm">
                    <span className="text-xl font-bold">−</span>
                  </button>
                  <span className="text-lg font-black">{quantity} Units</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm">
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-dashed border-border">
              <div className="bg-bg/50 p-6 rounded-[24px] border border-border space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-secondary">Harga Satuan</span>
                  <span>{formatCurrency(calculatePricing(selectedType, effectiveWeight).price)}</span>
                </div>
                <div className="flex justify-between items-center text-success bg-success/5 p-3 rounded-xl border border-success/10 font-black text-[13px]">
                  <span>Hemat Grosir</span>
                  <span>-{formatCurrency(Math.max(0, (PRICES[selectedType][0].price * effectiveWeight) - calculatePricing(selectedType, effectiveWeight).price))}</span>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-[11px] font-black text-secondary uppercase tracking-widest mb-1">Total Penjualan</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-[1000] tracking-tighter text-primary">{formatCurrency(currentPrice)}</p>
                  <button
                    onClick={handleAddSale}
                    className="px-8 py-4 bg-primary text-white rounded-[20px] text-[15px] font-black shadow-xl shadow-primary/20 active:scale-95 transition-transform"
                  >Simpan</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-secondary uppercase tracking-widest">Analytics</span>
              <button 
                onClick={() => window.print()} 
                className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase"
              >
                <Printer size={14} /> Cetak
              </button>
            </div>

            <div className="flex bg-bg p-1 rounded-2xl border border-border">
              <button onClick={() => setStatPeriod('daily')} className={cn("flex-1 py-2 rounded-xl text-[11px] font-bold transition-all", statPeriod === 'daily' ? "bg-white shadow-sm" : "text-secondary")}>Hari</button>
              <button onClick={() => setStatPeriod('monthly')} className={cn("flex-1 py-2 rounded-xl text-[11px] font-bold transition-all", statPeriod === 'monthly' ? "bg-white shadow-sm" : "text-secondary")}>Bulan</button>
            </div>

            <div className="bg-bg p-5 rounded-[24px] border border-border">
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByPeriod}>
                    <XAxis dataKey="period" hide />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                    <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg p-5 rounded-[22px] border border-border">
                <p className="text-[9px] font-black text-secondary uppercase mb-1">Sales Count</p>
                <p className="text-[22px] font-black">{sales.length}</p>
              </div>
              <div className="bg-bg p-5 rounded-[22px] border border-border">
                <p className="text-[9px] font-black text-secondary uppercase mb-1">Setor Bagian</p>
                <p className="text-[20px] font-black">{formatCurrency(totalCost).split(',')[0]}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-secondary uppercase">Recent Log</span>
              <span className="text-[10px] font-black bg-bg px-2 py-1 rounded-lg border border-border uppercase">{filteredSales.length} Item</span>
            </div>

            <div className="bg-bg p-3 rounded-[16px] flex items-center gap-3 border border-border">
              <Calendar size={18} className="text-secondary" />
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="flex-1 bg-transparent text-sm font-bold focus:outline-none" />
            </div>

            <div className="space-y-3">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="bg-bg p-5 rounded-[20px] border border-border flex items-center justify-between">
                  <div>
                    <p className="text-[15px] font-black capitalize">{sale.type} {sale.weight}kg</p>
                    <p className="text-[11px] text-secondary font-bold">{sale.date} • {sale.quantity} Unit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-black">{formatCurrency(sale.totalPrice)}</p>
                    <button onClick={() => handleDeleteSale(sale.id)} className="p-1 text-secondary mt-1"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <nav className="shrink-0 bg-white/90 backdrop-blur-xl border-t border-border/50 px-10 py-5 pb-8 flex justify-center gap-14 items-center z-50">
        <button onClick={() => setActiveTab('calculator')} className={cn("flex flex-col items-center gap-1.5", activeTab === 'calculator' ? "text-primary scale-110" : "text-secondary")}>
          <Calculator size={22} /><span className="text-[9px] font-black uppercase">Calc</span>
        </button>
        <button onClick={() => setActiveTab('analysis')} className={cn("flex flex-col items-center gap-1.5", activeTab === 'analysis' ? "text-primary scale-110" : "text-secondary")}>
          <BarChart3 size={22} /><span className="text-[9px] font-black uppercase">Stats</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={cn("flex flex-col items-center gap-1.5", activeTab === 'history' ? "text-primary scale-110" : "text-secondary")}>
          <History size={22} /><span className="text-[9px] font-black uppercase">Log</span>
        </button>
      </nav>

      {notification && (
        <div className="fixed bottom-24 left-6 right-6 z-[200]">
          <div className={cn("p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white", notification.type === 'success' ? "bg-primary" : "bg-red-500")}>
            <p className="text-sm font-black">{notification.message}</p>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-8">
          <div onClick={() => setConfirmModal({ isOpen: false, saleId: null })} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
          <div className="bg-white w-full max-w-[280px] rounded-[30px] p-6 shadow-2xl relative z-10 text-center">
            <h3 className="text-lg font-black mb-1">Hapus?</h3>
            <p className="text-xs text-secondary mb-6">Data permanen hilang.</p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmDelete} className="py-4 bg-red-500 text-white rounded-2xl font-black text-sm">Ya, Hapus</button>
              <button onClick={() => setConfirmModal({ isOpen: false, saleId: null })} className="py-2 text-secondary text-sm font-bold">Batal</button>
            </div>
          </div>
        </div>
      )}

      <div id="print-report" className="hidden print:block print:absolute inset-0 bg-white z-[9999] p-10 font-sans text-black">
        <h1 className="text-3xl font-black mb-10">SALES REPORT</h1>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-4 font-black uppercase text-xs">Tanggal</th>
              <th className="py-4 font-black uppercase text-xs">Produk</th>
              <th className="py-4 text-right font-black uppercase text-xs">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-gray-100">
                <td className="py-4 text-sm">{sale.date}</td>
                <td className="py-4 text-sm font-bold">{sale.type} {sale.weight}kg</td>
                <td className="py-4 text-sm text-right font-black">{formatCurrency(sale.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
