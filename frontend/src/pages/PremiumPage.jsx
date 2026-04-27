import React, { useState, useContext } from 'react';
import { CheckCircle2, Zap, Star, Shield, ArrowRight } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import PaymentModal from '../components/UI/PaymentModal';

const PlanCard = ({ title, price, description, features, icon: Icon, isPopular = false, t, onSelect }) => {
  return (
    <div 
      className={`relative flex flex-col p-8 rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isPopular 
          ? 'bg-gradient-to-b from-[var(--accent-tertiary)] to-[var(--accent-primary)] shadow-[0_0_40px_rgba(139,92,246,0.3)] scale-100 lg:scale-105 z-10 hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] border border-[rgba(255,255,255,0.2)]' 
          : 'bg-[var(--bg-glass)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.1)] hover:-translate-y-2'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[var(--accent-primary)] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
          {t('premium.mostPopular')}
        </div>
      )}
      
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${isPopular ? 'bg-white/20 text-white' : 'bg-[var(--bg-primary)] text-[var(--accent-primary)]'}`}>
        <Icon size={24} />
      </div>

      <h3 className={`text-xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-white'}`}>{title}</h3>
      <div className="flex items-baseline mb-4">
        <span className={`text-4xl font-extrabold ${isPopular ? 'text-white' : 'text-white'}`}>${price}</span>
        <span className={`text-sm ml-2 ${isPopular ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>{t('premium.perMonth')}</span>
      </div>
      
      <p className={`text-sm mb-8 ${isPopular ? 'text-white/90' : 'text-[var(--text-secondary)]'}`}>
        {description}
      </p>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <CheckCircle2 
              size={18} 
              className={`mr-3 shrink-0 mt-0.5 ${isPopular ? 'text-white' : 'text-[var(--accent-primary)]'}`} 
            />
            <span className={`text-sm ${isPopular ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {price === "0" ? (
        <div className="w-full py-4 rounded-xl font-semibold flex items-center justify-center bg-[rgba(255,255,255,0.05)] text-[var(--status-success)] border border-[rgba(16,185,129,0.2)] cursor-default">
          ✓ Ya tienes este plan
        </div>
      ) : (
        <button 
          onClick={() => onSelect && onSelect({ title, price })}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 ${
            isPopular 
              ? 'bg-white text-[var(--accent-primary)] hover:bg-opacity-90 shadow-lg' 
              : 'bg-[var(--bg-primary)] text-white hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)]'
          }`}
        >
          {t('premium.startNow')} <ArrowRight size={18} className="ml-2" />
        </button>
      )}
    </div>
  );
};

const PremiumPage = () => {
  const { t } = useContext(LanguageContext);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      title: t('premium.basicTitle'),
      price: "0",
      description: t('premium.basicDesc'),
      icon: Shield,
      features: [
        t('premium.basicFeat1'),
        t('premium.basicFeat2'),
        t('premium.basicFeat3'),
        t('premium.basicFeat4')
      ]
    },
    {
      title: t('premium.proTitle'),
      price: "29",
      description: t('premium.proDesc'),
      icon: Zap,
      isPopular: true,
      features: [
        t('premium.proFeat1'),
        t('premium.proFeat2'),
        t('premium.proFeat3'),
        t('premium.proFeat4')
      ]
    },
    {
      title: t('premium.entTitle'),
      price: "99",
      description: t('premium.entDesc'),
      icon: Star,
      features: [
        t('premium.entFeat1'),
        t('premium.entFeat2'),
        t('premium.entFeat3'),
        t('premium.entFeat4')
      ]
    }
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-12 px-4 relative">
      
      {/* Background glow effects specific to this page */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-tertiary)] opacity-10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-primary)] opacity-10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="text-center max-w-2xl mx-auto mb-16 relative z-10 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
          {t('premium.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-tertiary)] to-[var(--accent-secondary)]">{t('premium.highlight')}</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)]">
          {t('premium.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
        {plans.map((plan, index) => (
          <PlanCard key={index} {...plan} t={t} onSelect={setSelectedPlan} />
        ))}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        planName={selectedPlan?.title || ''}
        planPrice={selectedPlan?.price || '0'}
      />
    </div>
  );
};

export default PremiumPage;
