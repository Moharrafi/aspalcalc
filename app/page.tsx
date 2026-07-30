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
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart2
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
import { PrintReportModern } from '@/components/PrintReportModern';
import { PrintReportV1Backup } from '@/components/PrintReportV1Backup';

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

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  note?: string | null;
}

// --- Helper Functions ---

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const normalizeNumberInput = (value: string) => {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
};

const formatNumberInput = (value: string) => {
  const digits = normalizeNumberInput(value);
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch from DB
  useEffect(() => {
    setIsMounted(true);
    const today = new Date().toISOString().split('T')[0];
    setSaleDate(today);
    setPaymentDate(today);
    const fetchSales = async () => {
      try {
        const response = await fetch('/api/sales');
        if (response.ok) {
          const data = await response.json();
          setSales(data);
        }
      } catch (error) {
        console.error('Failed to fetch sales');
      }
    };
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments');
        if (response.ok) {
          const data = await response.json();
          setPayments(data);
        }
      } catch (error) {
        console.error('Failed to fetch payments');
      }
    };
    fetchSales();
    fetchPayments();
  }, []);

  const [activeTab, setActiveTab] = useState<'calculator' | 'analysis' | 'payment' | 'history'>('calculator');
  const [filterDate, setFilterDate] = useState<string>('');

  // Form State
  const [selectedType, setSelectedType] = useState<ProductType>('hitam');
  const [weight, setWeight] = useState<number>(1);
  const [customWeight, setCustomWeight] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [saleDate, setSaleDate] = useState<string>('');

  // Payment State
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');

  // Analysis State
  const [statPeriod, setStatPeriod] = useState<'daily' | 'monthly'>('daily');
  const [printingMonth, setPrintingMonth] = useState<string | null>(null);
  const [analysisMonth, setAnalysisMonth] = useState<string>('');

  // Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletePaymentConfirmId, setDeletePaymentConfirmId] = useState<string | null>(null);

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

  const handleAddSale = async () => {
    if (effectiveWeight <= 0) {
      setNotification({ message: 'Berat harus lebih dari 0!', type: 'error' });
      return;
    }

    const pricing = calculatePricing(selectedType, effectiveWeight);
    const newSale: Sale = {
      id: Math.random().toString(36).substring(7),
      date: saleDate || new Date().toISOString().split('T')[0],
      type: selectedType,
      weight: effectiveWeight,
      quantity,
      totalPrice: pricing.price * quantity,
      totalCost: pricing.cost * quantity,
    };

    const prevSales = [...sales];
    setSales([newSale, ...sales]);
    setNotification({ message: 'Transaksi berhasil disimpan', type: 'success' });
    setQuantity(1);
    if (weight === 0) setCustomWeight('');

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSale)
      });
      if (!response.ok) throw new Error();
    } catch (error) {
      setSales(prevSales);
      setNotification({ message: 'Gagal sinkron ke database!', type: 'error' });
    }
  };

  const handleDeleteSale = async (id: string) => {
    const prevSales = [...sales];
    setSales(sales.filter(s => s.id !== id));
    setNotification({ message: 'Data penjualan dihapus', type: 'success' });
    setDeleteConfirmId(null);

    try {
      const response = await fetch(`/api/sales?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error();
    } catch (error) {
      setSales(prevSales);
      setNotification({ message: 'Gagal menghapus data di database!', type: 'error' });
    }
  };

  const handleAddPayment = async () => {
    const amount = Number(paymentAmount);

    if (!paymentDate) {
      setNotification({ message: 'Tanggal setoran harus diisi!', type: 'error' });
      return;
    }

    if (!amount || amount <= 0) {
      setNotification({ message: 'Jumlah setoran harus lebih dari 0!', type: 'error' });
      return;
    }

    const newPayment: PaymentRecord = {
      id: Math.random().toString(36).substring(7),
      date: paymentDate,
      amount,
      note: paymentNote.trim() || null,
    };

    const prevPayments = [...payments];
    setPayments([newPayment, ...payments]);
    setNotification({ message: 'Setoran berhasil dicatat', type: 'success' });
    setPaymentAmount('');
    setPaymentNote('');

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayment)
      });
      if (!response.ok) throw new Error();
    } catch (error) {
      setPayments(prevPayments);
      setNotification({ message: 'Gagal menyimpan setoran ke database!', type: 'error' });
    }
  };

  const handleDeletePayment = async (id: string) => {
    const prevPayments = [...payments];
    setPayments(payments.filter(p => p.id !== id));
    setNotification({ message: 'Data setoran dihapus', type: 'success' });
    setDeletePaymentConfirmId(null);

    try {
      const response = await fetch(`/api/payments?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error();
    } catch (error) {
      setPayments(prevPayments);
      setNotification({ message: 'Gagal menghapus setoran di database!', type: 'error' });
    }
  };

  const handlePrint = (month?: string) => {
    const reportMonth = month !== undefined ? month : (analysisMonth || null);

    flushSync(() => {
      setPrintingMonth(reportMonth);
    });

    window.print();
  };

  const salesToPrint = useMemo(() => {
    if (!printingMonth) return sales;
    return sales.filter(s => s.date.startsWith(printingMonth));
  }, [sales, printingMonth]);

  const paymentsToPrint = useMemo(() => {
    if (!printingMonth) return payments;
    return payments.filter(p => p.date.startsWith(printingMonth));
  }, [payments, printingMonth]);

  const printSummary = useMemo(() => {
    const revenue = salesToPrint.reduce((acc, s) => acc + (Number(s.totalPrice) || 0), 0);
    const cost = salesToPrint.reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0);
    const paid = paymentsToPrint.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    return {
      revenue,
      cost,
      paid,
      remaining: Math.max(cost - paid, 0),
      overpaid: Math.max(paid - cost, 0),
      profit: revenue - cost
    };
  }, [salesToPrint, paymentsToPrint]);

  // --- Analysis Computations ---

  const analysisSales = useMemo(() => {
    if (!analysisMonth) return sales;
    return sales.filter(s => s.date.startsWith(analysisMonth));
  }, [sales, analysisMonth]);

  const totalRevenue = useMemo(() => sales.reduce((acc, s) => acc + (Number(s.totalPrice) || 0), 0), [sales]);
  const totalCost = useMemo(() => sales.reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0), [sales]);
  const totalProfit = useMemo(() => totalRevenue - totalCost, [totalRevenue, totalCost]);
  const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0), [payments]);
  const remainingPayment = useMemo(() => Math.max(totalCost - totalPaid, 0), [totalCost, totalPaid]);
  const overpaidPayment = useMemo(() => Math.max(totalPaid - totalCost, 0), [totalCost, totalPaid]);
  const paymentProgress = useMemo(() => {
    if (totalCost <= 0) return 0;
    return Math.min(100, (totalPaid / totalCost) * 100);
  }, [totalCost, totalPaid]);

  const analysisStats = useMemo(() => {
    const rev = analysisSales.reduce((acc, s) => acc + (Number(s.totalPrice) || 0), 0);
    const cost = analysisSales.reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0);
    const qty = analysisSales.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0);
    return { revenue: rev, cost, qty, profit: rev - cost };
  }, [analysisSales]);

  // Product & Size Variant Breakdown (Ranking)
  const variantBreakdown = useMemo(() => {
    const map: Record<string, { type: ProductType; weight: number; quantity: number; revenue: number; cost: number }> = {};
    analysisSales.forEach((sale) => {
      const key = `${sale.type}_${sale.weight}`;
      if (!map[key]) {
        map[key] = {
          type: sale.type,
          weight: sale.weight,
          quantity: 0,
          revenue: 0,
          cost: 0,
        };
      }
      map[key].quantity += Number(sale.quantity) || 0;
      map[key].revenue += Number(sale.totalPrice) || 0;
      map[key].cost += Number(sale.totalCost) || 0;
    });

    const list = Object.values(map);
    const totalQty = list.reduce((sum, item) => sum + item.quantity, 0);

    return list
      .map((item) => ({
        ...item,
        percentage: totalQty > 0 ? Math.round((item.quantity / totalQty) * 100) : 0,
      }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [analysisSales]);

  const salesByType = useMemo(() => {
    const data: Record<string, number> = { bitumax: 0, hijau: 0, hitam: 0 };
    analysisSales.forEach(s => {
      if (data.hasOwnProperty(s.type)) {
        data[s.type] += (Number(s.totalPrice) || 0);
      }
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [analysisSales]);

  const salesByPeriod = useMemo(() => {
    const data: Record<string, { revenue: number; cost: number; fee: number; weight: number; count: number }> = {};

    [...analysisSales].reverse().forEach(s => {
      const dateOnly = s.date.split('T')[0];
      const key = statPeriod === 'daily'
        ? dateOnly
        : dateOnly.substring(0, 7);

      if (!data[key]) {
        data[key] = { revenue: 0, cost: 0, fee: 0, weight: 0, count: 0 };
      }

      data[key].revenue += (Number(s.totalPrice) || 0);
      data[key].cost += (Number(s.totalCost) || 0);
      data[key].fee += (Number(s.totalPrice || 0) - Number(s.totalCost || 0));
      data[key].weight += ((Number(s.weight) || 0) * (Number(s.quantity) || 0));
      data[key].count += 1;
    });

    return Object.entries(data).map(([period, stats]) => ({
      period: statPeriod === 'daily'
        ? period.split('-').slice(1).reverse().join('/')
        : new Date(period + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      fullPeriod: period,
      ...stats
    })).sort((a, b) => a.fullPeriod.localeCompare(b.fullPeriod));
  }, [analysisSales, statPeriod]);

  const COLORS = ['#F59E0B', '#10B981', '#475569'];

  return (
    <>
      {/* --- Modern Reseller Print Report --- */}
      <PrintReportModern
        isMounted={isMounted}
        printingMonth={printingMonth}
        printSummary={printSummary}
        salesToPrint={salesToPrint}
        formatCurrency={formatCurrency}
      />

      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 no-print pb-28">
        {/* Main Application Container */}
        <div className="w-full max-w-xl mx-auto min-h-screen flex flex-col relative px-4 pt-4">
          
          {/* Notification Toast */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -80, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[100] no-print"
              >
                <div className={cn(
                  "flex items-center gap-3 p-4 rounded-xl shadow-xl border bg-white",
                  notification.type === 'success'
                    ? "text-emerald-800 border-emerald-300 shadow-emerald-900/5"
                    : "text-rose-800 border-rose-300 shadow-rose-900/5"
                )}>
                  {notification.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-rose-600" />}
                  <span className="text-xs font-bold">{notification.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Brand Header */}
          <header className="py-3 px-1 no-print flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Sales Calc</h1>
              <p className="text-[12px] font-medium text-slate-500">Aspal Sales & Distribution</p>
            </div>

            <button
              onClick={() => handlePrint()}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              title="Cetak Laporan"
            >
              <Printer size={15} className="text-slate-600" />
              <span>Cetak Laporan</span>
            </button>
          </header>

          {/* Content Views */}
          <div className="flex-1 mt-3">
            <AnimatePresence mode="wait">
              {activeTab === 'calculator' && (
                <motion.div
                  key="calc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {/* Summary Banner Card */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        Total Penjualan (Omset)
                      </span>
                      <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-md">
                        {sales.length} Transaksi
                      </span>
                    </div>
                    
                    <h2 className="text-2xl font-bold tracking-tight">
                      {formatCurrency(totalRevenue)}
                    </h2>

                    <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Wajib Setor Modal</span>
                        <span className="font-bold text-amber-400">{formatCurrency(totalCost)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Sudah Ditransfer</span>
                        <span className="font-bold text-sky-400">{formatCurrency(totalPaid)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Type Selection */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
                    <span className="text-xs uppercase font-bold text-slate-500 block">Pilih Produk</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['hitam', 'hijau', 'bitumax'] as ProductType[]).map((type) => {
                        const isSelected = selectedType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setSelectedType(type)}
                            className={cn(
                              "py-2.5 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1",
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 font-bold shadow-sm"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            )}
                          >
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              type === 'hijau' ? "bg-emerald-500" :
                              type === 'bitumax' ? "bg-amber-500" :
                              "bg-slate-900"
                            )} />
                            <span className="text-xs font-bold uppercase">{type}</span>
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-xs uppercase font-bold text-slate-500 block pt-1">Ukuran Kemasan</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRICES[selectedType].map((p) => {
                        const isSelected = weight === p.weight;
                        return (
                          <button
                            key={p.weight}
                            type="button"
                            onClick={() => setWeight(p.weight)}
                            className={cn(
                              "py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1",
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            )}
                          >
                            <span>{p.weight} kg</span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setWeight(0)}
                        className={cn(
                          "py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center",
                          weight === 0
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        )}
                      >
                        Custom kg
                      </button>
                    </div>

                    {weight === 0 && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Input Berat (kg)</span>
                        <input
                          type="number"
                          value={customWeight}
                          onChange={(e) => setCustomWeight(e.target.value)}
                          placeholder="Contoh: 12"
                          className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Quantity & Date Form */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs uppercase font-bold text-slate-500 block mb-1.5">Tanggal</span>
                      <div className="bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-xl flex items-center gap-1.5 h-10">
                        <Calendar size={14} className="text-slate-400 shrink-0" />
                        <input
                          type="date"
                          value={saleDate}
                          onChange={(e) => setSaleDate(e.target.value)}
                          className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs uppercase font-bold text-slate-500 block mb-1.5">Jumlah (Qty Pcs)</span>
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl h-10">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          −
                        </button>
                        <span className="font-bold text-xs text-slate-900">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Summary Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Nominal</span>
                        <span className="text-xl font-black text-slate-900">{formatCurrency(currentPrice)}</span>
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        <span className="block font-semibold">@ {formatCurrency(calculatePricing(selectedType, effectiveWeight).price)}</span>
                        <span className="font-bold text-slate-900">{quantity} Pcs</span>
                      </div>
                    </div>

                    <button
                      onClick={handleAddSale}
                      className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus size={16} />
                      Simpan Transaksi
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'analysis' && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {/* Period Filter */}
                  <div className="flex gap-2">
                    <div className="flex-1 flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                      <button
                        onClick={() => setStatPeriod('daily')}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
                          statPeriod === 'daily' ? "bg-slate-900 text-white" : "text-slate-500"
                        )}
                      >
                        Harian
                      </button>
                      <button
                        onClick={() => setStatPeriod('monthly')}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
                          statPeriod === 'monthly' ? "bg-slate-900 text-white" : "text-slate-500"
                        )}
                      >
                        Bulanan
                      </button>
                    </div>

                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      <input
                        type="month"
                        value={analysisMonth}
                        onChange={(e) => setAnalysisMonth(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none w-24"
                      />
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Total Penjualan {analysisMonth ? `(${new Date(analysisMonth + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })})` : ''}
                    </p>
                    <h2 className="text-2xl font-bold mt-0.5">{formatCurrency(analysisStats.revenue)}</h2>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs pt-3 border-t border-slate-800">
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[9px] block mb-0.5">Barang Terjual</span>
                        <span className="font-bold text-white text-sm">{analysisStats.qty} Pcs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[9px] block mb-0.5">Wajib Setor</span>
                        <span className="font-bold text-amber-400 text-sm">{formatCurrency(analysisStats.cost)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[9px] block mb-0.5">Transaksi</span>
                        <span className="font-bold text-slate-200 text-sm">{analysisSales.length} Trans</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="analysis-card">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                      Grafik Penjualan ({statPeriod})
                    </h3>
                    <div className="h-48 w-full">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={salesByPeriod} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                              dataKey="period"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 9, fill: '#64748B', fontWeight: 600 }}
                              dy={5}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 9, fill: '#64748B' }}
                              tickFormatter={(value) => `Rp${value / 1000}k`}
                            />
                            <Tooltip
                              cursor={{ fill: '#F8FAFC' }}
                              contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#0F172A' }}
                              formatter={(value: any) => [formatCurrency(Number(value)), 'Total']}
                            />
                            <Bar dataKey="revenue" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={statPeriod === 'daily' ? 12 : 24} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* NEW FEATURE: Rekap Penjualan Per Produk & Ukuran (Replaces Riwayat Periode) */}
                  <div className="analysis-card space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award size={16} className="text-slate-800" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Rekap Penjualan Per Produk & Ukuran
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {variantBreakdown.length} Varian
                      </span>
                    </div>

                    <div className="space-y-3">
                      {variantBreakdown.map((item, index) => (
                        <div key={`${item.type}_${item.weight}`} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                                #{index + 1}
                              </span>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-extrabold uppercase",
                                item.type === 'hijau' ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                                item.type === 'bitumax' ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                "bg-slate-200 text-slate-900 border border-slate-300"
                              )}>
                                {item.type}
                              </span>
                              <span className="font-bold text-xs text-slate-900">{item.weight} kg</span>
                            </div>

                            <div className="text-right">
                              <span className="font-extrabold text-xs text-slate-900 block">{formatCurrency(item.revenue)}</span>
                              <span className="text-[10px] text-slate-500 font-semibold">{item.quantity} Pcs</span>
                            </div>
                          </div>

                          {/* Progress bar percentage */}
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                item.type === 'hijau' ? "bg-emerald-500" :
                                item.type === 'bitumax' ? "bg-amber-500" :
                                "bg-slate-800"
                              )}
                              style={{ width: `${Math.max(5, item.percentage)}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                            <span>Wajib Setor: <strong>{formatCurrency(item.cost)}</strong></span>
                            <span>Kontribusi: <strong>{item.percentage}%</strong></span>
                          </div>
                        </div>
                      ))}

                      {variantBreakdown.length === 0 && (
                        <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-slate-500 text-xs font-medium">Belum ada data penjualan pada periode ini</p>
                        </div>
                      )}
                    </div>

                    {/* Quick Print Card */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xs font-bold">Cetak Laporan Reseller</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {analysisMonth ? `Periode ${analysisMonth}` : 'Semua Penjualan Terdaftar'}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePrint(analysisMonth || undefined)}
                        className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                      >
                        <Printer size={14} />
                        <span>Cetak Laporan</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Sisa Setoran Modal</p>
                        <h2 className="text-2xl font-bold text-amber-400 mt-0.5">{formatCurrency(remainingPayment)}</h2>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                        <CreditCard size={18} className="text-slate-200" />
                      </div>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${paymentProgress}%` }}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-800">
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[10px] block mb-0.5">Wajib Setor</span>
                        <span className="font-bold text-white">{formatCurrency(totalCost)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[10px] block mb-0.5">Sudah Ditransfer</span>
                        <span className="font-bold text-emerald-400">{formatCurrency(totalPaid)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form Record Payment */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-slate-500">Catat Transfer Setoran</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {Math.round(paymentProgress)}% Terbayar
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Tanggal</span>
                        <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 h-9">
                          <Calendar size={14} className="text-slate-400 shrink-0" />
                          <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Jumlah Transfer</span>
                        <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl h-9 flex items-center">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatNumberInput(paymentAmount)}
                            onChange={(e) => setPaymentAmount(normalizeNumberInput(e.target.value))}
                            placeholder="Rp"
                            className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Catatan / Bukti</span>
                      <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl h-9 flex items-center">
                        <input
                          type="text"
                          value={paymentNote}
                          onChange={(e) => setPaymentNote(e.target.value)}
                          placeholder="Catatan transfer..."
                          className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-[auto_1fr] gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPaymentAmount(String(Math.round(remainingPayment)))}
                        disabled={remainingPayment <= 0}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100"
                      >
                        Isi Sisa
                      </button>
                      <button
                        type="button"
                        onClick={handleAddPayment}
                        className="bg-slate-900 text-white py-2 rounded-xl font-bold hover:bg-slate-800 transition-all text-xs shadow-sm"
                      >
                        Simpan Setoran
                      </button>
                    </div>
                  </div>

                  {/* Payment List */}
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-500 block mb-2">Riwayat Transfer</span>
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div key={payment.id} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900">{payment.note || 'Transfer Setoran'}</p>
                            <p className="text-[11px] text-slate-500">
                              {new Date(payment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-600">{formatCurrency(Number(payment.amount) || 0)}</span>
                            <button
                              onClick={() => setDeletePaymentConfirmId(payment.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors"
                              title="Hapus setoran"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {payments.length === 0 && (
                        <div className="py-10 text-center bg-white rounded-xl border border-slate-200">
                          <p className="text-slate-500 text-xs">Belum ada riwayat setoran</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-slate-500">Daftar Transaksi</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {filteredSales.length} Transaksi
                    </span>
                  </div>

                  {/* Filter Date */}
                  <div className="bg-white p-2.5 rounded-xl flex items-center gap-2 border border-slate-200 shadow-sm">
                    <Calendar size={15} className="text-slate-400" />
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="flex-1 bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                    />
                    {filterDate && (
                      <button
                        onClick={() => setFilterDate('')}
                        className="text-[10px] font-bold uppercase text-slate-500 hover:text-slate-900"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {filteredSales.map((sale) => (
                      <div key={sale.id} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                              sale.type === 'hijau' ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                              sale.type === 'bitumax' ? "bg-amber-50 text-amber-800 border border-amber-200" :
                              "bg-slate-100 text-slate-800 border border-slate-200"
                            )}>
                              {sale.type}
                            </span>
                            <span className="font-bold text-slate-900">{sale.weight} kg</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • Qty: {sale.quantity} Pcs
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900">{formatCurrency(sale.totalPrice)}</span>
                          <button
                            onClick={() => setDeleteConfirmId(sale.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredSales.length === 0 && (
                      <div className="py-10 text-center bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500 text-xs">Tidak ada transaksi ditemukan</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Bottom Navigation Bar */}
          <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1 flex items-center justify-around z-50 no-print shadow-lg">
            <button
              onClick={() => setActiveTab('calculator')}
              className={cn(
                "flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all relative",
                activeTab === 'calculator' ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700"
              )}
            >
              {activeTab === 'calculator' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-slate-100 rounded-xl" />
              )}
              <span className="relative z-10 flex flex-col items-center gap-0.5">
                <Calculator size={17} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Input</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={cn(
                "flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all relative",
                activeTab === 'analysis' ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700"
              )}
            >
              {activeTab === 'analysis' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-slate-100 rounded-xl" />
              )}
              <span className="relative z-10 flex flex-col items-center gap-0.5">
                <BarChart3 size={17} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Stats</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payment')}
              className={cn(
                "flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all relative",
                activeTab === 'payment' ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700"
              )}
            >
              {activeTab === 'payment' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-slate-100 rounded-xl" />
              )}
              <span className="relative z-10 flex flex-col items-center gap-0.5">
                <CreditCard size={17} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Setoran</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all relative",
                activeTab === 'history' ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700"
              )}
            >
              {activeTab === 'history' && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-slate-100 rounded-xl" />
              )}
              <span className="relative z-10 flex flex-col items-center gap-0.5">
                <History size={17} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Riwayat</span>
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Delete Sale Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white border border-slate-200 w-full max-w-xs rounded-2xl p-5 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center mb-3">
                  <AlertTriangle className="text-rose-500" size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Hapus Data Penjualan?</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-5">
                  Data ini akan dihapus dari riwayat penjualan.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDeleteSale(deleteConfirmId)}
                    className="py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-sm text-xs"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Payment Confirmation Modal */}
      <AnimatePresence>
        {deletePaymentConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletePaymentConfirmId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white border border-slate-200 w-full max-w-xs rounded-2xl p-5 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center mb-3">
                  <AlertTriangle className="text-rose-500" size={20} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Hapus Data Setoran?</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-5">
                  Data transfer ini akan dihapus dari riwayat pembayaran.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    onClick={() => setDeletePaymentConfirmId(null)}
                    className="py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDeletePayment(deletePaymentConfirmId)}
                    className="py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors shadow-sm text-xs"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
