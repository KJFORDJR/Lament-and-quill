'use client';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  theme?: 'crimson' | 'silver';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  theme = 'silver',
  size = 'lg',
  showCloseButton = true 
}: ModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  // Theme configurations
  const themeClasses = {
    crimson: {
      border: 'border-gothic-crimson',
      background: 'bg-gothic-charcoal',
      headerBorder: 'border-gothic-crimson/20',
      closeButton: 'hover:text-gothic-crimson'
    },
    silver: {
      border: 'border-gothic-silver',
      background: 'bg-gothic-charcoal',
      headerBorder: 'border-gothic-silver/20',
      closeButton: 'hover:text-gothic-silver'
    }
  };

  const currentTheme = themeClasses[theme];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        style={{ zIndex: 999999 }}
        // Removed onClick handler to prevent closing when clicking outside
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className={`${currentTheme.background} ${currentTheme.border} border rounded-lg shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}
          style={{ zIndex: 999999 }}
          onClick={(e) => e.stopPropagation()} // Prevent event bubbling
        >
          {/* Modal Header */}
          <div className={`flex justify-between items-center p-6 border-b ${currentTheme.headerBorder}`}>
            <h2 className="text-2xl font-gothic font-bold text-gothic-silver">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`text-gothic-steel ${currentTheme.closeButton} transition-colors hover:bg-gothic-steel/10 p-2 rounded`}
                title="Close Modal"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
