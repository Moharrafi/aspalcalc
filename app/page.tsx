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
  Printer,
  Download,
  CheckCircle2,
  AlertCircle
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
  const [sales, setSales] = useState<Sale[]>([
    { id: '1', date: '2026-03-26', type: 'bitumax', weight: 20, quantity: 1, totalPrice: 720000, totalCost: 606000 },
    { id: '2', date: '2026-03-30', type: 'bitumax', weight: 1, quantity: 1, totalPrice: 50000, totalCost: 40000 },
    { id: '3', date: '2026-04-01', type: 'bitumax', weight: 5, quantity: 1, totalPrice: 190000, totalCost: 152000 },
    { id: '4', date: '2026-04-08', type: 'bitumax', weight: 2, quantity: 1, totalPrice: 100000, totalCost: 80000 },
    { id: '5', date: '2026-04-10', type: 'bitumax', weight: 1, quantity: 1, totalPrice: 50000, totalCost: 40000 },
    { id: '6', date: '2026-04-10', type: 'hijau', weight: 2, quantity: 1, totalPrice: 66000, totalCost: 52800 },
    { id: '7', date: '2026-04-12', type: 'bitumax', weight: 10, quantity: 1, totalPrice: 380000, totalCost: 304000 },
  ]);
  const [activeTab, setActiveTab] = useState<'calculator' | 'analysis' | 'history'>('calculator');
  const [filterDate, setFilterDate] = useState<string>('');
  
  // Form State
  const [selectedType, setSelectedType] = useState<ProductType>('bitumax');
  const [weight, setWeight] = useState<number>(1);
  const [customWeight, setCustomWeight] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Analysis State
  const [statPeriod, setStatPeriod] = useState<'daily' | 'monthly'>('daily');

  // Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredSales = useMemo(() => {
    if (!filterDate) return sales;
    return sales.filter(s => s.date === filterDate);
  }, [sales, filterDate]);

  const effectiveWeight = useMemo(() => {
    return weight === 0 ? (parseFloat(customWeight) || 0) : weight;
  }, [weight, customWeight]);

  const currentPrice = useMemo(() => {
    return calculatePricing(selectedType, effectiveWeight).price * quantity;
  }, [selectedType, effectiveWeight, quantity]);

  const handleAddSale = () => {
    if (effectiveWeight <= 0) {
      setNotification({ message: 'Berat harus lebih dari 0!', type: 'error' });
      return;
    }

    try {
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
      setSales([newSale, ...sales]);
      setQuantity(1);
      if (weight === 0) setCustomWeight('');
      setNotification({ message: 'Penjualan berhasil dicatat!', type: 'success' });
    } catch (error) {
      setNotification({ message: 'Gagal mencatat penjualan.', type: 'error' });
    }
  };

  const handleDeleteSale = (id: string) => {
    setSales(sales.filter(s => s.id !== id));
  };

  const handlePrint = () => {
    window.print();
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

  const COLORS = ['#111827', '#10B981', '#6B7280'];

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-0 md:p-8">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[375px] h-full md:h-[812px] bg-card md:rounded-[48px] shadow-2xl md:border-[8px] border-primary flex flex-col relative overflow-hidden">
        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 20, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-0 left-4 right-4 z-[100] no-print"
            >
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-[20px] shadow-lg border",
                notification.type === 'success' 
                  ? "bg-white border-success text-success" 
                  : "bg-white border-red-500 text-red-500"
              )}>
                {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span className="text-[13px] font-bold">{notification.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notch for desktop view */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[24px] bg-primary rounded-b-[16px] z-50 no-print" />

        {/* Header */}
        <header className="px-6 pt-10 pb-4 no-print">
          <h1 className="text-[24px] font-[800] tracking-[-0.5px] text-primary">Sales Calc</h1>
          <p className="text-[14px] text-secondary mt-1">Bitumax Distribution App</p>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24">
          <AnimatePresence mode="wait">
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
                  {(['bitumax', 'hijau', 'hitam'] as ProductType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        "chip capitalize",
                        selectedType === type ? "chip-active" : "bg-transparent"
                      )}
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
                className="space-y-6 printable-area"
              >
                {/* Print-only Header */}
                <div className="hidden print:block mb-8 border-b-2 border-primary pb-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h1 className="text-3xl font-black tracking-tighter">BITUCALC REPORT</h1>
                      <p className="text-sm text-secondary font-medium">Bitumax Distribution Analysis</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-secondary">Report Date</p>
                      <p className="text-sm font-bold">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    </div>
                  </div>
                </div>

                {/* Print-only Summary Grid */}
                <div className="hidden print:grid print-summary-grid">
                  <div className="print-summary-item">
                    <p className="print-summary-label">Total Revenue</p>
                    <p className="print-summary-value">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <div className="print-summary-item">
                    <p className="print-summary-label">Total Deposit</p>
                    <p className="print-summary-value">{formatCurrency(totalCost)}</p>
                  </div>
                  <div className="print-summary-item">
                    <p className="print-summary-label text-success">Total Fee (Profit)</p>
                    <p className="print-summary-value text-success">{formatCurrency(totalProfit)}</p>
                  </div>
                </div>

                {/* Period Selector & Print Button */}
                <div className="flex gap-2 no-print">
                  <div className="flex-1 flex bg-bg p-1 rounded-[16px] border border-border">
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
                  <button 
                    onClick={handlePrint}
                    className="bg-primary text-white p-3 rounded-[16px] hover:opacity-90 transition-opacity flex items-center justify-center"
                    title="Print Report"
                  >
                    <Printer size={20} />
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
                            <stop offset="0%" stopColor="#111827" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#111827" stopOpacity={0.7}/>
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
                          tickFormatter={(value) => `Rp${value/1000}k`}
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
                  
                  {/* Print-only Table */}
                  <table className="hidden print:table print-table">
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Transactions</th>
                        <th>Revenue</th>
                        <th>Deposit</th>
                        <th>Fee (Profit)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...salesByPeriod].reverse().map((item) => (
                        <tr key={item.fullPeriod}>
                          <td>{item.period}</td>
                          <td>{item.count}</td>
                          <td>{formatCurrency(item.revenue)}</td>
                          <td>{formatCurrency(item.cost)}</td>
                          <td className="text-success font-bold">{formatCurrency(item.fee)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Screen-only Timeline Cards */}
                  <div className="print:hidden space-y-4">
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
                        <p className="text-[11px] text-secondary">{sale.date} • Qty: {sale.quantity}</p>
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
          </AnimatePresence>
        </div>

        {/* Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border px-8 py-4 flex items-center justify-around z-50 no-print">
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

        {/* --- Premium Print Report (Hidden natively via globals.css) --- */}
        <div className="hidden print:block printable-area bg-white text-slate-900 p-8 pt-4 font-sans leading-relaxed">
          
          {/* Header Section */}
          <div className="border-b-[3px] border-slate-900 pb-5 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-[34px] font-[1000] uppercase tracking-tighter text-slate-900 leading-none">
                Sales Report
              </h1>
              <p className="text-[12px] font-[800] uppercase tracking-[0.2em] text-slate-500 mt-2">
                ASPAL Distribution System
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-[800] uppercase tracking-widest text-slate-400 mb-0.5">
                Report Generated
              </p>
              <p className="text-[13px] font-[700] text-slate-800">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Key Metrics / KPI Grid */}
          <div className="flex justify-between gap-6 mb-8 mt-2">
            <div className="flex-1 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <p className="text-[9px] font-[800] uppercase tracking-widest text-slate-500 mb-1.5">Total Revenue (Jual)</p>
              <p className="text-[22px] font-[900] tracking-tight text-slate-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="flex-1 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <p className="text-[9px] font-[800] uppercase tracking-widest text-slate-500 mb-1.5">Total Cost (Setor)</p>
              <p className="text-[22px] font-[900] tracking-tight text-slate-900">{formatCurrency(totalCost)}</p>
            </div>
            <div className="flex-1 bg-emerald-50 p-5 rounded-2xl border border-emerald-200/60 !print:bg-emerald-50">
              <p className="text-[9px] font-[800] uppercase tracking-widest text-emerald-700 mb-1.5">Net Profit (Fee)</p>
              <p className="text-[22px] font-[900] tracking-tight text-emerald-800">{formatCurrency(totalProfit)}</p>
            </div>
          </div>

          {/* Detailed Ledger Table */}
          <table className="w-full text-left border-collapse mt-6">
            <thead>
              <tr className="border-b-[2px] border-slate-400 bg-slate-50">
                <th className="py-3 px-3 text-[10px] font-[900] uppercase tracking-wider text-slate-600">Tanggal</th>
                <th className="py-3 px-3 text-[10px] font-[900] uppercase tracking-wider text-slate-600">Produk</th>
                <th className="py-3 px-3 text-[10px] font-[900] uppercase tracking-wider text-slate-600 text-center border-l border-slate-200">Qty</th>
                <th className="py-3 px-3 text-[10px] font-[900] uppercase tracking-wider text-slate-600 text-right border-l border-slate-200">Penjualan</th>
                <th className="py-3 px-3 text-[10px] font-[900] uppercase tracking-wider text-emerald-700 text-right bg-emerald-50/50">Fee Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-b-[2px] border-slate-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-3 text-[11px] font-medium text-slate-600 tabular-nums">{sale.date}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-[12px] font-[800] text-slate-900 capitalize">{sale.type}</span>
                    <span className="text-[11px] text-slate-500 font-medium ml-1 bg-slate-100 px-1.5 py-0.5 rounded-md">{sale.weight}kg</span>
                  </td>
                  <td className="py-3.5 px-3 text-[12px] text-center font-[700] text-slate-700 border-l border-slate-50/50">{sale.quantity}</td>
                  <td className="py-3.5 px-3 text-[12px] text-right font-[800] text-slate-900 tabular-nums border-l border-slate-50/50">
                    {formatCurrency(sale.totalPrice)}
                  </td>
                  <td className="py-3.5 px-3 text-[12px] text-right font-[800] text-emerald-700 tabular-nums bg-emerald-50/20">
                    {formatCurrency(sale.totalPrice - sale.totalCost)}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-medium italic">
                    Belum ada data penjualan tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Signatures & Footer info */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end">
            <div className="text-[9px] text-slate-400 font-medium leading-relaxed max-w-[250px]">
              <p className="mb-0.5 text-slate-500 font-bold uppercase tracking-widest">Confidential Report</p>
              <p>Laporan ini dihasilkan secara otomatis oleh sistem Bitucalc Analytics. Data bersifat sah berdasarkan rekaman database sistem.</p>
              <p className="mt-2 text-[8px] font-mono opacity-60">ID: {Math.random().toString(36).substring(2, 10).toUpperCase()} / v1.2</p>
            </div>
            
            <div className="text-center w-48 mr-8">
              <p className="text-[11px] font-bold text-slate-600 mb-20 uppercase tracking-widest">Disetujui Oleh,</p>
              <div className="border-b-[1.5px] border-slate-400 w-full mb-1 border-dashed"></div>
              <p className="text-[12px] font-[900] text-slate-900 uppercase">Administrator</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
