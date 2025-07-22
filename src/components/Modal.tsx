'use client';

import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect, useCallback, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  theme?: 'crimson' | 'silver' | 'default';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  theme = 'silver',
  size = 'lg',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = ''
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && closeOnBackdrop) {
        onClose();
      }
    },
    [onClose, closeOnBackdrop]
  );

  // Focus management and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      lastActiveElement.current = document.activeElement as HTMLElement;
      
      // Disable body scroll with better iOS support
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Focus the modal after a short delay to ensure it's rendered
      const focusTimer = setTimeout(() => {
        const modal = modalRef.current;
        if (modal) {
          // Try to focus the first focusable element, fallback to modal itself
          const focusableElements = modal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          const firstFocusable = focusableElements[0] as HTMLElement;
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modal.focus();
          }
        }
      }, 150);

      return () => clearTimeout(focusTimer);
    } else {
      // Restore body scroll and position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
      
      // Restore focus to last active element with a delay to ensure modal is closed
      setTimeout(() => {
        if (lastActiveElement.current && typeof lastActiveElement.current.focus === 'function') {
          try {
            lastActiveElement.current.focus();
          } catch (error) {
            // Fallback if focus fails
            console.warn('Could not restore focus to previous element:', error);
          }
        }
      }, 100);
    }

    // Cleanup function
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard event listeners and additional accessibility
  useEffect(() => {
    if (isOpen) {
      // Add event listeners
      document.addEventListener('keydown', handleEscape);
      
      // Prevent background scroll on mobile/touch devices
      const preventDefault = (e: TouchEvent) => {
        if (e.target && !modalRef.current?.contains(e.target as Node)) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('touchmove', preventDefault, { passive: false });
      
      // Hide content from screen readers
      const appElements = document.querySelectorAll('body > *:not([role="dialog"])');
      appElements.forEach(element => {
        if (element !== modalRef.current?.parentElement) {
          element.setAttribute('aria-hidden', 'true');
        }
      });

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('touchmove', preventDefault);
        
        // Restore screen reader access
        appElements.forEach(element => {
          element.removeAttribute('aria-hidden');
        });
      };
    }
  }, [isOpen, handleEscape]);

  // Enhanced focus trap
  const handleTabKey = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    // Get all focusable elements within the modal
    const focusableElements = modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const focusableArray = Array.from(focusableElements) as HTMLElement[];
    const firstElement = focusableArray[0];
    const lastElement = focusableArray[focusableArray.length - 1];

    // If no focusable elements, prevent tabbing
    if (focusableArray.length === 0) {
      event.preventDefault();
      return;
    }

    // Handle forward tab on last element
    if (!event.shiftKey && document.activeElement === lastElement) {
      firstElement?.focus();
      event.preventDefault();
      return;
    }

    // Handle backward tab on first element
    if (event.shiftKey && document.activeElement === firstElement) {
      lastElement?.focus();
      event.preventDefault();
      return;
    }

    // Handle case where focus is outside the modal (shouldn't happen but safety check)
    if (!modal.contains(document.activeElement)) {
      event.preventDefault();
      if (event.shiftKey) {
        lastElement?.focus();
      } else {
        firstElement?.focus();
      }
    }
  }, []);

  if (!isOpen || typeof document === 'undefined') return null;

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  };

  // Theme configurations
  const themeClasses = {
    crimson: {
      border: 'border-gothic-crimson/50',
      background: 'bg-gothic-black',
      headerBorder: 'border-gothic-crimson/30',
      headerBg: 'bg-gradient-to-r from-red-900/20 to-gothic-black/80',
      title: 'text-gothic-crimson',
      closeButton: 'text-gothic-crimson hover:text-gothic-crimson/80 hover:bg-gothic-crimson/10'
    },
    silver: {
      border: 'border-gothic-silver/50',
      background: 'bg-gothic-charcoal',
      headerBorder: 'border-gothic-silver/30',
      headerBg: 'bg-gradient-to-r from-gothic-silver/10 to-gothic-charcoal/80',
      title: 'text-gothic-silver',
      closeButton: 'text-gothic-silver hover:text-gothic-silver/80 hover:bg-gothic-silver/10'
    },
    default: {
      border: 'border-gothic-steel/50',
      background: 'bg-gothic-dark-gray',
      headerBorder: 'border-gothic-steel/30',
      headerBg: 'bg-gradient-to-r from-gothic-dark-gray/20 to-gothic-charcoal/80',
      title: 'text-gothic-steel',
      closeButton: 'text-gothic-steel hover:text-gothic-steel/80 hover:bg-gothic-steel/10'
    }
  };

  const currentTheme = themeClasses[theme];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gothic-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className={`
              relative ${currentTheme.background} ${currentTheme.border} 
              border-2 rounded-lg shadow-2xl ${sizeClasses[size]} 
              w-full max-h-[90vh] overflow-hidden ${className}
            `}
            onKeyDown={handleTabKey}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-content"
          >
            {/* Modal Header */}
            <div className={`
              flex justify-between items-center p-6 border-b 
              ${currentTheme.headerBorder} ${currentTheme.headerBg}
            `}>
              <h2 
                id="modal-title"
                className={`text-2xl font-gothic font-bold ${currentTheme.title}`}
              >
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={`
                    ${currentTheme.closeButton} transition-all duration-200 
                    p-2 rounded-md
                  `}
                  aria-label="Close modal"
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
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
