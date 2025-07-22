import { useState, useCallback, useMemo } from 'react';

/**
 * Enhanced custom hook for managing read modal state
 * Provides optimized state management with memoized callbacks and performance optimizations
 */
export function useReadModal<T = any>() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  // Memoized callback to open modal with item
  const openModal = useCallback((item: T) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  // Memoized callback to close modal and clear item
  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Delay clearing the item to allow for exit animations
    setTimeout(() => {
      setSelectedItem(null);
    }, 300);
  }, []);

  // Memoized callback to update selected item while modal is open
  const updateSelectedItem = useCallback((updater: (item: T | null) => T | null) => {
    setSelectedItem(updater);
  }, []);

  // Memoized callback to directly set modal open state
  const setModalOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        setSelectedItem(null);
      }, 300);
    }
  }, []);

  // Memoized callback to directly set selected item
  const setModalItem = useCallback((item: T | null) => {
    setSelectedItem(item);
  }, []);

  // Memoized callback to clear selection without closing
  const clearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Memoized boolean for checking if modal has content
  const hasContent = useMemo(() => selectedItem !== null, [selectedItem]);

  // Memoized boolean for checking if modal is ready (open and has content)
  const isReady = useMemo(() => isOpen && hasContent, [isOpen, hasContent]);

  return {
    // Primary state
    isOpen,
    selectedItem,
    
    // Primary actions
    openModal,
    closeModal,
    updateSelectedItem,
    
    // Additional state management
    setModalOpen,
    setModalItem,
    clearSelection,
    
    // Computed state
    hasContent,
    isReady,
    
    // Legacy aliases for backward compatibility
    showReadModal: isOpen,
    setShowReadModal: setModalOpen,
    readingItem: selectedItem,
    setReadingItem: setModalItem,
  };
}
