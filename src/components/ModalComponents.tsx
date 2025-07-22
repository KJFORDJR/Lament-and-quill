'use client';

import React from 'react';
import Modal from './Modal';
import { useConfirmModal } from '@/hooks/useModalHooks';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  theme?: 'crimson' | 'silver' | 'default';
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  theme
}: ConfirmModalProps) {
  const modalTheme = theme || (variant === 'danger' ? 'crimson' : 'silver');

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      theme={modalTheme}
      size="md"
    >
      <div className="p-6">
        <p className={`mb-6 text-lg ${
          modalTheme === 'crimson' ? 'text-gothic-crimson/90' : 'text-gothic-silver/90'
        }`}>
          {message}
        </p>
        
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-md transition-all duration-200 ${
              modalTheme === 'crimson' 
                ? 'bg-gothic-charcoal border border-gothic-crimson/30 text-gothic-crimson hover:bg-gothic-crimson/10'
                : 'bg-gothic-charcoal border border-gothic-silver/30 text-gothic-silver hover:bg-gothic-silver/10'
            }`}
          >
            {cancelText}
          </button>
          
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-md transition-all duration-200 ${
              variant === 'danger'
                ? 'bg-gothic-crimson hover:bg-gothic-crimson/80 text-white'
                : modalTheme === 'crimson'
                ? 'bg-gothic-crimson hover:bg-gothic-crimson/80 text-white'
                : 'bg-gothic-silver hover:bg-gothic-silver/80 text-gothic-charcoal'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  theme?: 'crimson' | 'silver' | 'default';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showActions?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isSubmitting = false,
  theme = 'silver',
  size = 'lg',
  showActions = true
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      theme={theme}
      size={size}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {children}
        </div>
        
        {showActions && (
          <div className="flex justify-end gap-4 p-6 border-t border-gothic-steel/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md transition-all duration-200 disabled:opacity-50 ${
                theme === 'crimson' 
                  ? 'bg-gothic-charcoal border border-gothic-crimson/30 text-gothic-crimson hover:bg-gothic-crimson/10'
                  : 'bg-gothic-charcoal border border-gothic-silver/30 text-gothic-silver hover:bg-gothic-silver/10'
              }`}
            >
              {cancelText}
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-md transition-all duration-200 disabled:opacity-50 ${
                theme === 'crimson'
                  ? 'bg-gothic-crimson hover:bg-gothic-crimson/80 text-white'
                  : 'bg-gothic-silver hover:bg-gothic-silver/80 text-gothic-charcoal'
              }`}
            >
              {isSubmitting ? 'Submitting...' : submitText}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}

// Hook to use the ConfirmModal component
export function useConfirmModalComponent() {
  const { isOpen, config, openConfirmModal, closeModal, handleConfirm } = useConfirmModal();

  const ConfirmModalComponent = config ? (
    <ConfirmModal
      isOpen={isOpen}
      onClose={closeModal}
      title={config.title}
      message={config.message}
      onConfirm={handleConfirm}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
    />
  ) : null;

  return {
    openConfirmModal,
    ConfirmModalComponent
  };
}
