import React, { useState } from 'react';
import { Save, Store, ShieldCheck, CreditCard, Truck, Check } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminSettings: React.FC = () => {
  const { currentRole, checkPermission, addAuditLog } = useAdmin();
  const [savedMsg, setSavedMsg] = useState(false);

  const canEdit = checkPermission('settings');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('Access Denied: Only Store Owner can modify store settings & payment credentials (PRD 6.2).');
      return;
    }
    setSavedMsg(true);
    addAuditLog('Settings Updated', 'Updated store GSTIN, shipping threshold & Razorpay keys');
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Store Configuration & Integrations</h2>
          <p className="text-xs text-slate-400">
            PRD Section 5.9: Legal GST details, Razorpay API credentials, and shipping thresholds.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2 self-start"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {savedMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Store settings and payment keys saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* Business & GST Profile */}
        <div className="p-6 rounded-2xl bg-[#0f1725] border border-dark-border space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-brand" />
            <span>Store Profile & Legal GST</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Company Registered Name</label>
              <input
                type="text"
                defaultValue="Gadget House Retail Pvt Ltd"
                className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-mono">GSTIN (15 Digits)</label>
                <input
                  type="text"
                  defaultValue="21AAACG1942M1Z8"
                  className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  defaultValue="GH-2026-"
                  className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Physical Store Counter Address</label>
              <textarea
                rows={2}
                defaultValue="Gandhi Nagar, Main Road, Brahmapur, Ganjam, Odisha - 760002"
                className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways & Shipping */}
        <div className="p-6 rounded-2xl bg-[#0f1725] border border-dark-border space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Payment Gateways (Razorpay & Stripe)</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Razorpay Key ID (India - Live)</label>
              <input
                type="text"
                defaultValue="rzp_live_8941904GH2026"
                className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Stripe Publishable Key (International)</label>
              <input
                type="text"
                defaultValue="pk_live_51M08GH99201"
                className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-slate-400 block mb-1">Free Shipping Threshold</label>
                <input
                  type="number"
                  defaultValue={499}
                  className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Standard Shipping Flat Fee</label>
                <input
                  type="number"
                  defaultValue={50}
                  className="w-full bg-[#121b2b] border border-dark-border rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

