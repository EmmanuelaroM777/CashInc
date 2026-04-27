import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, X, ChevronRight } from 'lucide-react';
import { LanguageContext } from '../../context/LanguageContext';

const Chatbot = () => {
  const { t } = useContext(LanguageContext);

  const getChatNodes = () => ({
    inicio: {
      text: t('chatbot.inicio'),
      options: [
        { label: t('chatbot.optConceptos'), next: "conceptos" },
        { label: t('chatbot.optGuia'), next: "guia" },
        { label: t('chatbot.optEquipo'), next: "equipo" }
      ]
    },
    conceptos: {
      text: t('chatbot.conceptosTitle'),
      options: [
        { label: t('chatbot.optRoi'), next: "roi" },
        { label: t('chatbot.optDepr'), next: "depreciacion" },
        { label: t('chatbot.optVan'), next: "van" },
        { label: t('chatbot.optBack'), next: "inicio" }
      ]
    },
    roi: {
      text: t('chatbot.roiText'),
      options: [
        { label: t('chatbot.optOtherConcepts'), next: "conceptos" },
        { label: t('chatbot.optBack'), next: "inicio" }
      ]
    },
    depreciacion: {
      text: t('chatbot.deprText'),
      options: [
        { label: t('chatbot.optOtherConcepts'), next: "conceptos" },
        { label: t('chatbot.optBack'), next: "inicio" }
      ]
    },
    van: {
      text: t('chatbot.vanText'),
      options: [
        { label: t('chatbot.optOtherConcepts'), next: "conceptos" },
        { label: t('chatbot.optBack'), next: "inicio" }
      ]
    },
    guia: {
      text: t('chatbot.guiaTitle'),
      options: [
        { label: t('chatbot.optRegister'), next: "guia_activo" },
        { label: t('chatbot.optAlerts'), next: "guia_alertas" },
        { label: t('chatbot.optReports'), next: "guia_reportes" },
        { label: t('chatbot.optBack'), next: "inicio" }
      ]
    },
    guia_activo: {
      text: t('chatbot.guiaActivoText'),
      options: [
        { label: t('chatbot.optMoreGuides'), next: "guia" },
        { label: t('chatbot.optBack'), next: "inicio" }
      ]
    },
    guia_alertas: {
      text: t('chatbot.guiaAlertasText'),
      options: [
        { label: t('chatbot.optMoreGuides'), next: "guia" },
        { label: t('chatbot.optBack'), next: "inicio" }
      ]
    },
    guia_reportes: {
      text: t('chatbot.guiaReportesText'),
      options: [
        { label: t('chatbot.optMoreGuides'), next: "guia" },
        { label: t('chatbot.optBack'), next: "inicio" }
      ]
    },
    equipo: {
      text: t('chatbot.equipoText'),
      options: [
        { label: t('chatbot.optBack'), next: "inicio" }
      ]
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const CHAT_NODES = getChatNodes();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: CHAT_NODES.inicio.text, options: CHAT_NODES.inicio.options }
  ]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleOptionClick = (option) => {
    const userMessage = { id: Date.now(), sender: 'user', text: option.label };
    
    const newMessages = [...messages];
    if (newMessages[newMessages.length - 1].sender === 'bot') {
      newMessages[newMessages.length - 1].options = [];
    }

    // If going back to inicio, respond instantly
    if (option.next === 'inicio') {
      const nextNode = CHAT_NODES[option.next];
      setMessages([...newMessages, userMessage, { id: Date.now() + 1, sender: 'bot', text: nextNode.text, options: nextNode.options }]);
      return;
    }

    // Otherwise show loading animation for 5s
    const loadingId = Date.now() + 1;
    setMessages([...newMessages, userMessage, { id: loadingId, sender: 'bot', isLoading: true }]);

    setTimeout(() => {
      const nextNode = CHAT_NODES[option.next];
      if (nextNode) {
        setMessages(prev => 
          prev
            .filter(m => m.id !== loadingId)
            .concat({ id: Date.now(), sender: 'bot', text: nextNode.text, options: nextNode.options })
        );
      }
    }, 5000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all duration-300 z-50 flex items-center justify-center ${isOpen ? 'rotate-90 opacity-0 pointer-events-none' : 'rotate-0 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] bg-[var(--bg-secondary)]/90 backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl flex flex-col z-50 transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[var(--bg-primary)]/50 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white shadow-[0_2px_10px_rgba(59,130,246,0.3)]">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">EMAI</h3>
              <div className="flex items-center text-[10px] text-[var(--status-success)]">
                <span className="w-2 h-2 rounded-full bg-[var(--status-success)] mr-1 animate-pulse"></span>
                {t('chatbot.online')}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-[var(--text-secondary)] hover:text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Loading Animation */}
              {msg.isLoading ? (
                <div className="max-w-[85%] p-3 rounded-2xl rounded-tl-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)]">
                  <div className="generating-wrapper">
                    {"Generando".split("").map((letter, i) => (
                      <span key={i} className="gen-letter" style={{ animationDelay: `${i * 0.105}s` }}>
                        {letter}
                      </span>
                    ))}
                    <div className="gen-scanner" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Message Bubble */}
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap text-sm shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-[var(--accent-primary)] text-white rounded-tr-none' 
                        : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] text-[var(--text-primary)] rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Options */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="mt-3 flex flex-col items-end gap-2 w-full animate-fade-in pr-2">
                      {msg.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleOptionClick(opt)}
                          className="text-xs text-right py-2 px-4 rounded-full bg-[rgba(59,130,246,0.1)] hover:bg-[rgba(59,130,246,0.2)] text-[var(--accent-primary)] border border-[rgba(59,130,246,0.2)] hover:border-[rgba(59,130,246,0.4)] transition-all flex items-center shadow-sm hover:shadow-[0_0_8px_rgba(59,130,246,0.3)] group ml-auto"
                        >
                          {opt.label}
                          <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Generating animation styles */}
      <style>{`
        .generating-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          height: 28px;
          font-size: 0.85em;
          font-weight: 600;
          color: #fff;
          user-select: none;
          overflow: hidden;
        }
        .gen-scanner {
          position: absolute;
          top: 0; left: 0;
          height: 100%; width: 100%;
          z-index: 1;
          background-color: transparent;
          mask: repeating-linear-gradient(90deg, transparent 0, transparent 4px, black 5px, black 6px);
        }
        .gen-scanner::after {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-image:
            radial-gradient(circle at 50% 50%, rgba(139,92,246,0.9) 0%, transparent 50%),
            radial-gradient(circle at 45% 45%, rgba(59,130,246,0.8) 0%, transparent 45%),
            radial-gradient(circle at 55% 55%, rgba(6,182,212,0.8) 0%, transparent 45%);
          mask: radial-gradient(circle at 50% 50%, transparent 0%, transparent 10%, black 25%);
          animation: gen-move 2s infinite alternate cubic-bezier(0.6,0.8,0.5,1),
                     gen-fade 4s infinite cubic-bezier(0.6,0.8,0.5,1);
        }
        .gen-letter {
          display: inline-block;
          opacity: 0;
          animation: gen-letter-anim 4s infinite linear;
          z-index: 2;
        }
        @keyframes gen-move {
          0% { transform: translateX(-55%); }
          100% { transform: translateX(55%); }
        }
        @keyframes gen-fade {
          0%, 100% { opacity: 0; }
          15% { opacity: 1; }
          65% { opacity: 0; }
        }
        @keyframes gen-letter-anim {
          0% { opacity: 0; }
          5% { opacity: 1; text-shadow: 0 0 4px rgba(139,92,246,0.8); transform: scale(1.1) translateY(-1px); }
          20% { opacity: 0.2; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
