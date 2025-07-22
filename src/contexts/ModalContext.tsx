'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Modal from '@/components/Modal';
import { ReadModal } from '@/components/ReadModal';

export interface BaseModalConfig {
  id: string;
  title: string;
  content?: ReactNode;
  theme?: 'crimson' | 'silver' | 'default';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  onClose?: () => void;
}

export interface ReadModalConfig extends BaseModalConfig {
  type: 'read';
  author?: string;
  category?: string;
  publishedAt?: string;
  readTime?: string;
  showFooter?: boolean;
}

export interface StandardModalConfig extends BaseModalConfig {
  type: 'standard';
}

export interface FormModalConfig extends BaseModalConfig {
  type: 'form';
  onSubmit?: (data: any) => void;
  formData?: any;
  submitText?: string;
  cancelText?: string;
}

export interface ConfirmModalConfig extends BaseModalConfig {
  type: 'confirm';
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export type ModalConfig = ReadModalConfig | StandardModalConfig | FormModalConfig | ConfirmModalConfig;

interface ModalContextType {
  modals: ModalConfig[];
  openModal: (config: ModalConfig) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, updates: Partial<ModalConfig>) => void;
  isModalOpen: (id: string) => boolean;
  
  // Convenience methods for common modal types
  openReadModal: (config: Omit<ReadModalConfig, 'type' | 'id'>) => string;
  openConfirmModal: (config: Omit<ConfirmModalConfig, 'type' | 'id'>) => string;
  openFormModal: (config: Omit<FormModalConfig, 'type' | 'id'>) => string;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const generateId = useCallback(() => {
    return `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const openModal = useCallback((config: ModalConfig) => {
    const id = config.id || generateId();
    const modalConfig = { ...config, id };
    
    setModals(prev => [...prev, modalConfig]);
    return id;
  }, [generateId]);

  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const modal = prev.find(m => m.id === id);
      if (modal?.onClose) {
        modal.onClose();
      }
      return prev.filter(m => m.id !== id);
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(prev => {
      prev.forEach(modal => {
        if (modal.onClose) {
          modal.onClose();
        }
      });
      return [];
    });
  }, []);

  const updateModal = useCallback((id: string, updates: Partial<ModalConfig>) => {
    setModals(prev => prev.map(modal => 
      modal.id === id ? { ...modal, ...updates } as ModalConfig : modal
    ));
  }, []);

  const isModalOpen = useCallback((id: string) => {
    return modals.some(modal => modal.id === id);
  }, [modals]);

  // Convenience methods
  const openReadModal = useCallback((config: Omit<ReadModalConfig, 'type' | 'id'>) => {
    return openModal({ ...config, type: 'read', id: generateId() });
  }, [openModal, generateId]);

  const openConfirmModal = useCallback((config: Omit<ConfirmModalConfig, 'type' | 'id'>) => {
    return openModal({ 
      ...config, 
      type: 'confirm', 
      id: generateId(),
      theme: config.variant === 'danger' ? 'crimson' : 'silver'
    });
  }, [openModal, generateId]);

  const openFormModal = useCallback((config: Omit<FormModalConfig, 'type' | 'id'>) => {
    return openModal({ ...config, type: 'form', id: generateId() });
  }, [openModal, generateId]);

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    isModalOpen,
    openReadModal,
    openConfirmModal,
    openFormModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalRenderer />
    </ModalContext.Provider>
  );
}

function ModalRenderer() {
  const context = useContext(ModalContext);
  if (!context) return null;

  const { modals, closeModal } = context;

  return (
    <>
      {modals.map((modal) => {
        const handleClose = () => closeModal(modal.id);

        switch (modal.type) {
          case 'read':
            return (
              <ReadModal
                key={modal.id}
                isOpen={true}
                onClose={handleClose}
                title={modal.title}
                theme={modal.theme}
                size={modal.size}
                author={modal.author}
                category={modal.category}
                publishedAt={modal.publishedAt}
                readTime={modal.readTime}
                showFooter={modal.showFooter}
              >
                {modal.content}
              </ReadModal>
            );

          case 'confirm':
            return (
              <Modal
                key={modal.id}
                isOpen={true}
                onClose={handleClose}
                title={modal.title}
                theme={modal.theme || 'silver'}
                size={modal.size || 'md'}
                showCloseButton={modal.showCloseButton}
                closeOnBackdrop={modal.closeOnBackdrop}
                closeOnEscape={modal.closeOnEscape}
                className={modal.className}
              >
                <div className="p-6">
                  <p className={`mb-6 text-lg ${
                    modal.theme === 'crimson' ? 'text-gothic-crimson/90' : 'text-gothic-silver/90'
                  }`}>
                    {modal.message}
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={handleClose}
                      className={`px-6 py-2 rounded-md transition-all duration-200 ${
                        modal.theme === 'crimson' 
                          ? 'bg-gothic-charcoal border border-gothic-crimson/30 text-gothic-crimson hover:bg-gothic-crimson/10'
                          : 'bg-gothic-charcoal border border-gothic-silver/30 text-gothic-silver hover:bg-gothic-silver/10'
                      }`}
                    >
                      {modal.cancelText || 'Cancel'}
                    </button>
                    <button
                      onClick={() => {
                        modal.onConfirm();
                        handleClose();
                      }}
                      className={`px-6 py-2 rounded-md transition-all duration-200 ${
                        modal.variant === 'danger'
                          ? 'bg-gothic-crimson hover:bg-gothic-crimson/80 text-white'
                          : modal.theme === 'crimson'
                          ? 'bg-gothic-crimson hover:bg-gothic-crimson/80 text-white'
                          : 'bg-gothic-silver hover:bg-gothic-silver/80 text-gothic-charcoal'
                      }`}
                    >
                      {modal.confirmText || 'Confirm'}
                    </button>
                  </div>
                </div>
              </Modal>
            );

          case 'form':
            return (
              <Modal
                key={modal.id}
                isOpen={true}
                onClose={handleClose}
                title={modal.title}
                theme={modal.theme}
                size={modal.size}
                showCloseButton={modal.showCloseButton}
                closeOnBackdrop={modal.closeOnBackdrop}
                closeOnEscape={modal.closeOnEscape}
                className={modal.className}
              >
                {modal.content}
              </Modal>
            );

          case 'standard':
          default:
            return (
              <Modal
                key={modal.id}
                isOpen={true}
                onClose={handleClose}
                title={modal.title}
                theme={modal.theme}
                size={modal.size}
                showCloseButton={modal.showCloseButton}
                closeOnBackdrop={modal.closeOnBackdrop}
                closeOnEscape={modal.closeOnEscape}
                className={modal.className}
              >
                {modal.content}
              </Modal>
            );
        }
      })}
    </>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

// Legacy hook for backward compatibility
export function useReadModal<T = any>() {
  const { openReadModal, closeModal, modals } = useModal();
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [currentModalId, setCurrentModalId] = useState<string | null>(null);

  const openModal = useCallback((item: T, config?: Partial<Omit<ReadModalConfig, 'type' | 'id' | 'content'>>) => {
    setSelectedItem(item);
    const modalId = openReadModal({
      title: config?.title || 'Reading',
      content: null, // Will be handled by the calling component
      ...config
    });
    setCurrentModalId(modalId);
  }, [openReadModal]);

  const closeModalHandler = useCallback(() => {
    if (currentModalId) {
      closeModal(currentModalId);
      setCurrentModalId(null);
      setSelectedItem(null);
    }
  }, [closeModal, currentModalId]);

  const updateSelectedItem = useCallback((item: T) => {
    setSelectedItem(item);
  }, []);

  const isOpen = currentModalId ? modals.some(m => m.id === currentModalId) : false;

  return {
    isOpen,
    selectedItem,
    openModal,
    closeModal: closeModalHandler,
    updateSelectedItem
  };
}
