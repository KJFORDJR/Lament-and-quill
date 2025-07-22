'use client';

import { useState, useCallback, useMemo } from 'react';

/**
 * Enhanced useReadModal hook with performance optimizations
 * Provides consistent modal state management across the application
 */
export function useReadModal<T = any>() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openModal = useCallback((item: T) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    // Add small delay to ensure smooth animation
    setTimeout(() => {
      setIsOpen(false);
      setSelectedItem(null);
    }, 50);
  }, []);

  const updateSelectedItem = useCallback((item: T) => {
    setSelectedItem(item);
  }, []);

  // Memoize the return object to prevent unnecessary re-renders
  const modalState = useMemo(() => ({
    isOpen,
    selectedItem,
    openModal,
    closeModal,
    updateSelectedItem
  }), [isOpen, selectedItem, openModal, closeModal, updateSelectedItem]);

  return modalState;
}

/**
 * Basic modal state hook for simple modals
 */
export function useModalState(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

  return useMemo(() => ({
    isOpen,
    openModal,
    closeModal,
    toggleModal
  }), [isOpen, openModal, closeModal, toggleModal]);
}

/**
 * Form modal hook with data management
 */
export function useFormModal<T = any>(initialData?: T) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<T | undefined>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = useCallback((data?: T) => {
    if (data) {
      setFormData(data);
    }
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setFormData(initialData);
    setIsSubmitting(false);
  }, [initialData]);

  const updateFormData = useCallback((data: Partial<T>) => {
    setFormData(prev => prev ? { ...prev, ...data } : data as T);
  }, []);

  return useMemo(() => ({
    isOpen,
    formData,
    isSubmitting,
    openModal,
    closeModal,
    updateFormData,
    setIsSubmitting
  }), [isOpen, formData, isSubmitting, openModal, closeModal, updateFormData]);
}

/**
 * Confirmation modal hook
 */
export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const openConfirmModal = useCallback((modalConfig: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
  }) => {
    setConfig(modalConfig);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setConfig(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (config?.onConfirm) {
      config.onConfirm();
    }
    closeModal();
  }, [config, closeModal]);

  return useMemo(() => ({
    isOpen,
    config,
    openConfirmModal,
    closeModal,
    handleConfirm
  }), [isOpen, config, openConfirmModal, closeModal, handleConfirm]);
}
