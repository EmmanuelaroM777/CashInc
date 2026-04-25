import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div className={`relative w-full ${maxWidth} mx-auto my-6 z-50 animate-slide-up`}>
        <div className="relative flex flex-col w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-xl shadow-[var(--shadow-lg)] outline-none focus:outline-none overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-light)] bg-gradient-to-r from-[rgba(59,130,246,0.1)] to-transparent">
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-[var(--text-secondary)] hover:text-white transition-colors focus:outline-none"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="relative p-6 flex-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
