import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  FileText, 
  Users, 
  Settings, 
  Store,
  ChevronRight,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminInventory } from './AdminInventory';
import { AdminOrders } from './AdminOrders';
import { AdminReports } from './AdminReports';
import { AdminStaff } from './AdminStaff';
import { AdminSettings } from './AdminSettings';

export const AdminLayout: React.FC = () => {
  const { setViewMode } = useStore();
  const { currentRole, setCurrentRole } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Catalogue', icon: Package },
    { id: 'inventory', label: 'Inventory & Stock', icon: Warehouse },
    { id: 'orders', label: 'Orders & Fulfilment', icon: ShoppingCart },
    { id: 'reports', label: 'GST & Financial Reports', icon: FileText },
    { id: 'staff', label: 'Staff & Roles (RBAC)', icon: Users },
    { id: 'settings', label: 'Settings & Integrations', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0c121d] border-r border-dark-border flex flex-col justify-between shrink-0">
        
        <div>
          {/* Logo & Admin Badge */}
          <div className="p-6 border-b border-dark-border flex items-center justify-between">
            <div 
              onClick={() => setViewMode('storefront')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <img src="/logo.png" alt="Gadget House" className="w-8 h-8 object-contain" />
              <div>
                <span className="font-extrabold text-sm tracking-wider text-white">
                  GADGET<span className="text-white">HOUSE</span>
                </span>
                <span className="block text-[10px] text-brand font-bold uppercase tracking-widest">
                  ADMIN PORTAL
                </span>
              </div>
            </div>
          </div>

          {/* Prominent "OPEN POS" Button (PRD Section 5.1 & Section 7) */}
          <div className="p-4">
            <button
              onClick={() => setViewMode('pos')}
              className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-xs transition shadow-xl shadow-brand/20 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
            >
              <ReceiptText className="w-4 h-4" />
              <span>OPEN POS COUNTER</span>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 text-xs">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition ${
                    isActive
                      ? 'bg-brand/15 text-brand border border-brand/30 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121c2d]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Role Bar */}
        <div className="p-4 border-t border-dark-border bg-[#0a0f18] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand/20 text-brand flex items-center justify-center font-bold">
                {currentRole[0]}
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">Logged in as</div>
                <div className="text-[10px] text-brand font-semibold">{currentRole}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setViewMode('storefront')}
            className="w-full py-2 bg-[#121a28] hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition border border-dark-border flex items-center justify-center gap-2"
          >
            <Store className="w-3.5 h-3.5 text-brand" />
            <span>Back to Storefront</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#070b12] p-6 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <AdminDashboard onNavigate={setActiveTab} />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'inventory' && <AdminInventory />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'reports' && <AdminReports />}
          {activeTab === 'staff' && <AdminStaff />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </main>

    </div>
  );
};

