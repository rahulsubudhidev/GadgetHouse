import { Category, PhoneBrand, PhoneModel, Product, Coupon, StaffUser, Order, AuditLogItem } from '../types';

export const PHONE_BRANDS: PhoneBrand[] = [
  { id: 'apple', name: 'Apple' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'google', name: 'Google Pixel' },
  { id: 'oneplus', name: 'OnePlus' },
  { id: 'nothing', name: 'Nothing' },
  { id: 'xiaomi', name: 'Xiaomi' },
  { id: 'motorola', name: 'Motorola' },
];

export const PHONE_MODELS: PhoneModel[] = [
  // Apple
  { id: 'ip-17-pm', brandId: 'apple', name: 'iPhone 17 Pro Max', releaseYear: 2025, popular: true },
  { id: 'ip-17-p', brandId: 'apple', name: 'iPhone 17 Pro', releaseYear: 2025, popular: true },
  { id: 'ip-17', brandId: 'apple', name: 'iPhone 17', releaseYear: 2025, popular: true },
  { id: 'ip-17-air', brandId: 'apple', name: 'iPhone 17 Air', releaseYear: 2025, popular: true },
  { id: 'ip-16-pm', brandId: 'apple', name: 'iPhone 16 Pro Max', releaseYear: 2024, popular: true },
  { id: 'ip-16-p', brandId: 'apple', name: 'iPhone 16 Pro', releaseYear: 2024, popular: true },
  { id: 'ip-16-plus', brandId: 'apple', name: 'iPhone 16 Plus', releaseYear: 2024, popular: true },
  { id: 'ip-16', brandId: 'apple', name: 'iPhone 16', releaseYear: 2024, popular: true },
  { id: 'ip-15-pm', brandId: 'apple', name: 'iPhone 15 Pro Max', releaseYear: 2023, popular: true },
  { id: 'ip-15-p', brandId: 'apple', name: 'iPhone 15 Pro', releaseYear: 2023 },
  { id: 'ip-15', brandId: 'apple', name: 'iPhone 15', releaseYear: 2023 },
  { id: 'ip-14-pm', brandId: 'apple', name: 'iPhone 14 Pro Max', releaseYear: 2022 },
  { id: 'ip-14-p', brandId: 'apple', name: 'iPhone 14 Pro', releaseYear: 2022 },
  { id: 'ip-14', brandId: 'apple', name: 'iPhone 14', releaseYear: 2022 },
  { id: 'ip-13', brandId: 'apple', name: 'iPhone 13', releaseYear: 2021 },

  // Samsung
  { id: 'sam-s25-u', brandId: 'samsung', name: 'Galaxy S25 Ultra', releaseYear: 2025, popular: true },
  { id: 'sam-s25-p', brandId: 'samsung', name: 'Galaxy S25+', releaseYear: 2025, popular: true },
  { id: 'sam-s25', brandId: 'samsung', name: 'Galaxy S25', releaseYear: 2025, popular: true },
  { id: 'sam-s24-u', brandId: 'samsung', name: 'Galaxy S24 Ultra', releaseYear: 2024, popular: true },
  { id: 'sam-zfold6', brandId: 'samsung', name: 'Galaxy Z Fold 6', releaseYear: 2024 },
  { id: 'sam-zflip6', brandId: 'samsung', name: 'Galaxy Z Flip 6', releaseYear: 2024 },

  // Google
  { id: 'px-9-pro-xl', brandId: 'google', name: 'Pixel 9 Pro XL', releaseYear: 2024, popular: true },
  { id: 'px-9-pro', brandId: 'google', name: 'Pixel 9 Pro', releaseYear: 2024 },
  { id: 'px-9', brandId: 'google', name: 'Pixel 9', releaseYear: 2024 },

  // OnePlus
  { id: 'op-13', brandId: 'oneplus', name: 'OnePlus 13', releaseYear: 2025, popular: true },
  { id: 'op-12', brandId: 'oneplus', name: 'OnePlus 12', releaseYear: 2024 },

  // Nothing
  { id: 'nothing-2', brandId: 'nothing', name: 'Nothing Phone (2)', releaseYear: 2023 },
  { id: 'nothing-2a', brandId: 'nothing', name: 'Nothing Phone (2a)', releaseYear: 2024 }
];

export const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    slug: 'back-cases',
    name: 'Back Cases',
    description: 'Slim, shockproof, MagSafe-ready armor for daily drops.',
    itemCount: 142,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat-2',
    slug: 'tempered-glass',
    name: 'Tempered Glass',
    description: '9H hardness, edge-to-edge HD clarity with dust-free install.',
    itemCount: 88,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat-3',
    slug: 'smart-gadgets',
    name: 'Smart Gadgets',
    description: '3-in-1 wireless docks, GaN adapters & travel chargers.',
    itemCount: 46,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat-4',
    slug: 'accessories',
    name: 'Accessories',
    description: 'MagSafe car mounts, 240W braided cables & desk stands.',
    itemCount: 65,
    image: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cat-5',
    slug: 'camera-protectors',
    name: 'Camera Protectors',
    description: 'Titanium alloy independent lens rings with AR optical glass.',
    itemCount: 39,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-blueo-clear',
    title: 'Blueo Dust Proof HD 2.5D Clear Tempered Glass for iPhone',
    slug: 'blueo-dust-proof-hd-clear-tempered-glass',
    subtitle: 'Micro-speaker dust metal mesh + 9H Japanese Asahi Glass with oleophobic coating',
    description: 'The iconic Blueo Dust Proof 2.5D tempered glass shield delivers unmatched optical clarity with an integrated ultra-fine stainless steel dust screen over the ear speaker. Treated with electroplated oleophobic coating for silky finger gliding without grease or smudges.',
    category: 'tempered-glass',
    accessoryBrand: 'Blueo',
    badge: '47% OFF',
    rank: 1,
    basePrice: 799,
    compareAtPrice: 1499,
    costPrice: 280,
    hsnCode: '70071900',
    gstRate: 18,
    rating: 4.9,
    reviewCount: 342,
    images: [
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
    ],
    compatibleModelIds: ['ip-17-pm', 'ip-17-p', 'ip-17', 'ip-17-air', 'ip-16-pm', 'ip-16-p', 'ip-16-plus', 'ip-16', 'ip-15-pm', 'ip-15-p', 'ip-15'],
    features: [
      'Built-in stainless steel dust mesh over ear speaker',
      '2.5D curved polished edge that blends into phone chassis',
      'High alumina tempered glass withstands 1.5m steel ball drop',
      'Zero bubbles alignment frame included'
    ],
    specs: {
      'Hardness': '9H Mohs Hardness',
      'Thickness': '0.33mm Ultra-thin',
      'Transparency': '99.8% Ultra-clear transmission',
      'Installation': 'Auto-align applicator tray included'
    },
    material: 'Japanese Asahi High Alumina Glass',
    status: 'active',
    optionsCount: 19,
    variants: [
      {
        id: 'var-b1-17pm',
        sku: 'BLU-TG-IP17PM',
        barcode: '890432100101',
        phoneModelId: 'ip-17-pm',
        finish: 'HD Clear',
        price: 799,
        compareAtPrice: 1499,
        costPrice: 280,
        stockWarehouse: 140,
        stockShop: 45
      },
      {
        id: 'var-b1-17p',
        sku: 'BLU-TG-IP17P',
        barcode: '890432100102',
        phoneModelId: 'ip-17-p',
        finish: 'HD Clear',
        price: 799,
        compareAtPrice: 1499,
        costPrice: 280,
        stockWarehouse: 110,
        stockShop: 38
      },
      {
        id: 'var-b1-16pm',
        sku: 'BLU-TG-IP16PM',
        barcode: '890432100103',
        phoneModelId: 'ip-16-pm',
        finish: 'HD Clear',
        price: 799,
        compareAtPrice: 1499,
        costPrice: 280,
        stockWarehouse: 85,
        stockShop: 22
      }
    ]
  },
  {
    id: 'prod-blueo-matte',
    title: 'Blueo Anti Glare Matte 3D Tempered Glass for iPhone',
    slug: 'blueo-anti-glare-matte-3d-tempered-glass',
    subtitle: 'Zero-reflection frosted gaming surface, silky smooth touch & anti-fingerprint',
    description: 'Engineered for mobile gamers and outdoor users, the Blueo Matte series uses micro-etching sandblast technology to eliminate all harsh reflections and sun glare while preserving vivid screen colors. Provides a velvet-smooth glide without catching sweat.',
    category: 'tempered-glass',
    accessoryBrand: 'Blueo',
    badge: '44% OFF',
    rank: 2,
    basePrice: 899,
    compareAtPrice: 1599,
    costPrice: 320,
    hsnCode: '70071900',
    gstRate: 18,
    rating: 4.8,
    reviewCount: 219,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
    ],
    compatibleModelIds: ['ip-17-pm', 'ip-17-p', 'ip-17', 'ip-17-air', 'ip-16-pm', 'ip-16-p', 'ip-16', 'ip-15-pm', 'sam-s25-u'],
    features: [
      'Anti-glare micro-etched surface for effortless outdoor viewing',
      'True silky touch optimized for competitive high-FPS gaming',
      'Hydrophobic and oleophobic sweat-resistant barrier',
      '3D contoured full-coverage curved edge'
    ],
    specs: {
      'Hardness': '9H Double Tempered',
      'Thickness': '0.35mm',
      'Finish': 'Frosted Matte Anti-Reflective',
      'Warranty': '6 Months Breakage Replacement'
    },
    material: 'Frosted Tempered Glass',
    status: 'active',
    optionsCount: 11,
    variants: [
      {
        id: 'var-b2-17pm',
        sku: 'BLU-MAT-IP17PM',
        barcode: '890432100201',
        phoneModelId: 'ip-17-pm',
        finish: 'Matte Gaming',
        price: 899,
        compareAtPrice: 1599,
        costPrice: 320,
        stockWarehouse: 90,
        stockShop: 25
      },
      {
        id: 'var-b2-16pm',
        sku: 'BLU-MAT-IP16PM',
        barcode: '890432100202',
        phoneModelId: 'ip-16-pm',
        finish: 'Matte Gaming',
        price: 899,
        compareAtPrice: 1599,
        costPrice: 320,
        stockWarehouse: 75,
        stockShop: 18
      }
    ]
  },
  {
    id: 'prod-magsafe-aeroshield',
    title: 'AeroShield Frosted MagSafe Shockproof Hybrid Armor Case',
    slug: 'aeroshield-frosted-magsafe-shockproof-hybrid-case',
    subtitle: 'N52 strong magnet ring, tactile anodized aluminum buttons & military drop test certified',
    description: 'Precision engineered with a translucent matte polycarbonate back and shock-absorbent TPU bumper corners. Embedded with 38 neodymium N52 magnets for rock-solid magnetic latching on car mounts, chargers, and wallet attachments.',
    category: 'back-cases',
    accessoryBrand: 'Gadget House Original',
    badge: 'BEST SELLER #3',
    rank: 3,
    basePrice: 999,
    compareAtPrice: 1699,
    costPrice: 380,
    hsnCode: '39269099',
    gstRate: 18,
    rating: 4.95,
    reviewCount: 489,
    images: [
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80'
    ],
    compatibleModelIds: ['ip-17-pm', 'ip-17-p', 'ip-17', 'ip-17-air', 'ip-16-pm', 'ip-16-p', 'ip-16', 'ip-15-pm', 'sam-s25-u', 'sam-s24-u', 'px-9-pro-xl'],
    features: [
      'Certified 10ft Military Drop Protection (MIL-STD 810G)',
      'Built-in 15W Qi2/MagSafe magnetic array with 1,500g holding force',
      'Independent clicky CNC aluminum alloy buttons',
      '1.3mm raised lip over camera and screen face'
    ],
    specs: {
      'Material': 'Bayer Matte Polycarbonate + Bayer TPU Bumper',
      'Magnet Type': 'N52 Neodymium Array',
      'Drop Rating': '10 Feet / 3 Meters',
      'MagSafe': 'Fully Compatible'
    },
    isMagSafe: true,
    material: 'Polycarbonate & TPU Hybrid',
    status: 'active',
    optionsCount: 14,
    variants: [
      {
        id: 'var-aero-black-17pm',
        sku: 'AERO-BLK-IP17PM',
        barcode: '890432100301',
        phoneModelId: 'ip-17-pm',
        colorName: 'Space Black',
        colorHex: '#1e2024',
        price: 999,
        compareAtPrice: 1699,
        costPrice: 380,
        stockWarehouse: 120,
        stockShop: 35
      },
      {
        id: 'var-aero-orange-17pm',
        sku: 'AERO-ORG-IP17PM',
        barcode: '890432100302',
        phoneModelId: 'ip-17-pm',
        colorName: 'Sunset Orange',
        colorHex: '#ff6600',
        price: 999,
        compareAtPrice: 1699,
        costPrice: 380,
        stockWarehouse: 65,
        stockShop: 19
      },
      {
        id: 'var-aero-titanium-17p',
        sku: 'AERO-TIT-IP17P',
        barcode: '890432100303',
        phoneModelId: 'ip-17-p',
        colorName: 'Desert Titanium',
        colorHex: '#8e8274',
        price: 999,
        compareAtPrice: 1699,
        costPrice: 380,
        stockWarehouse: 90,
        stockShop: 28
      }
    ]
  },
  {
    id: 'prod-camera-titanium',
    title: 'Aerospace Titanium Individual Lens Protector Set',
    slug: 'aerospace-titanium-lens-protector-set',
    subtitle: 'Corning Gorilla sapphire glass lens cap with individual titanium bezel',
    description: 'Shield each individual camera lens independently with aircraft-grade grade-5 titanium frame and AR anti-reflective coated sapphire crystal. Preserves 100% of iPhone and Galaxy night mode brilliance without flash halo flare.',
    category: 'camera-protectors',
    accessoryBrand: 'Gadget House Original',
    badge: '41% OFF',
    basePrice: 599,
    compareAtPrice: 999,
    costPrice: 180,
    hsnCode: '70071900',
    gstRate: 18,
    rating: 4.85,
    reviewCount: 164,
    images: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80'
    ],
    compatibleModelIds: ['ip-17-pm', 'ip-17-p', 'ip-16-pm', 'ip-16-p', 'ip-15-pm', 'ip-15-p', 'sam-s25-u', 'sam-s24-u'],
    features: [
      'Grade 5 aviation titanium ring matches phone natural finish',
      'AR anti-reflective layer stops night photo flash distortion',
      'Independent rings maintain compatibility with almost any case',
      'Easy push-and-pull applicator plate'
    ],
    specs: {
      'Frame': 'Aerospace Grade-5 Titanium',
      'Optics': 'Sapphire Crystal Glass',
      'Flash Flare Barrier': 'Anti-Reflective Black Ring',
      'Waterproof': 'IP68 Nano Seal'
    },
    material: 'Titanium & Sapphire Glass',
    status: 'active',
    optionsCount: 8,
    variants: [
      {
        id: 'var-cam-tit-17pm',
        sku: 'CAM-TIT-IP17PM',
        barcode: '890432100401',
        phoneModelId: 'ip-17-pm',
        colorName: 'Natural Titanium',
        colorHex: '#9ca3af',
        price: 599,
        compareAtPrice: 999,
        costPrice: 180,
        stockWarehouse: 150,
        stockShop: 50
      },
      {
        id: 'var-cam-blk-17pm',
        sku: 'CAM-BLK-IP17PM',
        barcode: '890432100402',
        phoneModelId: 'ip-17-pm',
        colorName: 'Black Titanium',
        colorHex: '#18181b',
        price: 599,
        compareAtPrice: 999,
        costPrice: 180,
        stockWarehouse: 110,
        stockShop: 40
      }
    ]
  },
  {
    id: 'prod-gan-65w',
    title: 'VoltPulse 65W GaN III Dual USB-C + USB-A Turbo Wall Charger',
    slug: 'voltpulse-65w-gan-dual-usb-c-fast-charger',
    subtitle: 'GaN III semiconductor, PD 3.0 / PPS fast charging for phones, tablets & MacBooks',
    description: 'Compact pocket-sized 65W GaN III fast charger powers your iPhone or Galaxy from 0% to 60% in just 28 minutes. Intelligent power distribution lets you simultaneously fast charge your phone and wireless earbuds.',
    category: 'smart-gadgets',
    accessoryBrand: 'VoltPulse',
    badge: '35% OFF',
    basePrice: 1499,
    compareAtPrice: 2299,
    costPrice: 650,
    hsnCode: '85044030',
    gstRate: 18,
    rating: 4.9,
    reviewCount: 310,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80'
    ],
    compatibleModelIds: ['ip-17-pm', 'ip-17-p', 'ip-17', 'ip-17-air', 'ip-16-pm', 'ip-16-p', 'ip-16', 'sam-s25-u', 'sam-s25', 'px-9-pro-xl', 'op-13'],
    features: [
      'Gallium Nitride (GaN III) chip stays 30% cooler',
      'Dual USB-C Power Delivery 3.0 + 1x USB-A QC 4+',
      'PPS 45W super fast charging support for Samsung Galaxy',
      'Comprehensive multi-protection against overvoltage & overheating'
    ],
    specs: {
      'Total Output': '65W Max',
      'Technology': 'GaN III Fast Power',
      'Ports': '2x USB Type-C, 1x USB-A',
      'Dimensions': '48 x 36 x 32 mm'
    },
    material: 'Flame Retardant Polycarbonate',
    status: 'active',
    optionsCount: 2,
    variants: [
      {
        id: 'var-gan-matte-black',
        sku: 'GAN-65W-BLK',
        barcode: '890432100501',
        colorName: 'Matte Obsidian',
        colorHex: '#18181b',
        price: 1499,
        compareAtPrice: 2299,
        costPrice: 650,
        stockWarehouse: 80,
        stockShop: 24
      },
      {
        id: 'var-gan-white',
        sku: 'GAN-65W-WHT',
        barcode: '890432100502',
        colorName: 'Arctic White',
        colorHex: '#ffffff',
        price: 1499,
        compareAtPrice: 2299,
        costPrice: 650,
        stockWarehouse: 60,
        stockShop: 18
      }
    ]
  },
  {
    id: 'prod-braided-cable',
    title: 'ArmorCore 240W Braided USB-C to USB-C Fast Cable (2M)',
    slug: 'armorcore-240w-braided-usb-c-cable-2m',
    subtitle: 'Military-grade Kevlar braided jacket, 480Mbps data transfer, e-Marker smart chip',
    description: 'Built to survive over 35,000 extreme bends. Equipped with certified E-Marker chip that safely regulates up to 48V/5A (240W) power flow for high-wattage charging without device stress.',
    category: 'accessories',
    accessoryBrand: 'ArmorCore',
    badge: 'HOT DEAL',
    basePrice: 499,
    compareAtPrice: 899,
    costPrice: 140,
    hsnCode: '85444299',
    gstRate: 18,
    rating: 4.88,
    reviewCount: 420,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80'
    ],
    compatibleModelIds: ['ip-17-pm', 'ip-17-p', 'ip-17', 'ip-17-air', 'ip-16-pm', 'ip-16-p', 'ip-16', 'ip-15-pm', 'ip-15', 'sam-s25-u', 'sam-s24-u', 'px-9-pro-xl', 'op-13'],
    features: [
      'Supports up to 240W PD3.1 Ultra-Fast Power Delivery',
      'Reinforced bulletproof aramid fiber ballistic weave',
      'Alloy anodized connector collars resist breaking',
      'Integrated leather organizing cable tie strap'
    ],
    specs: {
      'Length': '2 Meters (6.6 ft)',
      'Power Rating': '240W (48V / 5A Max)',
      'Data Speed': '480 Mbps',
      'Durability': '35,000+ Bend Cycle Tested'
    },
    material: 'Double-Braided Nylon & Kevlar',
    status: 'active',
    optionsCount: 3,
    variants: [
      {
        id: 'var-cable-blk-2m',
        sku: 'ARM-CBL-BLK2M',
        barcode: '890432100601',
        colorName: 'Midnight Orange Weave',
        colorHex: '#ff6600',
        price: 499,
        compareAtPrice: 899,
        costPrice: 140,
        stockWarehouse: 200,
        stockShop: 60
      }
    ]
  },
  {
    id: 'prod-mag-car-mount',
    title: 'MagLock Wireless Fast Charging Car Mount & Air Vent Clip',
    slug: 'maglock-wireless-fast-charging-car-mount',
    subtitle: 'N52 ring alignment, 15W Qi wireless charging & 360-degree ball joint pivot',
    description: 'Instant one-handed snap mount with powerful neodymium magnets and precision 15W Qi fast charging. The steel-core triangular clamp securely locks onto any horizontal or vertical air vent without shaking or rattling on bumpy roads.',
    category: 'accessories',
    accessoryBrand: 'Gadget House Original',
    badge: 'TOP PICK',
    basePrice: 1299,
    compareAtPrice: 2199,
    costPrice: 520,
    hsnCode: '85044030',
    gstRate: 18,
    rating: 4.82,
    reviewCount: 153,
    images: [
      'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    compatibleModelIds: ['ip-17-pm', 'ip-17-p', 'ip-17', 'ip-16-pm', 'ip-16-p', 'ip-15-pm', 'sam-s25-u'],
    features: [
      'Auto-alignment with MagSafe magnetic array',
      '15W Qi fast wireless inductive coil',
      'All-metal twist lock hook vent clamp that never slips',
      '360° rotational pivot for landscape GPS and portrait calling'
    ],
    specs: {
      'Mount Type': 'Twist-Lock Air Vent Hook Clamp',
      'Charging Power': '15W / 10W / 7.5W Qi Smart',
      'Magnetic Hold': '1,400g Holding Force',
      'Weight': '112 grams'
    },
    isMagSafe: true,
    material: 'Aviation Aluminum & Soft Silicone Pad',
    status: 'active',
    optionsCount: 2,
    variants: [
      {
        id: 'var-mount-blk',
        sku: 'MAG-MOUNT-BLK',
        barcode: '890432100701',
        colorName: 'Space Grey Matte',
        colorHex: '#27272a',
        price: 1299,
        compareAtPrice: 2199,
        costPrice: 520,
        stockWarehouse: 70,
        stockShop: 20
      }
    ]
  },
  {
    id: 'prod-3in1-foldable-dock',
    title: 'TriFold 3-in-1 Magnetic Wireless Charging Travel Station',
    slug: 'trifold-3-in-1-magnetic-wireless-charging-station',
    subtitle: 'Charge Phone (15W), Watch (5W), and AirPods (5W) concurrently in one palm-sized fold',
    description: 'The ultimate travel companion. Folds flat into a compact leather wallet size, then unfolds into an angled floating stand for your iPhone StandBy Mode, Apple Watch Nightstand, and wireless earbuds.',
    category: 'smart-gadgets',
    accessoryBrand: 'VoltPulse',
    badge: 'NEW ARRIVAL',
    basePrice: 2299,
    compareAtPrice: 3599,
    costPrice: 950,
    hsnCode: '85044030',
    gstRate: 18,
    rating: 4.94,
    reviewCount: 97,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80'
    ],
    compatibleModelIds: ['ip-17-pm', 'ip-17-p', 'ip-17', 'ip-16-pm', 'ip-16-p', 'ip-15-pm', 'sam-s25-u'],
    features: [
      'Simultaneous 3-device fast charging without cable clutter',
      'Folds flat to 18mm thickness for effortless travel',
      'Support Apple StandBy Mode at 60° ergonomic viewing angle',
      'Foreign object detection & smart ambient status LED'
    ],
    specs: {
      'Total Output': '25W Max Distributed',
      'Compatibility': 'Qi2 MagSafe Phone, Apple Watch, Qi Earbuds',
      'Folded Size': '82 x 75 x 18 mm',
      'Cable Included': '1.5M Braided Type-C to C'
    },
    isMagSafe: true,
    material: 'Anodized Aluminum Alloy & Vegan Leather',
    status: 'active',
    optionsCount: 2,
    variants: [
      {
        id: 'var-dock-midnight',
        sku: 'TRI-DOCK-BLK',
        barcode: '890432100801',
        colorName: 'Midnight Black',
        colorHex: '#18181b',
        price: 2299,
        compareAtPrice: 3599,
        costPrice: 950,
        stockWarehouse: 50,
        stockShop: 15
      }
    ]
  }
];

export const COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 499,
    description: 'Get 10% OFF on your first purchase over ₹499',
    active: true
  },
  {
    code: 'GADGET50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 299,
    description: 'Flat ₹50 OFF on orders above ₹299',
    active: true
  },
  {
    code: 'FESTIVE20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 1299,
    description: 'Grand festive discount: 20% OFF on premium gear',
    active: true
  }
];

export const INITIAL_STAFF: StaffUser[] = [
  { id: 'usr-1', name: 'Rajesh Sharma', email: 'owner@gadgethouse.in', role: 'Owner', active: true, lastLogin: 'Just now' },
  { id: 'usr-2', name: 'Priya Patnaik', email: 'priya@gadgethouse.in', role: 'Manager', active: true, lastLogin: '2 hours ago' },
  { id: 'usr-3', name: 'Amit Sen', email: 'amit@gadgethouse.in', role: 'Cashier', active: true, lastLogin: '10 mins ago' },
  { id: 'usr-4', name: 'Sunil Nayak', email: 'sunil@gadgethouse.in', role: 'Inventory', active: true, lastLogin: 'Yesterday' },
  { id: 'usr-5', name: 'Kavita Das', email: 'support@gadgethouse.in', role: 'Support', active: true, lastLogin: '3 hours ago' }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1042',
    orderNumber: 'GH-2026-1042',
    channel: 'online',
    createdAt: '2026-11-13 11:45',
    customer: {
      name: 'Rohan Mehra',
      phone: '+91 98765 43210',
      email: 'rohan.mehra@gmail.com'
    },
    items: [
      {
        productId: 'prod-blueo-clear',
        productTitle: 'Blueo Dust Proof HD 2.5D Clear Tempered Glass for iPhone',
        variantSku: 'BLU-TG-IP17PM',
        phoneModelName: 'iPhone 17 Pro Max',
        price: 799,
        quantity: 1,
        hsnCode: '70071900',
        gstRate: 18,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80'
      },
      {
        productId: 'prod-magsafe-aeroshield',
        productTitle: 'AeroShield Frosted MagSafe Shockproof Hybrid Armor Case',
        variantSku: 'AERO-BLK-IP17PM',
        phoneModelName: 'iPhone 17 Pro Max',
        color: 'Space Black',
        price: 999,
        quantity: 1,
        hsnCode: '39269099',
        gstRate: 18,
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 1798,
    discount: 179.8,
    couponCode: 'WELCOME10',
    shipping: 0,
    taxCGST: 123.4,
    taxSGST: 123.4,
    taxIGST: 0,
    total: 1618.2,
    status: 'Paid',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    shippingAddress: {
      fullName: 'Rohan Mehra',
      phone: '+91 98765 43210',
      addressLine1: 'Flat 402, Royal Palms, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      country: 'India'
    },
    trackingNumber: 'SHIP-99412-IN'
  },
  {
    id: 'ord-1041',
    orderNumber: 'POS-2026-1041',
    channel: 'POS',
    createdAt: '2026-11-13 11:20',
    customer: {
      name: 'Walk-in Customer (Deepak)',
      phone: '+91 94371 88200'
    },
    items: [
      {
        productId: 'prod-camera-titanium',
        productTitle: 'Aerospace Titanium Individual Lens Protector Set',
        variantSku: 'CAM-TIT-IP17PM',
        phoneModelName: 'iPhone 17 Pro Max',
        price: 599,
        quantity: 1,
        hsnCode: '70071900',
        gstRate: 18,
        image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80'
      }
    ],
    subtotal: 599,
    discount: 0,
    shipping: 0,
    taxCGST: 45.68,
    taxSGST: 45.68,
    taxIGST: 0,
    total: 599,
    status: 'Delivered',
    paymentMethod: 'Cash',
    paymentStatus: 'Paid'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  { id: 'log-1', timestamp: '2026-11-13 11:45:02', userName: 'Rajesh Sharma', role: 'Owner', action: 'System Config', details: 'Updated Razorpay webhook key' },
  { id: 'log-2', timestamp: '2026-11-13 11:20:18', userName: 'Amit Sen', role: 'Cashier', action: 'POS Bill Generated', details: 'Bill #POS-2026-1041 completed for ₹599 (Cash)' },
  { id: 'log-3', timestamp: '2026-11-13 10:15:00', userName: 'Amit Sen', role: 'Cashier', action: 'POS Shift Opened', details: 'Started shift with opening cash float ₹2,000' },
  { id: 'log-4', timestamp: '2026-11-13 09:30:12', userName: 'Sunil Nayak', role: 'Inventory', action: 'Stock Transfer', details: 'Transferred 25x BLU-TG-IP17PM from Warehouse to Shop Counter' }
];

