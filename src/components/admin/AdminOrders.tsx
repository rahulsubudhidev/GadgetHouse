import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Search, Filter, Printer, ExternalLink } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';
import { OrderStatus } from '../../types';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useAdmin();
  const { formatPrice } = useStore();
  const [channelFilter, setChannelFilter] = useState<'all' | 'online' | 'POS'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter(o => {
    if (channelFilter !== 'all' && o.channel !== channelFilter) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customer.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-xl font-black text-white">Order Fulfilment & Invoices</h2>
        <p className="text-xs text-slate-400">
          Track omnichannel customer shipments and counter sales.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0f1725] border border-dark-border p-3 rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <div className="flex bg-[#121a28] p-1 rounded-xl border border-dark-border">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold ${channelFilter === 'all' ? 'bg-brand text-white' : 'text-slate-400'}`}
            >
              All Channels ({orders.length})
            </button>
            <button
              onClick={() => setChannelFilter('online')}
              className={`px-3 py-1.5 rounded-lg font-bold ${channelFilter === 'online' ? 'bg-brand text-white' : 'text-slate-400'}`}
            >
              Online Store
            </button>
            <button
              onClick={() => setChannelFilter('POS')}
              className={`px-3 py-1.5 rounded-lg font-bold ${channelFilter === 'POS' ? 'bg-brand text-white' : 'text-slate-400'}`}
            >
              Shop POS
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order # or customer..."
            className="w-full bg-[#121a28] text-xs text-white placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-dark-border focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0f1725] border border-dark-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#121a28] text-slate-400 border-b border-dark-border uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-4">Order # / Date</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status Pipeline</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/60">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-[#121c2c] transition">
                  <td className="p-4">
                    <div className="font-bold font-mono text-white text-sm">{order.orderNumber}</div>
                    <div className="text-[11px] text-slate-500">{order.createdAt}</div>
                  </td>

                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      order.channel === 'POS' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {order.channel}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="font-semibold text-slate-200">{order.customer.name}</div>
                    <div className="text-[11px] text-slate-400">{order.customer.phone}</div>
                  </td>

                  <td className="p-4">
                    <div className="text-slate-300 font-medium">
                      {order.items.length} items
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                      {order.items.map(it => it.productTitle).join(', ')}
                    </div>
                  </td>

                  <td className="p-4 font-mono">
                    <div className="font-extrabold text-white">{formatPrice(order.total)}</div>
                    <div className="text-[10px] text-emerald-400">{order.paymentMethod} • {order.paymentStatus}</div>
                  </td>

                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="bg-[#121b2b] text-[11px] font-bold text-white px-2.5 py-1.5 rounded-lg border border-dark-border focus:border-brand focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-dark-surface border border-dark-border inline-flex items-center gap-1 text-[11px] font-semibold"
                      title="Print GST Invoice"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

