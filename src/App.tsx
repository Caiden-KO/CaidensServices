import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Pricing from '@/components/Pricing';
import QuoteForm from '@/components/QuoteForm';
import CouponManager from '@/components/CouponManager';
import Checkout from '@/components/Checkout';

function App() {
  const [page, setPage] = useState('home');
  const [selectedPlanId, setSelectedPlanId] = useState('professional');

  const handleNavigate = (target: string) => {
    const homeSections = ['services', 'pricing', 'quotes', 'home'];
    if (homeSections.includes(target)) {
      const wasOnHome = homeSections.includes(page);
      setPage('home');
      setTimeout(() => {
        if (target === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }, wasOnHome ? 0 : 100);
    } else {
      setPage(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const renderPage = () => {
    if (page === 'coupons') return <CouponManager />;
    if (page === 'checkout') return <Checkout selectedPlanId={selectedPlanId} onNavigate={handleNavigate} />;

    return (
      <>
        <Hero onNavigate={handleNavigate} />
        <Services />
        <Pricing onNavigate={handleNavigate} onSelectPlan={handleSelectPlan} />
        <QuoteForm />
      </>
    );
  };

  const navPage = page === 'coupons' || page === 'checkout' ? page : page === 'home' ? 'home' : page;

  return (
    <div className="min-h-screen bg-pink-50">
      <Navbar currentPage={navPage} onNavigate={handleNavigate} />
      <main>{renderPage()}</main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
