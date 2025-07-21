import { useState, useCallback } from 'react';

/**
 * Custom hook for managing read modal state
 * Provides consistent state management for reading items in modals
 */
export function useReadModal<T = any>() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openModal = useCallback((item: T) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedItem(null);
  }, []);

  const updateSelectedItem = useCallback((updater: (item: T | null) => T | null) => {
    setSelectedItem(updater);
  }, []);

  return {
    isOpen,
    selectedItem,
    openModal,
    closeModal,
    updateSelectedItem,
    // Legacy aliases for backward compatibility
    showReadModal: isOpen,
    setShowReadModal: setIsOpen,
    readingItem: selectedItem,
    setReadingItem: setSelectedItem,
  };
}
