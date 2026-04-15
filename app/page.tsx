'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  TrendingUp,
  Package,
  Calendar,
  ChevronRight,
  BarChart3,
  PieChart,
  History,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Printer
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
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

// --- Helper Functions ---

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

// --- Components ---

export default function BituCalcApp() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; saleId: string | null }>({ isOpen: false, saleId: null });
  const [activeTab, setActiveTab] = useState<'calculator' | 'analysis' | 'history'>('calculator');
  const [filterDate, setFilterDate] = useState<string>('');

  // Form State
  const [selectedType, setSelectedType] = useState<ProductType>('bitumax');
  const [weight, setWeight] = useState<number>(1);
  const [customWeight, setCustomWeight] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Analysis State
  const [statPeriod, setStatPeriod] = useState<'daily' | 'monthly'>('daily');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchSales();
  }, []);
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
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
      setQuantity(1);
      if (weight === 0) setCustomWeight('');
      
      setNotification({ message: 'Transaksi berhasil disimpan!', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ message: 'Gagal menyimpan transaksi.', type: 'error' });
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
      setNotification({ message: 'Transaksi berhasil dihapus.', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ message: 'Gagal menghapus transaksi.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setConfirmModal({ isOpen: false, saleId: null });
    }
  };

  // --- Analysis Computations ---

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

  const COLORS = ['#F97316', '#10B981', '#000000'];

  if (!mounted) return null;

  return (
    <div className="h-screen h-[100dvh] bg-card flex flex-col relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-primary font-black text-[16px] tracking-widest uppercase italic">AspalCalc</p>
              <p className="text-secondary text-[11px] font-bold uppercase tracking-widest mt-2">Memuat Data...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            className="flex-1 flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={32} />
            </div>
            <p className="text-primary font-black text-lg mb-2">Koneksi Gagal</p>
            <p className="text-secondary text-sm mb-6 leading-relaxed text-center">
              Tidak dapat terhubung ke database.<br/>Pastikan jaringan atau konfigurasi sudah benar.
            </p>
            <button
              onClick={() => fetchSales()}
              className="px-8 py-3 bg-primary text-white rounded-full text-[13px] font-bold shadow-lg"
            >
              Coba Lagi
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Header - Fixed at top */}
            <header className="px-6 pt-6 pb-2 shrink-0">
              <h1 className="text-[22px] font-[900] tracking-[-0.5px] text-primary">Sales Calc</h1>
              <p className="text-[12px] text-secondary">Aspal Distribution App</p>
            </header>

            {/* Main Content - Scrollable */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-32">
              <AnimatePresence mode="wait">
                {activeTab === 'calculator' && (
                  <motion.div
                    key="calc"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Summary Card */}
                    <div className="bg-primary text-white p-6 rounded-[24px] mb-2 shadow-lg shadow-primary/10">
                      <p className="text-secondary text-[10px] font-bold uppercase tracking-wider">Total Bagian (Fee)</p>
                      <h2 className="text-[28px] font-bold tracking-tight">{formatCurrency(totalProfit)}</h2>
                      <div className="mt-4 flex items-center justify-between text-[11px]">
                        <div className="flex flex-col">
                          <span className="text-secondary uppercase font-bold text-[9px]">Total Jual</span>
                          <span className="font-medium text-[13px]">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-secondary uppercase font-bold text-[9px]">Total Setor</span>
                          <span className="font-medium text-[13px]">{formatCurrency(totalCost)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[11px] font-black text-secondary uppercase tracking-[1px] block mb-3">Tipe Produk</span>
                        <div className="flex gap-2 flex-wrap">
                          {(['bitumax', 'hijau', 'hitam'] as ProductType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => setSelectedType(type)}
                              className={cn(
                                "px-6 py-2.5 rounded-[12px] text-[13px] font-[800] capitalize border-2 transition-all",
                                selectedType === type 
                                  ? "bg-primary border-primary text-white" 
                                  : "bg-white border-border text-secondary"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-black text-secondary uppercase tracking-[1px] block mb-3">Pilihan Berat</span>
                        <div className="grid grid-cols-2 gap-2">
                          {PRICES[selectedType].map((p) => (
                            <button
                              key={p.weight}
                              onClick={() => setWeight(p.weight)}
                              className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-[18px] border-2 transition-all relative",
                                weight === p.weight ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white border-border text-primary"
                              )}
                            >
                              <span className="text-[16px] font-black">{p.weight}kg</span>
                              {p.weight >= 5 && (
                                <span className={cn(
                                  "text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1",
                                  weight === p.weight ? "bg-white text-primary" : "bg-primary text-white"
                                )}>Hemat</span>
                              )}
                            </button>
                          ))}
                          <button
                            onClick={() => setWeight(0)}
                            className={cn(
                              "flex items-center justify-center p-4 rounded-[18px] border-2 transition-all font-black text-[15px]",
                              weight === 0 ? "bg-primary border-primary text-white" : "bg-white border-border text-primary"
                            )}
                          >
                            Custom
                          </button>
                        </div>
                      </div>

                      {weight === 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-bg p-4 rounded-[18px] border-2 border-primary/20"
                        >
                          <span className="text-[10px] font-black text-secondary uppercase tracking-widest block mb-2">Input Manual (kg)</span>
                          <input
                            type="number"
                            value={customWeight}
                            onChange={(e) => setCustomWeight(e.target.value)}
                            placeholder="0"
                            className="w-full bg-transparent text-2xl font-black focus:outline-none"
                          />
                        </motion.div>
                      )}

                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-secondary uppercase tracking-[1px] block mb-3">Jumlah (Quantity)</span>
                        <div className="flex items-center justify-between bg-bg p-2 rounded-[20px] border border-border">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm active:scale-95 transition-transform"
                          >
                            <span className="text-xl font-black">−</span>
                          </button>
                          <span className="text-[17px] font-black">{quantity} Units</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm active:scale-95 transition-transform"
                          >
                            <span className="text-xl font-black">+</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-dashed border-border">
                      <div className="bg-bg/50 p-6 rounded-[24px] border border-border space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-secondary text-[12px] font-bold">Harga Satuan ({effectiveWeight}kg)</span>
                          <span className="font-bold">{formatCurrency(calculatePricing(selectedType, effectiveWeight).price)}</span>
                        </div>
                        <div className="flex justify-between items-center text-success font-black bg-success/5 p-3 rounded-xl border border-success/10">
                          <span className="text-[11px] uppercase tracking-wider">Keuntungan Grosir</span>
                          <span className="text-[14px]">-{formatCurrency(Math.max(0, (PRICES[selectedType][0].price * effectiveWeight) - calculatePricing(selectedType, effectiveWeight).price))}</span>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col gap-2">
                        <div className="px-1">
                          <p className="text-[12px] font-bold text-secondary uppercase tracking-widest">Total Bayar</p>
                          <p className="text-4xl font-[900] tracking-tight text-primary mt-1">{formatCurrency(currentPrice)}</p>
                        </div>
                        <button
                          onClick={handleAddSale}
                          className="mt-4 w-full py-5 bg-primary text-white rounded-[24px] text-[17px] font-[900] tracking-wide active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                          Simpan Transaksi
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'analysis' && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-black text-secondary uppercase tracking-[1px]">Sales Analytics</span>
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest"
                      >
                        <Printer size={14} />
                        Cetak Laporan
                      </button>
                    </div>

                    <div className="flex bg-bg p-1 rounded-2xl border border-border">
                      <button
                        onClick={() => setStatPeriod('daily')}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                          statPeriod === 'daily' ? "bg-white text-primary shadow-sm" : "text-secondary"
                        )}
                      >Harian</button>
                      <button
                        onClick={() => setStatPeriod('monthly')}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                          statPeriod === 'monthly' ? "bg-white text-primary shadow-sm" : "text-secondary"
                        )}
                      >Bulanan</button>
                    </div>

                    <div className="bg-bg p-5 rounded-[24px] border border-border">
                      <h3 className="text-[11px] font-black text-secondary uppercase mb-6 tracking-widest">Grafik Pendapatan</h3>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={salesByPeriod}>
                            <XAxis 
                              dataKey="period" 
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 9, fontWeight: 700, fill: '#6B7280' }}
                            />
                            <Tooltip 
                              cursor={{ fill: '#f3f4f6' }}
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="revenue" fill="#111827" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-bg p-5 rounded-[24px] border border-border text-center">
                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Total Sales</p>
                        <p className="text-[20px] font-black">{sales.length}</p>
                      </div>
                      <div className="bg-bg p-5 rounded-[24px] border border-border text-center">
                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Setor Bagian</p>
                        <p className="text-[20px] font-black">{formatCurrency(totalCost).split(',')[0]}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-black text-secondary uppercase tracking-[1px]">Riwayat Penjualan</span>
                      <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full border border-border uppercase">
                        {filteredSales.length} Item
                      </span>
                    </div>

                    <div className="bg-bg p-3 rounded-[18px] flex items-center gap-3 border border-border">
                      <Calendar size={18} className="text-secondary" />
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="flex-1 bg-transparent text-[14px] font-bold focus:outline-none"
                      />
                      {filterDate && (
                        <button onClick={() => setFilterDate('')} className="text-[10px] font-black text-primary">CLEAR</button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {filteredSales.map((sale) => (
                        <div key={sale.id} className="bg-bg p-5 rounded-[22px] border border-border flex items-center justify-between shadow-sm">
                          <div>
                            <p className="text-[15px] font-black capitalize leading-none mb-1">{sale.type} {sale.weight}kg</p>
                            <p className="text-[11px] text-secondary font-bold">
                              {new Date(sale.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} • {sale.quantity} Unit
                            </p>
                            <p className="text-[11px] text-success font-black mt-1">Fee: {formatCurrency(sale.totalPrice - sale.totalCost)}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-[15px] font-black text-primary">{formatCurrency(sale.totalPrice)}</p>
                            <button onClick={() => handleDeleteSale(sale.id)} className="p-2 text-secondary hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {filteredSales.length === 0 && (
                        <div className="py-20 text-center opacity-50">
                          <Package size={48} className="mx-auto mb-4" />
                          <p className="text-sm font-bold">Belum ada transaksi</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Bottom Navigation - Fixed at bottom */}
            <nav className="shrink-0 bg-white/80 backdrop-blur-xl border-t border-border/50 px-6 py-5 pb-8 flex justify-center gap-16 items-center z-50">
              <button
                onClick={() => setActiveTab('calculator')}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all text-secondary",
                  activeTab === 'calculator' && "text-primary scale-110"
                )}
              >
                <Calculator size={22} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-widest">Calc</span>
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all text-secondary",
                  activeTab === 'analysis' && "text-primary scale-110"
                )}
              >
                <BarChart3 size={22} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-widest">Stats</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all text-secondary",
                  activeTab === 'history' && "text-primary scale-110"
                )}
              >
                <History size={22} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-widest">Log</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-24 left-6 right-6 z-[200] pointer-events-none"
          >
            <div className={cn(
              "p-4 rounded-[20px] shadow-2xl flex items-center gap-3 backdrop-blur-md border border-white/20",
              notification.type === 'success' ? "bg-success/90 text-white" : "bg-red-500/90 text-white"
            )}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Package size={16} />
              </div>
              <p className="text-[14px] font-[800] tracking-tight">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ isOpen: false, saleId: null })}
              className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-[280px] rounded-[32px] p-6 shadow-2xl relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <Trash2 size={28} />
              </div>
              <h3 className="text-[18px] font-black mb-1">Hapus Data?</h3>
              <p className="text-[12px] text-secondary font-medium mb-6">Data ini akan dihapus permanen.</p>
              <div className="flex flex-col gap-2">
                <button onClick={confirmDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl text-[14px] font-black active:scale-95 transition-transform">Ya, Hapus</button>
                <button onClick={() => setConfirmModal({ isOpen: false, saleId: null })} className="w-full py-3 text-secondary text-[13px] font-bold">Batal</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Print Report */}
      <div id="print-report" className="fixed inset-0 bg-white z-[9999] p-10 overflow-auto invisible print:visible pointer-events-none print:pointer-events-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">Sales Report</h1>
              <p className="text-secondary font-bold uppercase text-xs tracking-widest mt-1">ASPAL Distribution System</p>
            </div>
          </div>
          <table className="w-full text-left mt-10">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="py-4 text-[10px] uppercase font-black">Tanggal</th>
                <th className="py-4 text-[10px] uppercase font-black">Produk</th>
                <th className="py-4 text-right text-[10px] uppercase font-black">Penjualan</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-border/50">
                  <td className="py-4 text-sm font-medium">{sale.date}</td>
                  <td className="py-4 text-sm font-bold capitalize">{sale.type} {sale.weight}kg</td>
                  <td className="py-4 text-sm text-right font-bold">{formatCurrency(sale.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-20 border-t border-dashed pt-10 text-right">
            <p className="text-xs italic text-secondary">Dihasilkan oleh Bitucalc System - {new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
