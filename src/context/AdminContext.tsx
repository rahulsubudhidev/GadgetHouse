import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, StaffUser, Order, PosShift, PosParkedBill, AuditLogItem, Product } from '../types';
import { INITIAL_STAFF, INITIAL_ORDERS, INITIAL_AUDIT_LOGS, PRODUCTS } from '../data/mockData';
import { useStore } from './StoreContext';

interface AdminContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  staffUsers: StaffUser[];
  updateStaffRole: (staffId: string, newRole: UserRole) => void;
  addStaffUser: (staff: Omit<StaffUser, 'id'>) => void;
  toggleStaffStatus: (staffId: string) => void;
  orders: Order[];
  auditLogs: AuditLogItem[];
  posShift: PosShift;
  parkedBills: PosParkedBill[];
  openPosShift: (openingCash: number) => void;
  closePosShift: (closingCashActual: number) => { expected: number; actual: number; diff: number };
  recordPosSale: (order: Order) => void;
  holdBill: (bill: PosParkedBill) => void;
  resumeBill: (id: string) => PosParkedBill | undefined;
  deleteParkedBill: (id: string) => void;
  transferStock: (productId: string, variantId: string, qty: number, from: 'warehouse' | 'shop', to: 'warehouse' | 'shop') => boolean;
  adjustStock: (productId: string, variantId: string, location: 'warehouse' | 'shop', newQty: number, reason: string) => void;
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  addAuditLog: (action: string, details: string) => void;
  checkPermission: (action: 'viewReports' | 'editProducts' | 'deleteProducts' | 'changePrices' | 'manageInventory' | 'openPOS' | 'givePOSDiscount' | 'voidBill' | 'viewOrders' | 'manageStaff' | 'settings') => boolean;
}

const initialShift: PosShift = {
  id: 'shift-101',
  cashierName: 'Amit Sen',
  startTime: '2026-11-13 10:15:00',
  openingCash: 2000,
  closingCashExpected: 2599,
  totalSales: 599,
  cashSales: 599,
  upiSales: 0,
  cardSales: 0,
  ordersCount: 1,
  status: 'open'
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useStore();
  const [currentRole, setCurrentRole] = useState<UserRole>('Owner');

  // Synchronize current role with logged-in user's role
  useEffect(() => {
    if (currentUser?.role && currentUser.role !== 'Customer') {
      setCurrentRole(currentUser.role as UserRole);
    }
  }, [currentUser]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(INITIAL_STAFF);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [posShift, setPosShift] = useState<PosShift>(initialShift);
  const [parkedBills, setParkedBills] = useState<PosParkedBill[]>([
    {
      id: 'park-1',
      createdAt: '11:10 AM',
      customerPhone: '+91 99887 76655',
      customerName: 'Kunal (Waiting for card)',
      selectedPhoneModel: 'iPhone 17 Pro',
      items: [
        {
          id: 'temp-p1',
          productId: 'prod-blueo-matte',
          product: PRODUCTS[1],
          variantId: 'var-b2-17pm',
          selectedModelId: 'ip-17-p',
          selectedFinish: 'Matte Gaming',
          price: 899,
          compareAtPrice: 1599,
          quantity: 1
        }
      ]
    }
  ]);

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: staffUsers.find(s => s.role === currentRole)?.name || 'Admin User',
      role: currentRole,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const openPosShift = (openingCash: number) => {
    setPosShift({
      id: `shift-${Date.now().toString().slice(-4)}`,
      cashierName: staffUsers.find(s => s.role === currentRole)?.name || 'Cashier',
      startTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      openingCash,
      closingCashExpected: openingCash,
      totalSales: 0,
      cashSales: 0,
      upiSales: 0,
      cardSales: 0,
      ordersCount: 0,
      status: 'open'
    });
    addAuditLog('POS Shift Started', `Shift opened with initial cash float ₹${openingCash}`);
  };

  const closePosShift = (closingCashActual: number) => {
    const diff = closingCashActual - posShift.closingCashExpected;
    setPosShift(prev => ({
      ...prev,
      closingCashActual,
      endTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'closed'
    }));
    addAuditLog(
      'POS Shift Closed',
      `Shift closed. Expected: ₹${posShift.closingCashExpected}, Counted: ₹${closingCashActual}, Variance: ₹${diff}`
    );
    return { expected: posShift.closingCashExpected, actual: closingCashActual, diff };
  };

  const recordPosSale = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);

    // Update Shift Metrics
    setPosShift(prev => {
      const isCash = newOrder.paymentMethod === 'Cash';
      const isUpi = newOrder.paymentMethod === 'UPI';
      const isCard = newOrder.paymentMethod === 'Card';

      return {
        ...prev,
        totalSales: prev.totalSales + newOrder.total,
        cashSales: isCash ? prev.cashSales + newOrder.total : prev.cashSales,
        upiSales: isUpi ? prev.upiSales + newOrder.total : prev.upiSales,
        cardSales: isCard ? prev.cardSales + newOrder.total : prev.cardSales,
        closingCashExpected: isCash ? prev.closingCashExpected + newOrder.total : prev.closingCashExpected,
        ordersCount: prev.ordersCount + 1
      };
    });

    addAuditLog(
      'POS Sale Recorded',
      `Invoice #${newOrder.orderNumber} - ₹${newOrder.total} via ${newOrder.paymentMethod}`
    );
  };

  const holdBill = (bill: PosParkedBill) => {
    setParkedBills(prev => [bill, ...prev]);
    addAuditLog('POS Bill Parked', `Parked cart for ${bill.customerName || bill.customerPhone || 'Walk-in'} (${bill.items.length} items)`);
  };

  const resumeBill = (id: string) => {
    const found = parkedBills.find(b => b.id === id);
    if (found) {
      setParkedBills(prev => prev.filter(b => b.id !== id));
      addAuditLog('POS Bill Recalled', `Resumed parked bill ID: ${id}`);
    }
    return found;
  };

  const deleteParkedBill = (id: string) => {
    setParkedBills(prev => prev.filter(b => b.id !== id));
  };

  const transferStock = (
    productId: string,
    variantId: string,
    qty: number,
    from: 'warehouse' | 'shop',
    to: 'warehouse' | 'shop'
  ) => {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return false;
    const variant = prod.variants.find(v => v.id === variantId);
    if (!variant) return false;

    if (from === 'warehouse' && variant.stockWarehouse < qty) return false;
    if (from === 'shop' && variant.stockShop < qty) return false;

    if (from === 'warehouse' && to === 'shop') {
      variant.stockWarehouse -= qty;
      variant.stockShop += qty;
    } else if (from === 'shop' && to === 'warehouse') {
      variant.stockShop -= qty;
      variant.stockWarehouse += qty;
    }

    addAuditLog(
      'Stock Transfer',
      `Transferred ${qty}x ${variant.sku} from ${from} to ${to}`
    );
    return true;
  };

  const adjustStock = (
    productId: string,
    variantId: string,
    location: 'warehouse' | 'shop',
    newQty: number,
    reason: string
  ) => {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;
    const variant = prod.variants.find(v => v.id === variantId);
    if (!variant) return;

    const oldQty = location === 'warehouse' ? variant.stockWarehouse : variant.stockShop;
    if (location === 'warehouse') {
      variant.stockWarehouse = newQty;
    } else {
      variant.stockShop = newQty;
    }

    addAuditLog(
      'Stock Adjustment',
      `Adjusted ${variant.sku} at ${location} from ${oldQty} to ${newQty}. Reason: ${reason}`
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    addAuditLog('Order Status Update', `Order #${orderId} marked as ${newStatus}`);
  };

  const updateStaffRole = (staffId: string, newRole: UserRole) => {
    setStaffUsers(prev =>
      prev.map(st => {
        if (st.id === staffId) {
          addAuditLog('Role Changed', `Changed role of ${st.name} (${st.email}) from ${st.role} to ${newRole}`);
          return { ...st, role: newRole };
        }
        return st;
      })
    );
  };

  const addStaffUser = (staffData: Omit<StaffUser, 'id'>) => {
    const newStaff: StaffUser = {
      ...staffData,
      id: `staff-${Date.now()}`
    };
    setStaffUsers(prev => [...prev, newStaff]);
    addAuditLog('Staff Added', `Added staff member ${newStaff.name} with role ${newStaff.role}`);
  };

  const toggleStaffStatus = (staffId: string) => {
    setStaffUsers(prev =>
      prev.map(st => {
        if (st.id === staffId) {
          const nextActive = !st.active;
          addAuditLog('Staff Status Changed', `${st.name} is now ${nextActive ? 'Active' : 'Inactive'}`);
          return { ...st, active: nextActive };
        }
        return st;
      })
    );
  };

  // RBAC Permission Checker following PRD Section 6.2 Default roles table
  const checkPermission = (action: string): boolean => {
    switch (currentRole) {
      case 'Owner':
        return true; // Full access
      case 'Manager':
        if (action === 'deleteProducts' || action === 'manageStaff' || action === 'settings') return false;
        return true;
      case 'Inventory':
        return ['manageInventory', 'viewReports'].includes(action);
      case 'Cashier':
        return ['openPOS', 'givePOSDiscount', 'viewReports'].includes(action);
      case 'Support':
        return ['viewOrders'].includes(action);
      default:
        return false;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        staffUsers,
        updateStaffRole,
        addStaffUser,
        toggleStaffStatus,
        orders,
        auditLogs,
        posShift,
        parkedBills,
        openPosShift,
        closePosShift,
        recordPosSale,
        holdBill,
        resumeBill,
        deleteParkedBill,
        transferStock,
        adjustStock,
        updateOrderStatus,
        addAuditLog,
        checkPermission
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

