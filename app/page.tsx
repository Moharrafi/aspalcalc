'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Trash2,
  Package,
  Calendar,
  BarChart3,
  History,
  Calculator,
  Printer,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
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

  const currentPricing = useMemo(() => {
    return calculatePricing(selectedType, effectiveWeight);
  }, [selectedType, effectiveWeight]);

  const totalPrice = currentPricing.price * quantity;

  const handleAddSale = async () => {
    const newSale: Sale = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString().split('T')[0],
      type: selectedType,
      weight: effectiveWeight,
      quantity,
      totalPrice: currentPricing.price * quantity,
      totalCost: currentPricing.cost * quantity,
    };

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSale),
      });
      if (!res.ok) throw new Error('Failed to save sale');
      setSales([newSale, ...sales]);
      setNotification({ message: 'Berhasil dikirim ke pusat!', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
      
      // Reset form
      setQuantity(1);
    } catch (error) {
      setNotification({ message: 'Gagal sinkronisasi data.', type: 'error' });
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
      setNotification({ message: 'Data berhasil dihapus.', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ message: 'Gagal menghapus data.', type: 'error' });
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
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-[6px] border-primary/5 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-[6px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center animate-pulse">
          <p className="text-primary font-black text-sm tracking-[3px] uppercase italic">Memuat Data</p>
          <p className="text-[10px] text-secondary mt-1 tracking-widest font-bold">Sinkronisasi Database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-10 text-center bg-white">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Trash2 size={32} />
        </div>
        <h2 className="text-xl font-black mb-2">Ops! Gangguan Server</h2>
        <p className="text-sm text-secondary mb-8 italic">{error}</p>
        <button 
          onClick={() => fetchSales()} 
          className="w-full max-w-[200px] py-4 bg-primary text-white rounded-2xl text-sm font-black shadow-xl"
        >
          Coba Hubungkan Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] bg-bg flex flex-col overflow-hidden relative font-sans text-primary">
      {/* Premium Header */}
      <header className="px-6 pt-8 pb-4 bg-white/50 backdrop-blur-md flex justify-between items-center transition-all duration-300">
        <div>
          <h1 className="text-[24px] font-[1000] tracking-tighter leading-none mb-1">Sales Calc</h1>
          <p className="text-[11px] text-secondary font-black uppercase tracking-widest opacity-60">Aspal Distribution v1.0</p>
        </div>
        <div className="bg-primary/5 p-2.5 rounded-2xl">
          <Package size={20} className="text-primary" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-32">
        {activeTab === 'calculator' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profit Dashboard Card */}
            <div className="bg-primary text-white p-7 rounded-[32px] shadow-2xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp size={80} />
              </div>
              <div className="relative z-10">
                <p className="text-white/50 text-[10px] font-black uppercase tracking-[2px] mb-1">Total Fee (Bersih)</p>
                <h2 className="text-[36px] font-[900] tracking-tighter">{formatCurrency(totalProfit)}</h2>
                
                <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div>
                    <span className="text-white/40 uppercase font-bold text-[9px] block mb-0.5 tracking-wider">Total Jual</span>
                    <span className="font-black text-[15px]">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white/40 uppercase font-bold text-[9px] block mb-0.5 tracking-wider">Total Setor</span>
                    <span className="font-black text-[15px]">{formatCurrency(totalCost)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selector */}
            <section>
              <h3 className="text-[10px] font-black text-secondary uppercase tracking-[2px] mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full" /> Pilih Produk
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                {(['bitumax', 'hijau', 'hitam'] as ProductType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "py-4 rounded-2xl text-[12px] font-black capitalize transition-all duration-300 border-2",
                      selectedType === type 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white border-transparent text-secondary hover:border-gray-200"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </section>

            {/* Weight Options */}
            <section>
              <h3 className="text-[10px] font-black text-secondary uppercase tracking-[2px] mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full" /> Berat (Kg)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {PRICES[selectedType].map((p) => (
                  <button
                    key={p.weight}
                    onClick={() => setWeight(p.weight)}
                    className={cn(
                      "flex items-center justify-between px-6 py-5 rounded-[24px] border-2 transition-all duration-300",
                      weight === p.weight 
                        ? "bg-white border-primary text-primary premium-shadow scale-95" 
                        : "bg-white border-transparent text-secondary"
                    )}
                  >
                    <span className="text-[18px] font-black">{p.weight}kg</span>
                    <ChevronRight size={18} className={cn("transition-transform", weight === p.weight ? "rotate-90 text-primary" : "text-gray-200")} />
                  </button>
                ))}
                <button
                  onClick={() => setWeight(0)}
                  className={cn(
                    "flex items-center justify-center p-5 rounded-[24px] border-2 transition-all duration-300 font-black text-[16px]",
                    weight === 0 ? "bg-white border-primary text-primary premium-shadow scale-95" : "bg-white border-transparent text-secondary"
                  )}
                >Custom</button>
              </div>
            </section>

            {weight === 0 && (
              <div className="bg-white p-6 rounded-[24px] premium-shadow border-2 border-primary/10 animate-in zoom-in-95 duration-200">
                <span className="text-[9px] font-black text-secondary uppercase block mb-2 tracking-widest">Input Berat Manual</span>
                <div className="flex items-end gap-2">
                  <input
                    type="number"
                    autoFocus
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                    className="flex-1 bg-transparent text-4xl font-black focus:outline-none placeholder:text-gray-100"
                    placeholder="0"
                  />
                  <span className="text-xl font-black pb-1.5 text-secondary">Kg</span>
                </div>
              </div>
            )}

            {/* Quantity Controls */}
            <section>
              <h3 className="text-[10px] font-black text-secondary uppercase tracking-[2px] mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full" /> Jumlah Unit
              </h3>
              <div className="flex items-center justify-between bg-white p-3 rounded-[24px] premium-shadow border border-gray-50">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-2xl active:scale-90 transition-transform"
                >
                  <span className="text-2xl font-bold">−</span>
                </button>
                <div className="text-center">
                  <span className="text-[20px] font-black">{quantity}</span>
                  <span className="text-[10px] block font-bold text-secondary uppercase tracking-widest">Pcs</span>
                </div>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="w-14 h-14 flex items-center justify-center bg-primary text-white rounded-2xl active:scale-90 transition-transform shadow-lg shadow-primary/20"
                >
                  <Plus size={24} />
                </button>
              </div>
            </section>

            {/* Summary & Actions */}
            <section className="pt-6 border-t-2 border-dashed border-gray-200 space-y-6">
              <div className="bg-white p-6 rounded-[28px] border border-gray-100 space-y-4">
                <div className="flex justify-between items-center text-[12px] font-black">
                  <span className="text-secondary flex items-center gap-2"><CreditCard size={14} /> Harga Per Unit</span>
                  <span>{formatCurrency(currentPricing.price)}</span>
                </div>
                <div className="flex justify-between items-center text-success bg-success/5 p-4 rounded-2xl border border-success/10 font-black text-[13px]">
                  <span className="flex items-center gap-2 text-[11px]">💰 Grosir Save</span>
                  <span>-{formatCurrency(Math.max(0, (PRICES[selectedType][0].price * effectiveWeight) - currentPricing.price))}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-end justify-between px-2">
                  <div>
                    <p className="text-[11px] font-black text-secondary uppercase tracking-[3px] mb-1">Total Bill</p>
                    <p className="text-[38px] font-[1000] tracking-tighter text-primary leading-none">{formatCurrency(totalPrice)}</p>
                  </div>
                </div>
                <button
                  onClick={handleAddSale}
                  className="w-full py-5 bg-primary text-white rounded-[24px] text-[16px] font-[900] shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  <Plus size={20} /> Simpan Penjualan
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black tracking-tight">Analytics</h2>
              <button 
                onClick={() => window.print()} 
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-full text-[10px] font-black uppercase shadow-sm border border-gray-100"
              >
                <Printer size={14} /> Export Report
              </button>
            </div>

            <div className="flex bg-white/50 p-1.5 rounded-[20px] shadow-sm border border-gray-100">
              <button onClick={() => setStatPeriod('daily')} className={cn("flex-1 py-3 rounded-[15px] text-[11px] font-[800] tracking-widest uppercase transition-all", statPeriod === 'daily' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-secondary")}>Hari</button>
              <button onClick={() => setStatPeriod('monthly')} className={cn("flex-1 py-3 rounded-[15px] text-[11px] font-[800] tracking-widest uppercase transition-all", statPeriod === 'monthly' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-secondary")}>Bulan</button>
            </div>

            <div className="bg-white p-6 rounded-[32px] premium-shadow border border-gray-50">
              <div className="flex justify-between items-center mb-8">
                <p className="text-[11px] font-black text-secondary uppercase tracking-[2px]">Revenue Growth</p>
                <div className="px-3 py-1 bg-success/10 text-success rounded-full text-[9px] font-black">+ LIVE</div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByPeriod}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                    <Tooltip 
                      cursor={{fill: 'var(--color-bg)', radius: 10}} 
                      contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900}} 
                    />
                    <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[28px] premium-shadow border border-gray-50">
                <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1.5">Trx Count</p>
                <p className="text-[26px] font-[900] tracking-tighter">{sales.length}</p>
                <div className="w-8 h-1 bg-primary/20 rounded-full mt-2" />
              </div>
              <div className="bg-white p-6 rounded-[28px] premium-shadow border border-gray-50">
                <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1.5">Avg Bill</p>
                <p className="text-[22px] font-[900] tracking-tighter leading-8">{formatCurrency(sales.length ? totalRevenue / sales.length : 0).split(',')[0]}</p>
                <div className="w-8 h-1 bg-success/20 rounded-full mt-2" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight">Recent Log</h2>
              <span className="text-[10px] font-[900] bg-primary text-white px-3 py-1.5 rounded-full uppercase tracking-tighter">{filteredSales.length} Transactions</span>
            </div>

            <div className="bg-white p-4 rounded-[24px] flex items-center gap-4 premium-shadow border border-gray-50 group focus-within:border-primary/20 transition-all">
              <Calendar size={20} className="text-secondary group-focus-within:text-primary transition-colors" />
              <input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)} 
                className="flex-1 bg-transparent text-sm font-black focus:outline-none appearance-none" 
              />
            </div>

            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="bg-white p-6 rounded-[28px] premium-shadow border border-gray-50 flex items-center justify-between group hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-bg flex items-center justify-center font-black group-hover:bg-primary/5 transition-colors">
                      {sale.type.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[15px] font-[900] capitalize leading-tight">{sale.type} {sale.weight}kg</p>
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-0.5">{sale.date} • {sale.quantity} Unit</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-[16px] font-[1000] tracking-tighter text-primary">{formatCurrency(sale.totalPrice)}</p>
                    <button 
                      onClick={() => handleDeleteSale(sale.id)} 
                      className="p-2 text-secondary hover:text-red-500 transition-colors mt-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredSales.length === 0 && (
                <div className="py-24 text-center">
                  <Package size={48} className="mx-auto mb-4 text-gray-200" />
                  <p className="text-sm font-black text-secondary">Belum ada data tersedia</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-100/50 px-8 py-5 pb-8 flex justify-between items-center z-50 rounded-t-[32px] premium-shadow">
        <button 
          onClick={() => setActiveTab('calculator')} 
          className={cn("flex flex-col items-center gap-1.5 transition-all duration-300", activeTab === 'calculator' ? "text-primary scale-110" : "text-secondary opacity-50")}
        >
          <Calculator size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-[1.5px]">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('analysis')} 
          className={cn("flex flex-col items-center gap-1.5 transition-all duration-300", activeTab === 'analysis' ? "text-primary scale-110" : "text-secondary opacity-50")}
        >
          <BarChart3 size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-[1.5px]">Stats</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={cn("flex flex-col items-center gap-1.5 transition-all duration-300", activeTab === 'history' ? "text-primary scale-110" : "text-secondary opacity-50")}
        >
          <History size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-[1.5px]">Logs</span>
        </button>
      </nav>

      {/* Persistent Notification Portal */}
      {notification && (
        <div className="fixed bottom-28 left-6 right-6 z-[200] animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className={cn(
            "p-5 rounded-[24px] shadow-2xl flex items-center gap-4 text-white premium-shadow", 
            notification.type === 'success' ? "bg-primary" : "bg-red-500"
          )}>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ChevronRight size={16} />
            </div>
            <p className="text-[13px] font-black tracking-tight">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Modern Confirmation Drawer/Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center">
          <div 
            onClick={() => setConfirmModal({ isOpen: false, saleId: null })} 
            className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
          />
          <div className="bg-white w-full rounded-t-[40px] p-10 shadow-2xl relative z-10 animate-in slide-in-from-bottom-full duration-500">
            <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-8" />
            <h3 className="text-2xl font-[1000] tracking-tighter text-center mb-2">Hapus Data?</h3>
            <p className="text-sm text-secondary text-center mb-10 font-bold">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDelete} 
                className="w-full py-5 bg-red-500 text-white rounded-[24px] font-black text-sm active:scale-95 transition-transform"
              >
                Ya, Hapus Permanen
              </button>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, saleId: null })} 
                className="w-full py-4 text-secondary text-sm font-black"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print-only Report Section - Hidden by display:none explicitly to prevent leakage during unstyled rendering */}
      <div 
        id="print-report" 
        style={{ display: 'none' }} 
        className="print:block print:relative fixed inset-0 bg-white z-[9999] p-10 font-sans text-black"
      >
        <div className="border-b-4 border-black pb-6 mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Sales Report</h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-1">ASPAL Distribution System</p>
        </div>

        <div className="space-y-6 mb-10">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-500">Report Generated</p>
            <p className="text-lg font-bold">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="grid grid-cols-3 gap-8 border-y-2 border-black py-6">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500">Total Jual (Revenue)</p>
              <p className="text-xl font-black">{formatCurrency(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500">Total Setor (Cost)</p>
              <p className="text-xl font-black">{formatCurrency(totalCost)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-500">Total Fee (Profit)</p>
              <p className="text-xl font-black text-green-600">{formatCurrency(totalProfit)}</p>
            </div>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-3 text-[10px] font-black uppercase">Tanggal</th>
              <th className="py-3 text-[10px] font-black uppercase">Produk</th>
              <th className="py-3 text-[10px] font-black uppercase">Berat</th>
              <th className="py-3 text-[10px] font-black uppercase">Qty</th>
              <th className="py-3 text-[10px] font-black uppercase">Penjualan</th>
              <th className="py-3 text-right text-[10px] font-black uppercase">Fee</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-gray-200">
                <td className="py-3 text-[11px] font-medium">{sale.date}</td>
                <td className="py-3 text-[11px] font-bold capitalize">{sale.type}</td>
                <td className="py-3 text-[11px] font-bold">{sale.weight}kg</td>
                <td className="py-3 text-[11px] font-bold">{sale.quantity}</td>
                <td className="py-3 text-[11px] font-black">{formatCurrency(sale.totalPrice)}</td>
                <td className="py-3 text-[11px] text-right font-black text-green-600">{formatCurrency(sale.totalPrice - sale.totalCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-20 flex justify-between items-end">
          <div className="text-[10px] text-gray-400 italic">
            <p>* Laporan ini dihasilkan secara otomatis oleh sistem.</p>
            <p>Bitucalc System v1.0</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold mb-16">Hormat Kami,</p>
            <p className="text-md font-black">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
