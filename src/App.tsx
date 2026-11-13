import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminProvider } from './context/AdminContext';

// Navigation & Structure
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { Navbar } from './components/common/Navbar';
import { SubNavbar } from './components/common/SubNavbar';
import { Footer } from './components/common/Footer';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { StyleGuideModal } from './components/common/StyleGuideModal';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { AuthModal } from './components/common/AuthModal';

// Award-Level Homepage Sections (Sections 1 to 11)
import { HeroSection } from './components/storefront/HeroSection';
import { MarqueeStrip } from './components/storefront/MarqueeStrip';
import { BentoCategoryGrid } from './components/storefront/BentoCategoryGrid';
import { FindYourFitSection } from './components/storefront/FindYourFitSection';
import { BestSellersCarousel } from './components/storefront/BestSellersCarousel';
import { FeatureStorySection } from './components/storefront/FeatureStorySection';
import { FlashDealBanner } from './components/storefront/FlashDealBanner';
import { DropTestCard } from './components/storefront/DropTestCard';
import { ReviewsWall } from './components/storefront/ReviewsWall';
import { BrandPromiseBand } from './components/storefront/BrandPromiseBand';
import { NewsletterSection } from './components/storefront/NewsletterSection';

// Catalog & Modals
import { ProductListingPage } from './components/storefront/ProductListingPage';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { OrderTrackingModal } from './components/storefront/OrderTrackingModal';

// Admin & POS Views (Hidden from normal shoppers)
import { AdminLayout } from './components/admin/AdminLayout';
import { POSBilling } from './components/pos/POSBilling';

const MainContent: React.FC = () => {
  const { viewMode, isStaff, currentUser, setViewMode } = useStore();
  const [isStyleGuideOpen, setIsStyleGuideOpen] = useState(false);

  // If in admin view mode - Cashiers cannot access Admin Dashboard
  if (viewMode === 'admin') {
    if (!isStaff || currentUser?.role === 'Cashier') {
      return (
        <div className="min-h-screen bg-[#07090F] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0E131D] border border-dark-border rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Dashboard Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentUser?.role === 'Cashier'
                ? 'Cashier accounts are restricted to the POS Billing Counter and cannot access store administration.'
                : 'The Admin Dashboard is only accessible by verified store management. Customer accounts cannot access staff portals.'}
            </p>
            <div className="flex gap-2">
              {currentUser?.role === 'Cashier' && (
                <button
                  onClick={() => setViewMode('pos')}
                  className="flex-1 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition shadow-lg"
                >
                  Go to POS Counter
                </button>
              )}
              <button
                onClick={() => setViewMode('storefront')}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white border border-dark-border rounded-xl text-xs font-bold transition shadow-lg"
              >
                Back to Storefront
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <AdminLayout />;
  }

  // If in POS view mode - Restricted to store billing staff (Owner, Manager, Cashier)
  if (viewMode === 'pos') {
    const canAccessPos = isStaff && ['Owner', 'Manager', 'Cashier'].includes(currentUser?.role || '');
    if (!canAccessPos) {
      return (
        <div className="min-h-screen bg-[#07090F] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0E131D] border border-dark-border rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">POS Terminal Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The POS billing counter is restricted to authorized billing cashiers and managers.
            </p>
            <button
              onClick={() => setViewMode('storefront')}
              className="w-full py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold transition shadow-lg"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      );
    }
    return <POSBilling />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07090F] dark:bg-[#07090F] light:bg-[#F6F3EE] text-slate-100 dark:text-slate-100 light:text-slate-900 selection:bg-brand selection:text-white pb-16 md:pb-0 font-sans transition-colors duration-300">
      {/* Top Global Bars */}
      <AnnouncementBar />
      <Navbar onOpenStyleGuide={() => setIsStyleGuideOpen(true)} />
      <SubNavbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {viewMode === 'storefront' ? (
          <>
            {/* 1. Hero Section */}
            <HeroSection />

            {/* 2. Bento Grid "Shop by Category" */}
            <BentoCategoryGrid />

            {/* 4. Find Your Fit Silhouette Workbench */}
            <FindYourFitSection />

            {/* 5. Best Sellers Scroll-Snap Carousel */}
            <BestSellersCarousel />

            {/* 6. Feature Story (Scroll-Pinned / Interactive Hotspots) */}
            <FeatureStorySection />

            {/* 7. Flash Deal Banner */}
            <FlashDealBanner />

            {/* 8. Drop-Test Card */}
            <div id="drop-test">
              <DropTestCard />
            </div>

            {/* 9. Reviews Wall (Masonry Grid) */}
            <ReviewsWall />

            {/* 10. Brand Promise Band */}
            <BrandPromiseBand />

            {/* 11. Newsletter CTA */}
            <NewsletterSection />
          </>
        ) : (
          <ProductListingPage />
        )}
      </main>

      {/* 12. Footer */}
      <Footer />

      {/* Mobile Sticky Navigation (390px viewports) */}
      <MobileBottomBar 
        onOpenSearch={() => {
          // Trigger Cmd+K search event
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
        }} 
        onOpenStyleGuide={() => setIsStyleGuideOpen(true)}
      />

      {/* Global Modals & Overlays */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <AuthModal />
      <PWAInstallPrompt />
      <WhatsAppButton />
      <StyleGuideModal isOpen={isStyleGuideOpen} onClose={() => setIsStyleGuideOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <AdminProvider>
        <MainContent />
      </AdminProvider>
    </StoreProvider>
  );
}

export default App;
