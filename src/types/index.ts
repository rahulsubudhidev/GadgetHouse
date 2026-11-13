export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rateAgainstINR: number; // 1 INR = rate
  format: (amount: number) => string;
}

export type Language = 'en' | 'hi' | 'ar';

export type UserRole = 'Owner' | 'Manager' | 'Inventory' | 'Cashier' | 'Support';

export interface PhoneBrand {
  id: string;
  name: string;
  logo?: string;
}

export interface PhoneModel {
  id: string;
  brandId: string;
  name: string;
  releaseYear: number;
  popular?: boolean;
}

export type CategorySlug = 
  | 'back-cases'
  | 'tempered-glass'
  | 'smart-gadgets'
  | 'accessories'
  | 'camera-protectors';

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  itemCount: number;
  image: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  phoneModelId?: string;
  colorName?: string;
  colorHex?: string;
  finish?: string;
  price: number;
  compareAtPrice: number;
  costPrice: number;
  stockWarehouse: number;
  stockShop: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: CategorySlug;
  accessoryBrand: string;
  badge?: string; // 'BEST SELLER #1', '47% OFF', 'NEW', 'HOT'
  rank?: number; // 1, 2, 3
  images: string[];
  basePrice: number;
  compareAtPrice: number;
  costPrice: number;
  hsnCode: string;
  gstRate: number; // e.g. 18
  rating: number;
  reviewCount: number;
  compatibleModelIds: string[]; // List of PhoneModel IDs
  variants: ProductVariant[];
  features: string[];
  specs: Record<string, string>;
  isMagSafe?: boolean;
  material?: string;
  status: 'active' | 'draft' | 'archived';
  optionsCount?: number;
}

export interface CartItem {
  id: string; // unique cart line id
  productId: string;
  product: Product;
  variantId: string;
  selectedModelId?: string;
  selectedColor?: string;
  selectedFinish?: string;
  price: number;
  compareAtPrice: number;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneModel?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  address?: CustomerAddress;
}

export interface CustomerAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 'Pending' | 'Paid' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';

export interface OrderItem {
  productId: string;
  productTitle: string;
  variantSku: string;
  phoneModelName?: string;
  color?: string;
  price: number;
  quantity: number;
  hsnCode: string;
  gstRate: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  channel: 'online' | 'POS';
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  taxCGST: number;
  taxSGST: number;
  taxIGST: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'NetBanking' | 'COD' | 'Split';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  shippingAddress?: CustomerAddress;
  trackingNumber?: string;
  invoiceUrl?: string;
  notes?: string;
}

export interface PosShift {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  closingCashExpected: number;
  closingCashActual?: number;
  totalSales: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  ordersCount: number;
  status: 'open' | 'closed';
}

export interface PosParkedBill {
  id: string;
  createdAt: string;
  items: CartItem[];
  customerPhone?: string;
  customerName?: string;
  selectedPhoneModel?: string;
  notes?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLogin: string;
}

export interface AuthUser {
  name: string;
  email: string;
  phone: string;
  role?: UserRole | 'Customer';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  description: string;
  active: boolean;
}

