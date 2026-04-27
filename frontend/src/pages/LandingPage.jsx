import React, { useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, TrendingUp, ShieldCheck, BarChart3, ArrowRight, CheckCircle2, HeartHandshake, Smartphone } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/UI/Button';
import ParticleBackground from '../components/UI/ParticleBackground';

const LandingPage = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const advantages = [
    {
      icon: <TrendingUp size={40} className="mb-4" />,
      title: 'Intuitivo',
      description: 'Al ser un sistema sencillo y pensado para emprendedores, será facilísimo adaptarse a este nuevo control.'
    },
    {
      icon: <Smartphone size={40} className="mb-4" />,
      title: 'Multiplataforma',
      description: 'Accede a tu información financiera desde cualquier dispositivo, ya sea tu computadora, tablet o celular.'
    },
    {
      icon: <BarChart3 size={40} className="mb-4" />,
      title: 'Accesible',
      description: 'Olvídate del software empresarial costoso. Te brindamos herramientas premium sin desangrar tu capital.'
    },
    {
      icon: <ShieldCheck size={40} className="mb-4" />,
      title: 'Seguro',
      description: 'Tu información financiera está encriptada y protegida bajo los más altos estándares de la industria.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#0a0e1a] text-white font-sans relative overflow-x-hidden selection:bg-[var(--accent-primary)] selection:text-white">
      
      {/* Interactive Particle Background */}
      <ParticleBackground />
      
      {/* Static Glow Effects for depth */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600 opacity-[0.03] blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600 opacity-[0.03] blur-[150px] pointer-events-none z-0"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 w-full flex justify-between items-center p-4 sm:p-6 md:px-12 z-50 bg-[#0a0e1a]/85 backdrop-blur-md border-b border-[rgba(59,130,246,0.2)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src="/logo.png" alt="CashInc Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
            <span className="text-xl sm:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              CashInc
            </span>
          </div>
          
          <nav className="hidden lg:flex gap-2 text-sm font-medium text-gray-300">
            <a href="#que-es" className="nav-glow-link">¿Qué es CashInc?</a>
            <a href="#pymes" className="nav-glow-link">Las PyMEs</a>
            <a href="#ventajas" className="nav-glow-link">Ventajas</a>
          </nav>

          <div className="flex gap-2 sm:gap-3 items-center">
            <Button onClick={() => navigate('/login')} variant="ghost" className="hidden md:flex hover:bg-white/5 rounded-full px-6 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:border-cyan-400/40 transition-all">
              Ingresar
            </Button>
            <Button onClick={() => navigate('/login', { state: { register: true } })} className="flex items-center gap-1 sm:gap-2 !rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] border-none px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 text-sm sm:text-base transition-all hover:scale-105">
              Empezar ya <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 pt-8 sm:pt-10">
          <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.1)] text-blue-400 text-xs sm:text-sm font-bold tracking-wide animate-fade-in backdrop-blur-md">
            POTENCIA TU NEGOCIO HOY
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4 sm:mb-6 max-w-4xl leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Tu herramienta financiera <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">por excelencia</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto animate-slide-up leading-relaxed px-2 sm:px-0" style={{ animationDelay: '0.2s' }}>
            Adéntrate en el mejor gestor económico y de activos para tu PyME. Olvídate del estrés financiero y toma decisiones basadas en datos reales.
          </p>
          
          <Button onClick={() => navigate('/login', { state: { register: true } })} size="lg" className="px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-slide-up w-full sm:w-auto" style={{ animationDelay: '0.3s' }}>
            Aprender más
          </Button>
        </section>

        {/* Info Boxes Section */}
        <section id="que-es" className="px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">¿Qué es CashInc?</h2>
          
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-[#111827] border border-gray-800 rounded-[2rem] sm:rounded-3xl p-6 sm:p-10 neon-hover shadow-lg cursor-default">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-400 border-b border-gray-800 pb-3 sm:pb-4">
                El control total de tu empresa
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-300">
                <li className="flex items-start sm:items-center gap-3">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5 sm:mt-0" size={20} />
                  <span>Confiable: Tus datos siempre exactos.</span>
                </li>
                <li className="flex items-start sm:items-center gap-3">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5 sm:mt-0" size={20} />
                  <span>Accesible: Costos diseñados para pequeños negocios.</span>
                </li>
                <li className="flex items-start sm:items-center gap-3">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5 sm:mt-0" size={20} />
                  <span>Rápido: Generación de reportes al instante.</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#111827] border border-gray-800 rounded-[2rem] sm:rounded-3xl p-6 sm:p-10 neon-hover shadow-lg cursor-default">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-cyan-400 border-b border-gray-800 pb-3 sm:pb-4">
                Ideal para usted porque...
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-300">
                <li className="flex items-start sm:items-center gap-3">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5 sm:mt-0" size={20} />
                  <span>Es increíblemente fácil de usar, sin tecnicismos.</span>
                </li>
                <li className="flex items-start sm:items-center gap-3">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5 sm:mt-0" size={20} />
                  <span>Mantiene la visibilidad de lo que entra y sale.</span>
                </li>
                <li className="flex items-start sm:items-center gap-3">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5 sm:mt-0" size={20} />
                  <span>Calcula la depreciación de sus herramientas solo.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* PyMEs Section (El Problema y la Misión) */}
        <section id="pymes" className="w-full relative py-16 sm:py-24 my-6 sm:my-10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a] via-[#0a0e1a]/90 to-[#0a0e1a]/70"></div>
          
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center gap-10 sm:gap-16">
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">El Corazón de la Economía: <span className="text-blue-400">Las PyMEs</span></h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                Las pequeñas y medianas empresas son el motor del mundo. Sin embargo, <strong>la falta de control económico</strong> es la causa número uno por la que el 80% no sobrevive sus primeros años.
              </p>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                El caos de no saber cuánto valen realmente tus activos, qué herramientas se están depreciando o cuál es tu flujo de caja real, genera una ceguera mortal para el negocio.
              </p>
            </div>
            
            <div className="w-full md:w-1/2 bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-[2rem] sm:rounded-3xl shadow-2xl">
              <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <HeartHandshake className="text-red-400" size={32} />
                <h3 className="text-xl sm:text-2xl font-bold">Nuestro Propósito</h3>
              </div>
              <p className="text-gray-200 text-base sm:text-lg leading-relaxed text-center md:text-left">
                Queremos democratizar la gestión financiera. Hemos construido CashInc para que las herramientas analíticas de nivel corporativo estén al alcance de la pequeña empresa. <strong>Queremos ayudarte a crecer, dándote la claridad mental y financiera que mereces.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Advantages Section */}
        <section id="ventajas" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Ventajas de CashInc</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv, index) => (
              <div 
                key={index} 
                className="group relative h-64 perspective-1000"
              >
                {/* Card Container */}
                <div className="w-full h-full absolute transition-all duration-500 preserve-3d group-hover:rotate-y-180 cursor-pointer">
                  
                  {/* Front of card */}
                  <div className="absolute w-full h-full backface-hidden bg-[#111827]/80 backdrop-blur-md border border-[rgba(255,255,255,0.05)] rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-lg">
                    <div className="text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                      {adv.icon}
                    </div>
                    <h3 className="text-2xl font-bold">{adv.title}</h3>
                  </div>
                  
                  {/* Back of card (Hover reveal) */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-xl border border-blue-400/30 rounded-2xl flex items-center justify-center p-8 text-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    <p className="text-white text-lg leading-relaxed font-medium">
                      {adv.description}
                    </p>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Footer */}
        <footer className="border-t border-gray-800 py-12 mt-12 bg-black/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <img src="/logo.png" alt="CashInc Logo" className="w-14 h-14 object-contain mx-auto mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            <p className="text-2xl font-semibold text-gray-300 mb-2">
              El futuro de tu empresa, <span className="text-blue-400">asegurado hoy, mañana y siempre.</span>
            </p>
            <p className="text-gray-600 text-sm mt-8">© 2026 CashInc. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
