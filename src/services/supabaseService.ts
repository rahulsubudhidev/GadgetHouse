import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, ProductVariant, Category, PhoneBrand, PhoneModel, Order, Coupon, UserRole } from '../types';
import { INITIAL_STAFF } from '../data/mockData';

/**
 * Fetch all categories from Supabase
 */
export async function getSupabaseCategories(): Promise<Category[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) return null;

    return data.map((cat: any) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description || '',
      itemCount: cat.item_count || 0,
      image: cat.image || ''
    }));
  } catch (err) {
    console.warn('Failed to fetch categories from Supabase:', err);
    return null;
  }
}

/**
 * Fetch phone brands and models from Supabase
 */
export async function getSupabasePhoneData(): Promise<{ brands: PhoneBrand[]; models: PhoneModel[] } | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const [brandsRes, modelsRes] = await Promise.all([
      supabase.from('phone_brands').select('*').order('name'),
      supabase.from('phone_models').select('*').order('release_year', { ascending: false })
    ]);

    if (brandsRes.error || modelsRes.error || !brandsRes.data || !modelsRes.data) {
      return null;
    }

    const brands: PhoneBrand[] = brandsRes.data.map((b: any) => ({
      id: b.id,
      name: b.name,
      logo: b.logo
    }));

    const models: PhoneModel[] = modelsRes.data.map((m: any) => ({
      id: m.id,
      brandId: m.brand_id,
      name: m.name,
      releaseYear: m.release_year,
      popular: m.popular
    }));

    return { brands, models };
  } catch (err) {
    console.warn('Failed to fetch phone data from Supabase:', err);
    return null;
  }
}

/**
 * Fetch products with variants and compatible models
 */
export async function getSupabaseProducts(): Promise<Product[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: prods, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active');

    if (prodErr || !prods || prods.length === 0) return null;

    const [variantsRes, compRes] = await Promise.all([
      supabase.from('product_variants').select('*'),
      supabase.from('product_compatible_models').select('*')
    ]);

    const variantsData = variantsRes.data || [];
    const compData = compRes.data || [];

    return prods.map((p: any) => {
      const pVariants: ProductVariant[] = variantsData
        .filter((v: any) => v.product_id === p.id)
        .map((v: any) => ({
          id: v.id,
          sku: v.sku,
          barcode: v.barcode || '',
          phoneModelId: v.phone_model_id,
          colorName: v.color_name,
          colorHex: v.color_hex,
          finish: v.finish,
          price: Number(v.price),
          compareAtPrice: Number(v.compare_at_price),
          costPrice: Number(v.cost_price),
          stockWarehouse: v.stock_warehouse || 0,
          stockShop: v.stock_shop || 0
        }));

      const compatibleModelIds: string[] = compData
        .filter((c: any) => c.product_id === p.id)
        .map((c: any) => c.phone_model_id);

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        subtitle: p.subtitle || '',
        description: p.description || '',
        category: p.category_slug,
        accessoryBrand: p.accessory_brand,
        badge: p.badge,
        rank: p.rank,
        images: p.images || [],
        basePrice: Number(p.base_price),
        compareAtPrice: Number(p.compare_at_price),
        costPrice: Number(p.cost_price),
        hsnCode: p.hsn_code || '3926',
        gstRate: Number(p.gst_rate || 18),
        rating: Number(p.rating || 4.8),
        reviewCount: p.review_count || 0,
        compatibleModelIds,
        variants: pVariants,
        features: p.features || [],
        specs: p.specs || {},
        isMagSafe: p.is_mag_safe,
        material: p.material || '',
        status: p.status,
        optionsCount: p.options_count || 1
      };
    });
  } catch (err) {
    console.warn('Failed to fetch products from Supabase:', err);
    return null;
  }
}

/**
 * Fetch Coupons
 */
export async function getSupabaseCoupons(): Promise<Coupon[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('active', true);

    if (error || !data) return null;

    return data.map((c: any) => ({
      code: c.code,
      discountType: c.discount_type,
      discountValue: Number(c.discount_value),
      minOrderValue: Number(c.min_order_value),
      description: c.description || '',
      active: c.active
    }));
  } catch (err) {
    console.warn('Failed to fetch coupons from Supabase:', err);
    return null;
  }
}

/**
 * Save an order to Supabase
 */
export async function saveOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }; // Mock success if not configured
  }

  try {
    // 1. Insert order record
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: order.orderNumber,
        channel: order.channel,
        customer_name: order.customer.name,
        customer_phone: order.customer.phone,
        customer_email: order.customer.email || null,
        subtotal: order.subtotal,
        discount: order.discount,
        coupon_code: order.couponCode || null,
        shipping: order.shipping,
        tax_cgst: order.taxCGST,
        tax_sgst: order.taxSGST,
        tax_igst: order.taxIGST,
        total: order.total,
        status: order.status,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        shipping_address: order.shippingAddress || null,
        tracking_number: order.trackingNumber || null
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items
    if (order.items && order.items.length > 0 && orderData) {
      const itemsPayload = order.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_title: item.productTitle,
        variant_sku: item.variantSku,
        phone_model_name: item.phoneModelName || null,
        color: item.color || null,
        price: item.price,
        quantity: item.quantity,
        hsn_code: item.hsnCode,
        gst_rate: item.gstRate,
        image: item.image
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsPayload);

      if (itemsError) throw itemsError;
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error saving order to Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Lookup order by Order Number or Phone Number
 */
export async function searchOrderInSupabase(query: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const cleanQuery = query.trim();
    const { data: orderData, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .or(`order_number.ilike.%${cleanQuery}%,customer_phone.ilike.%${cleanQuery}%`)
      .limit(1)
      .maybeSingle();

    if (error || !orderData) return null;

    const items = (orderData.order_items || []).map((i: any) => ({
      productId: i.product_id,
      productTitle: i.product_title,
      variantSku: i.variant_sku,
      phoneModelName: i.phone_model_name,
      color: i.color,
      price: Number(i.price),
      quantity: i.quantity,
      hsnCode: i.hsn_code || '3926',
      gstRate: Number(i.gst_rate || 18),
      image: i.image || ''
    }));

    return {
      id: orderData.id,
      orderNumber: orderData.order_number,
      channel: orderData.channel,
      createdAt: orderData.created_at,
      customer: {
        name: orderData.customer_name,
        phone: orderData.customer_phone,
        email: orderData.customer_email || undefined
      },
      items,
      subtotal: Number(orderData.subtotal),
      discount: Number(orderData.discount),
      couponCode: orderData.coupon_code || undefined,
      shipping: Number(orderData.shipping),
      taxCGST: Number(orderData.tax_cgst),
      taxSGST: Number(orderData.tax_sgst),
      taxIGST: Number(orderData.tax_igst),
      total: Number(orderData.total),
      status: orderData.status,
      paymentMethod: orderData.payment_method,
      paymentStatus: orderData.payment_status,
      shippingAddress: orderData.shipping_address,
      trackingNumber: orderData.tracking_number,
      notes: orderData.notes
    };
  } catch (err) {
    console.warn('Error querying order:', err);
    return null;
  }
}

/**
 * Authentication Helpers
 */
export async function supabaseSignUp(email: string, password: string, name?: string, phone?: string): Promise<{ data: any; error: any }> {
  if (!isSupabaseConfigured()) {
    return { data: { user: { email, user_metadata: { full_name: name, phone } }, session: { access_token: 'mock' } }, error: null };
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name || '',
        phone: phone || ''
      }
    }
  });
}

export async function supabaseSignIn(email: string, password: string): Promise<{ data: any; error: any }> {
  if (!isSupabaseConfigured()) {
    return { data: { user: { email, user_metadata: { full_name: 'Store Demo User', phone: '+91 98765 43210' } }, session: { access_token: 'mock' } }, error: null };
  }
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
}

export async function supabaseSignOut() {
  if (!isSupabaseConfigured()) return { error: null };
  return await supabase.auth.signOut();
}

/**
 * Determine if an email belongs to an authorized staff user
 */
export async function getStaffRoleForEmail(email: string): Promise<UserRole | null> {
  if (!email) return null;

  // 1. Check configured staff list
  const match = INITIAL_STAFF.find(
    s => s.email.toLowerCase() === email.toLowerCase() && s.active
  );
  if (match) {
    return match.role;
  }

  // 2. Query live Supabase staff_users table if connected
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('role, active')
        .ilike('email', email.trim())
        .eq('active', true)
        .maybeSingle();

      if (!error && data?.role) {
        return data.role as UserRole;
      }
    } catch (e) {
      console.warn('Could not query staff role from Supabase:', e);
    }
  }

  return null;
}
