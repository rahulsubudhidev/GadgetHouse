import React from 'react';
import { Download, FileSpreadsheet, PieChart, TrendingUp, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';

export const AdminReports: React.FC = () => {
  const { orders } = useAdmin();
  const { formatPrice } = useStore();

  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const totalCGST = orders.reduce((s, o) => s + o.taxCGST, 0);
  const totalSGST = orders.reduce((s, o) => s + o.taxSGST, 0);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "OrderNumber,Channel,Date,Customer,Amount,GST_CGST,GST_SGST,PaymentMethod\n"
      + orders.map(o => `${o.orderNumber},${o.channel},${o.createdAt},"${o.customer.name}",${o.total},${o.taxCGST},${o.taxSGST},${o.paymentMethod}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GadgetHouse_GSTR_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">GST & Financial Reports</h2>
          <p className="text-xs text-slate-400">
            GSTR-1 compliant tax breakdown and channel performance metrics.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg self-start"
        >
          <Download className="w-4 h-4" />
          <span>Export GSTR-Ready CSV</span>
        </button>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f1725] border border-dark-border">
          <div className="text-xs text-slate-400 mb-1">Total Gross Revenue</div>
          <div className="text-2xl font-black text-white font-mono">{formatPrice(totalSales)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across all online & POS invoices</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1725] border border-dark-border">
          <div className="text-xs text-slate-400 mb-1">CGST Collected (9%)</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatPrice(totalCGST)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Central GST payable</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1725] border border-dark-border">
          <div className="text-xs text-slate-400 mb-1">SGST Collected (9%)</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatPrice(totalSGST)}</div>
          <div className="text-[10px] text-slate-500 mt-1">State GST payable (Odisha 21)</div>
        </div>
      </div>

      {/* HSN Code Breakdown Table */}
      <div className="p-6 rounded-2xl bg-[#0f1725] border border-dark-border">
        <h3 className="text-sm font-bold text-white mb-4">HSN Summary (GSTR-1 Table 12 Compliant)</h3>
        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-left">
            <thead className="bg-[#121a28] text-slate-400 border-b border-dark-border uppercase text-[10px]">
              <tr>
                <th className="p-3">HSN Code</th>
                <th className="p-3">Description</th>
                <th className="p-3">Taxable Value</th>
                <th className="p-3">Rate</th>
                <th className="p-3">CGST</th>
                <th className="p-3">SGST</th>
                <th className="p-3">Total Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40 text-slate-200">
              <tr>
                <td className="p-3 text-brand font-bold">70071900</td>
                <td className="p-3 font-sans">Toughened Safety Glass Protectors</td>
                <td className="p-3">₹1,947.45</td>
                <td className="p-3">18%</td>
                <td className="p-3">₹175.27</td>
                <td className="p-3">₹175.27</td>
                <td className="p-3 font-bold text-white">₹350.54</td>
              </tr>
              <tr>
                <td className="p-3 text-brand font-bold">39269099</td>
                <td className="p-3 font-sans">Plastic Hybrid Protective Cases</td>
                <td className="p-3">₹846.61</td>
                <td className="p-3">18%</td>
                <td className="p-3">₹76.19</td>
                <td className="p-3">₹76.19</td>
                <td className="p-3 font-bold text-white">₹152.38</td>
              </tr>
              <tr>
                <td className="p-3 text-brand font-bold">85044030</td>
                <td className="p-3 font-sans">Static Fast Converters / GaN Chargers</td>
                <td className="p-3">₹1,270.33</td>
                <td className="p-3">18%</td>
                <td className="p-3">₹114.33</td>
                <td className="p-3">₹114.33</td>
                <td className="p-3 font-bold text-white">₹228.66</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

