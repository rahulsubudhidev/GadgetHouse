import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, Copy, AlertCircle, Check, Smartphone } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { PHONE_MODELS, CATEGORIES } from '../../data/mockData';

export const AdminProducts: React.FC = () => {
  const { currentRole, checkPermission, addAuditLog } = useAdmin();
  const { products, setProducts, formatPrice } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<any>('tempered-glass');
  const [newPrice, setNewPrice] = useState(799);
  const [newComparePrice, setNewComparePrice] = useState(1499);
  const [newCostPrice, setNewCostPrice] = useState(250);
  const [newHsn, setNewHsn] = useState('70071900');
  const [newGst, setNewGst] = useState(18);
  const [newStockWarehouse, setNewStockWarehouse] = useState(100);
  const [newStockShop, setNewStockShop] = useState(30);
  const [selectedCompatModels, setSelectedCompatModels] = useState<string[]>(['ip-17-pm', 'ip-17-p']);

  const canEdit = checkPermission('editProducts');
  const canDelete = checkPermission('deleteProducts');

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    if (!canDelete) {
      alert(`Access Denied: Only Store Owner can delete products (PRD 6.2).`);
      return;
    }
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      addAuditLog('Product Deleted', `Deleted product: ${title} (ID: ${id})`);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/\s+/g, '-'),
      subtitle: 'Engineered for precision fit & military grade protection',
      description: 'Precision engineered accessory from Gadget House.',
      category: newCategory,
      accessoryBrand: 'Gadget House Original',
      badge: 'NEW',
      basePrice: Number(newPrice),
      compareAtPrice: Number(newComparePrice),
      costPrice: Number(newCostPrice),
      hsnCode: newHsn,
      gstRate: Number(newGst),
      rating: 5.0,
      reviewCount: 1,
      images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80'],
      compatibleModelIds: selectedCompatModels,
      features: ['Precision edge contour', 'Fast responsive feel', 'Easy bubble-free install'],
      specs: { 'Material': 'Alumina Compound', 'Warranty': '6 Months' },
      status: 'active',
      variants: [
        {
          id: `var-${Date.now()}`,
          sku: `GH-${newCategory.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
          barcode: `890432${Math.floor(100000 + Math.random() * 900000)}`,
          price: Number(newPrice),
          compareAtPrice: Number(newComparePrice),
          costPrice: Number(newCostPrice),
          stockWarehouse: Number(newStockWarehouse),
          stockShop: Number(newStockShop)
        }
      ]
    };

    setProducts(prev => [newProd, ...prev]);
    addAuditLog('Product Created', `Added new product: ${newTitle} (HSN: ${newHsn})`);
    setIsAddModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Catalogue & Products</h2>
          <p className="text-xs text-slate-400">
            Manage accessories, phone compatibility matrix, barcode SKUs, and GST tax codes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product (under 3 min)</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-[#0f1725] border border-dark-border p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, SKU, or category..."
            className="w-full bg-[#121b2b] text-xs text-white placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-dark-border focus:border-brand focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">
          {filteredProducts.length} products listed
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-[#0f1725] border border-dark-border rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121a28] text-slate-400 border-b border-dark-border uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price / Cost</th>
                <th className="p-4">HSN / GST</th>
                <th className="p-4">Stock (Shop / Wh)</th>
                <th className="p-4">Compatible Devices</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/60">
              {filteredProducts.map(product => {
                const totalShop = product.variants.reduce((s, v) => s + v.stockShop, 0);
                const totalWh = product.variants.reduce((s, v) => s + v.stockWarehouse, 0);

                return (
                  <tr key={product.id} className="hover:bg-[#121c2c] transition">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt=""
                        className="w-10 h-10 rounded-lg bg-dark-bg object-contain p-0.5 border border-dark-border shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white max-w-xs truncate">{product.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {product.variants[0]?.sku || 'SKU-001'}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="bg-dark-surface px-2 py-0.5 rounded text-[11px] text-slate-300">
                        {product.category}
                      </span>
                    </td>

                    <td className="p-4 font-mono">
                      <div className="font-bold text-white">{formatPrice(product.basePrice)}</div>
                      {currentRole === 'Owner' || currentRole === 'Manager' ? (
                        <div className="text-[10px] text-slate-500">Cost: ₹{product.costPrice}</div>
                      ) : (
                        <div className="text-[10px] text-slate-600">Cost: ••• (Hidden)</div>
                      )}
                    </td>

                    <td className="p-4 text-[11px]">
                      <div className="font-mono text-slate-300">{product.hsnCode}</div>
                      <div className="text-slate-500">{product.gstRate}% GST</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold font-mono ${totalShop < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {totalShop}
                        </span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-400 font-mono">{totalWh}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Shop / Warehouse</div>
                    </td>

                    <td className="p-4">
                      <span className="text-[11px] text-brand font-medium">
                        {product.compatibleModelIds.length} models
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(product.id, product.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Delete Product (Owner Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal (PRD Section 5.3 & Acceptance criteria: Add product in under 3 mins) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 text-white z-10 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand" />
                <span>Add New Product & Variants</span>
              </h3>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Product Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Blueo 3D Privacy Tempered Glass for iPhone"
                    className="w-full bg-[#111724] border border-dark-border rounded-xl p-2.5 text-white focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-[#111724] border border-dark-border rounded-xl p-2.5 text-white focus:border-brand focus:outline-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">HSN Code</label>
                    <input
                      type="text"
                      value={newHsn}
                      onChange={(e) => setNewHsn(e.target.value)}
                      className="w-full bg-[#111724] border border-dark-border rounded-xl p-2.5 text-white focus:border-brand focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Base Price (₹)</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full bg-[#111724] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Compare Price (₹)</label>
                    <input
                      type="number"
                      value={newComparePrice}
                      onChange={(e) => setNewComparePrice(Number(e.target.value))}
                      className="w-full bg-[#111724] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Cost Price (₹)</label>
                    <input
                      type="number"
                      value={newCostPrice}
                      onChange={(e) => setNewCostPrice(Number(e.target.value))}
                      className="w-full bg-[#111724] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Warehouse Initial Stock</label>
                    <input
                      type="number"
                      value={newStockWarehouse}
                      onChange={(e) => setNewStockWarehouse(Number(e.target.value))}
                      className="w-full bg-[#111724] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Shop Counter Stock</label>
                    <input
                      type="number"
                      value={newStockShop}
                      onChange={(e) => setNewStockShop(Number(e.target.value))}
                      className="w-full bg-[#111724] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Compatibility Tree Selector */}
                <div>
                  <label className="block text-slate-400 mb-1.5 font-semibold">
                    Phone Compatibility (Bulk Select Tree)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-[#0c121d] border border-dark-border rounded-xl">
                    {PHONE_MODELS.map(m => {
                      const isChecked = selectedCompatModels.includes(m.id);
                      return (
                        <label key={m.id} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedCompatModels(prev =>
                                isChecked ? prev.filter(x => x !== m.id) : [...prev, m.id]
                              );
                            }}
                            className="rounded bg-dark-surface border-dark-border text-brand"
                          />
                          <span className="truncate">{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-dark-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold shadow-lg"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

