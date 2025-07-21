import { ReactNode } from 'react';
import Modal from './Modal';

export interface ReadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  theme?: 'silver' | 'crimson';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

/**
 * Reusable ReadModal wrapper component
 * Standardizes read modal behavior across the application
 */
export function ReadModal({
  isOpen,
  onClose,
  title,
  theme = 'silver',
  size = 'lg',
  children
}: ReadModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      theme={theme}
      size={size}
    >
      <div className="p-6">
        {children}
        <div className="flex justify-end pt-6 border-t border-gothic-steel/30 mt-6">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded transition-colors ${
              theme === 'crimson'
                ? 'bg-gothic-crimson text-white hover:bg-gothic-crimson/80'
                : 'bg-gothic-silver text-gothic-charcoal hover:bg-gothic-silver/80'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
