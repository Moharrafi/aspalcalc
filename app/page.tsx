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
  Line
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

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch sales');

      // Convert database strings/decimals to numbers to avoid NaN
      const formattedData = data.map((s: any) => ({
        ...s,
        weight: Number(s.weight),
        totalPrice: Number(s.totalPrice),
        totalCost: Number(s.totalCost),
        quantity: Number(s.quantity)
      }));

      setSales(formattedData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
  const totalWeight = useMemo(() => sales.reduce((acc, s) => acc + (s.weight * s.quantity), 0), [sales]);

  const salesByType = useMemo(() => {
    const data: Record<string, number> = { bitumax: 0, hijau: 0, hitam: 0 };
    sales.forEach(s => {
      data[s.type] += s.totalPrice;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [sales]);

  const salesByPeriod = useMemo(() => {
    const data: Record<string, { revenue: number; cost: number; fee: number; weight: number; count: number }> = {};

    [...sales].reverse().forEach(s => {
      const key = statPeriod === 'daily'
        ? s.date
        : s.date.substring(0, 7); // YYYY-MM

      if (!data[key]) {
        data[key] = { revenue: 0, cost: 0, fee: 0, weight: 0, count: 0 };
      }

      data[key].revenue += s.totalPrice;
      data[key].cost += s.totalCost;
      data[key].fee += (s.totalPrice - s.totalCost);
      data[key].weight += (s.weight * s.quantity);
      data[key].count += 1;
    });

    return Object.entries(data).map(([period, stats]) => ({
      period: statPeriod === 'daily'
        ? period.split('-').slice(1).join('/')
        : new Date(period + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      fullPeriod: period,
      ...stats
    }));
  }, [sales, statPeriod]);

  const COLORS = ['#F97316', '#10B981', '#000000'];

  return (
    <div className="h-screen h-[100dvh] bg-card flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="px-6 pt-6 pb-2">
          <h1 className="text-[22px] font-[900] tracking-[-0.5px] text-primary">Sales Calc</h1>
          <p className="text-[12px] text-secondary">Aspal Distribution App</p>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-24">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-secondary text-[12px] font-bold uppercase tracking-widest">Memuat Data...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                className="h-full flex flex-col items-center justify-center text-center p-6"
              >
                <p className="text-red-500 font-bold mb-2">Gagal terhubung ke Database</p>
                <p className="text-secondary text-[11px] mb-4">Pastikan konfigurasi .env sudah benar</p>
                <button
                  onClick={() => fetchSales()}
                  className="px-4 py-2 bg-primary text-white rounded-full text-[12px] font-bold"
                >
                  Coba Lagi
                </button>
              </motion.div>
            ) : (
              <>
                {activeTab === 'calculator' && (
                  <motion.div
                    key="calc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {/* Summary Card */}
                    <div className="bg-primary text-white p-6 rounded-[24px] mb-6">
                      <p className="text-secondary text-[10px] font-bold uppercase tracking-wider">Total Bagian (Fee)</p>
                      <h2 className="text-[28px] font-bold tracking-tight">{formatCurrency(totalProfit)}</h2>
                      <div className="mt-4 flex items-center justify-between text-[11px]">
                        <div className="flex flex-col">
                          <span className="text-secondary uppercase font-bold">Total Jual</span>
                          <span className="font-medium">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-secondary uppercase font-bold">Total Setor</span>
                          <span className="font-medium">{formatCurrency(totalCost)}</span>
                        </div>
                      </div>
                    </div>
                    <span className="section-label">Type</span>
                    <div className="flex gap-2 flex-wrap">
                      {(['bitumax', 'hijau', 'hitam'] as ProductType[]).map((type, idx) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={cn(
                            "chip capitalize",
                            selectedType === type
                              ? "text-white border-transparent"
                              : "bg-transparent"
                          )}
                          style={selectedType === type ? { backgroundColor: COLORS[idx] } : {}}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <span className="section-label">Weight Option</span>
                    <div className="grid grid-cols-2 gap-2">
                      {PRICES[selectedType].map((p) => (
                        <button
                          key={p.weight}
                          onClick={() => setWeight(p.weight)}
                          className={cn(
                            "chip flex items-center justify-between",
                            weight === p.weight ? "chip-active" : "bg-transparent"
                          )}
                        >
                          <span>{p.weight}kg</span>
                          {p.weight >= 5 && (
                            <span className={cn(
                              "text-[8px] uppercase px-1.5 py-0.5 rounded font-bold",
                              weight === p.weight ? "bg-white text-primary" : "bg-primary text-white"
                            )}>
                              Best Value
                            </span>
                          )}
                        </button>
                      ))}
                      <button
                        onClick={() => setWeight(0)}
                        className={cn(
                          "chip",
                          weight === 0 ? "chip-active" : "bg-transparent"
                        )}
                      >
                        Custom
                      </button>
                    </div>

                    {weight === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-bg p-4 rounded-[16px] border border-border mt-2"
                      >
                        <span className="text-[10px] font-bold uppercase text-secondary mb-2 block">Input Custom Weight (kg)</span>
                        <input
                          type="number"
                          value={customWeight}
                          onChange={(e) => setCustomWeight(e.target.value)}
                          placeholder="Enter weight in kg..."
                          className="w-full bg-transparent text-[16px] font-bold focus:outline-none"
                        />
                      </motion.div>
                    )}

                    <span className="section-label">Quantity</span>
                    <div className="flex items-center justify-between bg-bg p-2 rounded-[16px]">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-[8px] bg-white border border-border flex items-center justify-center font-bold"
                      >
                        −
                      </button>
                      <div className="font-bold text-[14px]">{quantity} Units</div>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-[8px] bg-white border border-border flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="analysis-card mt-6">
                      <span className="text-[12px] uppercase font-bold text-secondary tracking-[0.5px] mb-2 block">Sales Analysis</span>
                      <div className="flex justify-between text-[13px] mb-2">
                        <span className="text-secondary">Unit Price ({effectiveWeight}kg)</span>
                        <span className="font-medium">{formatCurrency(calculatePricing(selectedType, effectiveWeight).price)}</span>
                      </div>
                      <div className="flex justify-between text-[13px] mb-2">
                        <span className="text-secondary">Price/kg</span>
                        <span className="font-medium">{formatCurrency(calculatePricing(selectedType, effectiveWeight).price / (effectiveWeight || 1))}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-success font-semibold">Bulk Saving</span>
                        <span className="text-success font-semibold">
                          -{formatCurrency(Math.max(0, (PRICES[selectedType][0].price * effectiveWeight) - calculatePricing(selectedType, effectiveWeight).price))}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex flex-col">
                      <span className="text-[14px] text-secondary">Total Price</span>
                      <span className="text-[32px] font-[800] tracking-[-1px]">{formatCurrency(currentPrice)}</span>
                      <button
                        onClick={handleAddSale}
                        className="w-full bg-primary text-white py-4 rounded-[16px] font-bold mt-4 hover:opacity-90 transition-opacity"
                      >
                        Record Sale
                      </button>
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
                    {/* Header with Print Button */}
                    <div className="flex items-center justify-between">
                      <span className="section-label !mt-0 !mb-0">Sales Analytics</span>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full text-[12px] font-bold text-primary hover:bg-bg transition-colors"
                      >
                        <Printer size={14} />
                        <span>Print Report</span>
                      </button>
                    </div>

                    {/* Period Selector */}
                    <div className="flex bg-bg p-1 rounded-[16px] border border-border">
                      <button
                        onClick={() => setStatPeriod('daily')}
                        className={cn(
                          "flex-1 py-2 rounded-[12px] text-[12px] font-bold transition-all",
                          statPeriod === 'daily' ? "bg-white shadow-sm text-primary" : "text-secondary"
                        )}
                      >
                        Daily
                      </button>
                      <button
                        onClick={() => setStatPeriod('monthly')}
                        className={cn(
                          "flex-1 py-2 rounded-[12px] text-[12px] font-bold transition-all",
                          statPeriod === 'monthly' ? "bg-white shadow-sm text-primary" : "text-secondary"
                        )}
                      >
                        Monthly
                      </button>
                    </div>

                    <div className="bg-primary text-white p-6 rounded-[24px]">
                      <p className="text-secondary text-[10px] font-bold uppercase tracking-wider">Total Bagian (Fee)</p>
                      <h2 className="text-[28px] font-bold tracking-tight">{formatCurrency(totalProfit)}</h2>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-[11px]">
                        <div className="bg-white/5 p-3 rounded-[16px]">
                          <span className="text-secondary uppercase font-bold block mb-1">Total Jual</span>
                          <span className="font-medium text-[14px]">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-[16px]">
                          <span className="text-secondary uppercase font-bold block mb-1">Total Setor</span>
                          <span className="font-medium text-[14px]">{formatCurrency(totalCost)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="analysis-card">
                      <h3 className="text-[12px] font-bold uppercase text-secondary mb-4">Revenue Timeline ({statPeriod})</h3>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={salesByPeriod} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#111827" stopOpacity={1} />
                                <stop offset="100%" stopColor="#111827" stopOpacity={0.7} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis
                              dataKey="period"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 600 }}
                              dy={10}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 9, fill: '#9CA3AF' }}
                              tickFormatter={(value) => `Rp${value / 1000}k`}
                            />
                            <Tooltip
                              cursor={{ fill: '#F9FAFB' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                              formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[6, 6, 0, 0]} barSize={statPeriod === 'daily' ? 12 : 30} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Timeline History */}
                    <div className="space-y-4">
                      <span className="section-label">Timeline History</span>
                      {[...salesByPeriod].reverse().map((item) => (
                        <div key={item.fullPeriod} className="bg-bg p-4 rounded-[20px] border border-border">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[14px] font-[800]">{item.period}</span>
                            <span className="text-[10px] font-bold text-secondary uppercase bg-white px-2 py-1 rounded-full border border-border">
                              {item.count} Trans
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase font-bold text-secondary">Revenue</span>
                              <span className="text-[12px] font-bold">{formatCurrency(item.revenue)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase font-bold text-secondary">Setor</span>
                              <span className="text-[12px] font-bold">{formatCurrency(item.cost)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase font-bold text-secondary">Fee</span>
                              <span className="text-[12px] font-bold text-success">{formatCurrency(item.fee)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="analysis-card">
                      <h3 className="text-[12px] font-bold uppercase text-secondary mb-4">Product Distribution</h3>
                      <div className="h-56 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={salesByType}
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={8}
                              dataKey="value"
                              stroke="none"
                            >
                              {salesByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                              formatter={(value: any) => formatCurrency(Number(value))}
                            />
                          </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[10px] uppercase font-bold text-secondary">Total</span>
                          <span className="text-[14px] font-bold text-primary">{formatCurrency(totalRevenue).split(',')[0]}</span>
                        </div>
                      </div>
                      <div className="flex justify-center gap-4 mt-2">
                        {salesByType.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-[10px] font-bold uppercase text-secondary">{entry.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="section-label">Recent Sales</span>
                      <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                        {filteredSales.length} Items
                      </div>
                    </div>

                    {/* Date Filter */}
                    <div className="bg-bg p-3 rounded-[16px] flex items-center gap-3 border border-border">
                      <Calendar size={16} className="text-secondary" />
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="flex-1 bg-transparent text-[13px] font-medium focus:outline-none"
                      />
                      {filterDate && (
                        <button
                          onClick={() => setFilterDate('')}
                          className="text-[10px] font-bold uppercase text-secondary hover:text-primary"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 mt-4">
                      {filteredSales.map((sale) => (
                        <div key={sale.id} className="bg-bg p-4 rounded-[16px] flex items-center justify-between group">
                          <div>
                            <p className="text-[14px] font-bold capitalize">{sale.type} {sale.weight}kg</p>
                            <p className="text-[11px] text-secondary">
                              {new Date(sale.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} • Qty: {sale.quantity}
                            </p>
                            <p className="text-[10px] text-success font-bold mt-1">Fee: {formatCurrency(sale.totalPrice - sale.totalCost)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-[14px] font-bold">{formatCurrency(sale.totalPrice)}</p>
                            <button
                              onClick={() => handleDeleteSale(sale.id)}
                              className="text-secondary hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {filteredSales.length === 0 && (
                        <div className="py-12 text-center">
                          <p className="text-secondary text-[13px] font-medium">Tidak ada data untuk tanggal ini</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-border/50 px-8 py-4 flex justify-between items-center z-50">
          <button
            onClick={() => setActiveTab('calculator')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === 'calculator' ? "text-primary" : "text-secondary"
            )}
          >
            <Calculator size={20} />
            <span className="text-[10px] font-bold uppercase">Calc</span>
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === 'analysis' ? "text-primary" : "text-secondary"
            )}
          >
            <BarChart3 size={20} />
            <span className="text-[10px] font-bold uppercase">Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === 'history' ? "text-primary" : "text-secondary"
            )}
          >
            <History size={20} />
            <span className="text-[10px] font-bold uppercase">Log</span>
          </button>
        </nav>

        {/* Floating Notification (Top-style) */}
        <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none z-[100]">
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 min-w-[280px] backdrop-blur-md border pointer-events-auto",
                  notification.type === 'success' 
                    ? "bg-success/90 border-white/20 text-white" 
                    : "bg-red-500/90 border-white/20 text-white"
                )}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {notification.type === 'success' ? <Package size={16} /> : <Trash2 size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">System Message</p>
                  <p className="text-[13px] font-bold leading-tight">{notification.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {confirmModal.isOpen && (
            <div className="absolute inset-0 z-[110] flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal({ isOpen: false, saleId: null })}
                className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-[260px] rounded-[24px] p-5 shadow-2xl relative z-10 text-center"
              >
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-[16px] font-black leading-tight mb-1">Hapus Data?</h3>
                <p className="text-[11px] text-secondary font-medium mb-6 leading-relaxed">
                  Data yang dihapus tidak dapat dikembalikan.
                </p>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={confirmDelete}
                    className="w-full py-3 bg-red-500 text-white rounded-[12px] text-[13px] font-bold hover:bg-red-600 transition-colors"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    onClick={() => setConfirmModal({ isOpen: false, saleId: null })}
                    className="w-full py-2 bg-transparent text-secondary text-[12px] font-bold hover:text-primary transition-colors"
                  >
                    Batal
                  </button>
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
            <div className="text-right">
              <p className="text-xs font-bold text-secondary uppercase">Report Generated</p>
              <p className="font-bold">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="p-6 bg-bg rounded-2xl border border-border">
              <p className="text-[10px] font-black uppercase text-secondary mb-1">Total Jual (Revenue)</p>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-6 bg-bg rounded-2xl border border-border">
              <p className="text-[10px] font-black uppercase text-secondary mb-1">Total Setor (Cost)</p>
              <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
            </div>
            <div className="p-6 bg-primary text-white rounded-2xl">
              <p className="text-[10px] font-black uppercase text-white/60 mb-1">Total Fee (Profit)</p>
              <p className="text-xl font-bold">{formatCurrency(totalProfit)}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="py-4 text-[10px] uppercase font-black text-secondary">Tanggal</th>
                <th className="py-4 text-[10px] uppercase font-black text-secondary">Produk</th>
                <th className="py-4 text-[10px] uppercase font-black text-secondary">Berat</th>
                <th className="py-4 text-[10px] uppercase font-black text-secondary">Qty</th>
                <th className="py-4 text-right text-[10px] uppercase font-black text-secondary">Penjualan</th>
                <th className="py-4 text-right text-[10px] uppercase font-black text-secondary">Fee</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-border/50">
                  <td className="py-4 text-sm font-medium">{sale.date}</td>
                  <td className="py-4 text-sm font-bold capitalize">{sale.type}</td>
                  <td className="py-4 text-sm">{sale.weight} kg</td>
                  <td className="py-4 text-sm font-bold">{sale.quantity}</td>
                  <td className="py-4 text-sm text-right font-medium">{formatCurrency(sale.totalPrice)}</td>
                  <td className="py-4 text-sm text-right font-bold text-primary">{formatCurrency(sale.totalPrice - sale.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-20 flex justify-between items-end border-t border-dashed border-border pt-10">
            <div>
              <p className="text-[10px] font-bold text-secondary uppercase mb-10">Hormat Kami,</p>
              <div className="w-40 h-px bg-primary" />
              <p className="text-sm font-bold mt-2">Admin</p>
            </div>
            <div className="text-[9px] text-secondary font-medium italic">
              * Laporan ini dihasilkan secara otomatis oleh sistem.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
