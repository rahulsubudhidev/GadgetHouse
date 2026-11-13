import React from 'react';
import { X, Printer, Share2, CheckCircle, Download } from 'lucide-react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';

interface POSReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export const POSReceiptModal: React.FC<POSReceiptModalProps> = ({ order, onClose }) => {
  const { formatPrice } = useStore();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-sm bg-white text-slate-900 rounded-3xl p-6 shadow-2xl z-10 font-mono text-xs">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Thermal Slip 80mm format (PRD Section 7.1) */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-dashed border-slate-300">
            <h2 className="text-base font-black tracking-tight">GADGET HOUSE</h2>
            <p className="text-[10px] text-slate-600">Mobile Accessories & Electronics</p>
            <p className="text-[10px] text-slate-600">Gandhi Nagar, Brahmapur - 760002</p>
            <p className="text-[10px] font-bold text-slate-800">GSTIN: 21AAACG1942M1Z8</p>
            <div className="inline-block bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold mt-1">
              ORIGINAL TAX INVOICE
            </div>
          </div>

          <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>Bill No: <strong>{order.orderNumber}</strong></span>
              <span>{order.createdAt.split(' ')[1]}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Date: {order.createdAt.split(' ')[0]}</span>
              <span>Cashier: Amit S.</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cust: {order.customer.name}</span>
              <span>{order.customer.phone}</span>
            </div>
          </div>

          {/* Items */}
          <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-2">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500 pb-1">
              <span>Item / HSN</span>
              <span>Qty x Price</span>
              <span>Total</span>
            </div>
            {order.items.map((it, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-slate-900 line-clamp-1">{it.productTitle}</div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>HSN: {it.hsnCode} ({it.phoneModelName || 'Univ'})</span>
                  <span>{it.quantity} x ₹{it.price}</span>
                  <span className="font-bold text-slate-900">₹{it.price * it.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals & GST breakdown */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 text-[10px]">
              <span>CGST (9.0%):</span>
              <span>₹{order.taxCGST}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[10px]">
              <span>SGST (9.0%):</span>
              <span>₹{order.taxSGST}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
              <span>GRAND TOTAL:</span>
              <span>₹{order.total}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-700">
              <span>Paid Via:</span>
              <span className="uppercase">{order.paymentMethod}</span>
            </div>
          </div>

          <div className="text-center pt-3 pb-2 text-[10px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-800">Thank you for visiting Gadget House!</p>
            <p>7-Day Replacement with Original Bill</p>
            <p className="text-[9px]">WhatsApp: +91 94371 88200</p>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition"
            >
              New Bill (F2)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

