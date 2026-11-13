import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  Package, 
  ReceiptText, 
  Users, 
  Sparkles, 
  Plus, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/mockData';

export const AdminDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { orders, posShift, auditLogs, currentRole } = useAdmin();
  const { setViewMode } = useStore();
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('7');

  // Stats calculation
  const onlineOrders = orders.filter(o => o.channel === 'online');
  const posOrders = orders.filter(o => o.channel === 'POS');

  const onlineRevenue = onlineOrders.reduce((sum, o) => sum + o.total, 0);
  const posRevenue = posOrders.reduce((sum, o) => sum + o.total, 0);
  const totalRevenue = onlineRevenue + posRevenue;

  const lowStockCount = PRODUCTS.reduce((acc, p) => {
    const hasLow = p.variants.some(v => v.stockShop < 20 || v.stockWarehouse < 40);
    return hasLow ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#141d2c] via-[#101826] to-[#0c121d] border border-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-black text-white">Store Overview & Sales</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand/20 text-brand border border-brand/30">
              Role: {currentRole}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time unified sales from Online Storefront & Shop Counter POS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('pos')}
            className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2"
          >
            <ReceiptText className="w-4 h-4" />
            <span>Open POS Counter</span>
          </button>

          <button
            onClick={() => onNavigate('products')}
            className="px-4 py-2.5 bg-[#172233] hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-dark-border flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-brand" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="p-5 rounded-2xl bg-[#0f1725] border border-dark-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Today's Total Sales</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-dark-border/40">
            <span>Online: ₹{onlineRevenue.toLocaleString('en-IN')}</span>
            <span className="text-brand font-semibold">POS: ₹{posRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Orders Count */}
        <div className="p-5 rounded-2xl bg-[#0f1725] border border-dark-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Orders to Fulfil</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {orders.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-dark-border/40">
            <span>{onlineOrders.length} online</span>
            <span>{posOrders.length} counter</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-[#0f1725] border border-dark-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Low Stock Alerts</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {lowStockCount} items
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-dark-border/40">
            Below threshold (requires re-order)
          </div>
        </div>

        {/* Active POS Shift */}
        <div className="p-5 rounded-2xl bg-[#0f1725] border border-dark-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Active POS Shift</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-white truncate">
            {posShift.cashierName}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-dark-border/40">
            <span>Float: ₹{posShift.openingCash}</span>
            <span className="text-emerald-400 font-bold">Shift: ₹{posShift.totalSales}</span>
          </div>
        </div>

      </div>

      {/* Sales Chart Simulation & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Chart Bar Simulation */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0f1725] border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Revenue Performance</h3>
              <p className="text-xs text-slate-400">Comparing online vs walk-in POS billing</p>
            </div>
            <div className="flex items-center gap-1 bg-dark-surface p-1 rounded-lg border border-dark-border text-xs">
              <button
                onClick={() => setChartPeriod('7')}
                className={`px-2.5 py-1 rounded font-semibold ${chartPeriod === '7' ? 'bg-brand text-white' : 'text-slate-400'}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartPeriod('30')}
                className={`px-2.5 py-1 rounded font-semibold ${chartPeriod === '30' ? 'bg-brand text-white' : 'text-slate-400'}`}
              >
                30 Days
              </button>
              <button
                onClick={() => setChartPeriod('90')}
                className={`px-2.5 py-1 rounded font-semibold ${chartPeriod === '90' ? 'bg-brand text-white' : 'text-slate-400'}`}
              >
                90 Days
              </button>
            </div>
          </div>

          {/* Simulated Histogram Chart */}
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end gap-3 sm:gap-6 justify-between px-2">
              {[
                { day: 'Mon', online: 45, pos: 30, val: '₹14,200' },
                { day: 'Tue', online: 55, pos: 40, val: '₹18,900' },
                { day: 'Wed', online: 70, pos: 50, val: '₹22,400' },
                { day: 'Thu', online: 60, pos: 65, val: '₹25,100' },
                { day: 'Fri', online: 85, pos: 75, val: '₹34,800' },
                { day: 'Sat', online: 95, pos: 90, val: '₹42,500' },
                { day: 'Sun', online: 90, pos: 85, val: '₹38,200' },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition font-mono">
                    {bar.val}
                  </span>
                  <div className="w-full flex items-end justify-center gap-1">
                    <div 
                      className="w-full max-w-[14px] bg-slate-600 group-hover:bg-slate-400 rounded-t transition-all"
                      style={{ height: `${bar.online}%` }}
                      title={`Online: ${bar.online}%`}
                    ></div>
                    <div 
                      className="w-full max-w-[14px] bg-brand group-hover:bg-brand-hover rounded-t transition-all"
                      style={{ height: `${bar.pos}%` }}
                      title={`POS: ${bar.pos}%`}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{bar.day}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-dark-border/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-600"></span>
                <span className="text-slate-300">Online Store</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-brand"></span>
                <span className="text-slate-300">Shop Counter POS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Audit Log / Recent Action Feed */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0f1725] border border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Live Audit Log</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">PRD 6.1 Sec</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-2.5 rounded-xl bg-[#0b1019] border border-dark-border/60">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-white">{log.action}</span>
                  <span className="text-slate-500 font-mono text-[10px]">{log.timestamp.split(' ')[1]}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-tight mb-1">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{log.userName}</span>
                  <span className="bg-brand/10 text-brand px-1.5 py-0.2 rounded font-semibold">{log.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

