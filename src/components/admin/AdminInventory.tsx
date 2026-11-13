import React, { useState } from 'react';
import { Package, ArrowLeftRight, AlertTriangle, ShieldCheck, Plus, Check } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';
import { PRODUCTS } from '../../data/mockData';

export const AdminInventory: React.FC = () => {
  const { transferStock, adjustStock, checkPermission } = useAdmin();
  const { products } = useStore();

  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [transferQty, setTransferQty] = useState(10);
  const [transferFrom, setTransferFrom] = useState<'warehouse' | 'shop'>('warehouse');
  const [transferTo, setTransferTo] = useState<'warehouse' | 'shop'>('shop');
  const [transferMsg, setTransferMsg] = useState<string | null>(null);

  // Adjustment state
  const [adjVariantId, setAdjVariantId] = useState(products[0]?.variants[0]?.id);
  const [adjLocation, setAdjLocation] = useState<'warehouse' | 'shop'>('shop');
  const [adjNewQty, setAdjNewQty] = useState(25);
  const [adjReason, setAdjReason] = useState('Recount / Stocktake');

  const canManage = checkPermission('manageInventory');

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      alert('Access Denied: Only Inventory & Manager roles can transfer stock (PRD 6.2).');
      return;
    }
    const variantId = selectedProduct.variants[0]?.id;
    if (!variantId) return;

    const ok = transferStock(selectedProduct.id, variantId, Number(transferQty), transferFrom, transferTo);
    if (ok) {
      setTransferMsg(`Successfully transferred ${transferQty} units to ${transferTo}!`);
      setTimeout(() => setTransferMsg(null), 3000);
    } else {
      alert('Insufficient stock at source location to complete transfer.');
    }
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      alert('Access Denied: Permission required.');
      return;
    }
    adjustStock(selectedProduct.id, selectedProduct.variants[0]?.id, adjLocation, Number(adjNewQty), adjReason);
    setTransferMsg(`Stock adjusted at ${adjLocation} to ${adjNewQty} units. (Logged in Audit)`);
    setTimeout(() => setTransferMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-xl font-black text-white">Inventory & Multi-Location Stock</h2>
        <p className="text-xs text-slate-400">
          Sync inventory across Online Central Warehouse and Gandhi Nagar Shop Counter.
        </p>
      </div>

      {transferMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{transferMsg}</span>
        </div>
      )}

      {/* 2 Action Modules: Transfer & Adjustment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Stock Transfer Form */}
        <div className="p-6 rounded-2xl bg-[#0f1725] border border-dark-border space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-brand" />
            <h3 className="text-sm font-bold text-white">Inter-Location Stock Transfer</h3>
          </div>

          <form onSubmit={handleTransfer} className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Select Product</label>
              <select
                value={selectedProduct.id}
                onChange={(e) => {
                  const p = products.find(x => x.id === e.target.value);
                  if (p) setSelectedProduct(p);
                }}
                className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">From Location</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value as any)}
                  className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white"
                >
                  <option value="warehouse">Central Warehouse</option>
                  <option value="shop">Shop Counter</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">To Location</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value as any)}
                  className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white"
                >
                  <option value="shop">Shop Counter</option>
                  <option value="warehouse">Central Warehouse</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Transfer Quantity (Units)</label>
              <input
                type="number"
                min="1"
                value={transferQty}
                onChange={(e) => setTransferQty(Number(e.target.value))}
                className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl transition shadow-md"
            >
              Execute Stock Transfer
            </button>
          </form>
        </div>

        {/* Stock Adjustment with Required Audit Reason */}
        <div className="p-6 rounded-2xl bg-[#0f1725] border border-dark-border space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Stock Adjustment (Audit Tracked)</h3>
          </div>

          <form onSubmit={handleAdjust} className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Target Product</label>
              <input
                type="text"
                disabled
                value={selectedProduct.title}
                className="w-full bg-[#0a0e16] border border-dark-border rounded-xl p-2.5 text-slate-400 truncate"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Location</label>
                <select
                  value={adjLocation}
                  onChange={(e) => setAdjLocation(e.target.value as any)}
                  className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white"
                >
                  <option value="shop">Shop Counter</option>
                  <option value="warehouse">Central Warehouse</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">New Counted Qty</label>
                <input
                  type="number"
                  value={adjNewQty}
                  onChange={(e) => setAdjNewQty(Number(e.target.value))}
                  className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold text-amber-400">
                Mandatory Reason (PRD 5.4 Audit Trail)
              </label>
              <select
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white"
              >
                <option value="Recount / Physical Stocktake">Recount / Physical Stocktake</option>
                <option value="Damaged in transit / Unsealed">Damaged in transit / Unsealed</option>
                <option value="Display / Demonstration Unit">Display / Demonstration Unit</option>
                <option value="Returned to Supplier">Returned to Supplier</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#172233] hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition border border-dark-border"
            >
              Log Adjustment in Audit Ledger
            </button>
          </form>
        </div>

      </div>

      {/* Live Stock Level Table */}
      <div className="bg-[#0f1725] border border-dark-border rounded-2xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">Current Stock Matrix by Location</h4>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#121a28] text-slate-400 border-b border-dark-border uppercase text-[10px] font-semibold">
              <tr>
                <th className="p-3">Item / SKU</th>
                <th className="p-3">Central Warehouse</th>
                <th className="p-3">Shop Counter</th>
                <th className="p-3">Total Asset Value</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40 font-mono">
              {products.map(p => {
                const wh = p.variants[0]?.stockWarehouse || 0;
                const sh = p.variants[0]?.stockShop || 0;
                const totalVal = (wh + sh) * p.costPrice;

                return (
                  <tr key={p.id} className="hover:bg-[#121c2c]">
                    <td className="p-3 font-sans">
                      <div className="font-bold text-white text-xs">{p.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.variants[0]?.sku}</div>
                    </td>
                    <td className="p-3 text-slate-300">{wh} units</td>
                    <td className="p-3 font-bold text-white">{sh} units</td>
                    <td className="p-3 text-brand">₹{totalVal.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-sans">
                      {sh < 20 ? (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                          Restock Counter
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                          Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

