import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal';

export interface ReadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  theme?: 'silver' | 'crimson' | 'default';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
  author?: string;
  category?: string;
  publishedAt?: string;
  readTime?: string;
  showFooter?: boolean;
}

/**
 * Specialized ReadModal component for displaying content in Dark Neo-Gothic style
 * Optimized for reading experiences with enhanced typography and theming
 */
export function ReadModal({
  isOpen,
  onClose,
  title,
  theme = 'silver',
  size = 'xl',
  children,
  author,
  category,
  publishedAt,
  readTime,
  showFooter = true
}: ReadModalProps) {
  // Theme-specific styling
  const themeStyles = {
    crimson: {
      accent: 'text-gothic-crimson',
      border: 'border-gothic-crimson/30',
      bg: 'bg-red-900/10',
      glow: 'shadow-red-500/20',
      button: 'bg-gothic-crimson hover:bg-gothic-crimson/80 text-white'
    },
    silver: {
      accent: 'text-gothic-silver',
      border: 'border-gothic-silver/30',
      bg: 'bg-gothic-silver/5',
      glow: 'shadow-gothic-silver/20',
      button: 'bg-gothic-silver hover:bg-gothic-silver/80 text-gothic-charcoal'
    },
    default: {
      accent: 'text-gothic-steel',
      border: 'border-gothic-steel/30',
      bg: 'bg-gothic-steel/5',
      glow: 'shadow-gothic-steel/20',
      button: 'bg-gothic-steel hover:bg-gothic-steel/80 text-white'
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      theme={theme}
      size={size}
      className="font-noir"
    >
      <div className="p-8">
        {/* Meta Information */}
        {(author || category || publishedAt || readTime) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`
              flex flex-wrap items-center gap-4 mb-6 pb-4 
              border-b ${currentTheme.border}
            `}
          >
            {author && (
              <div className="flex items-center space-x-2">
                <span className="text-gothic-steel text-sm">by</span>
                <span className={`font-medium ${currentTheme.accent}`}>
                  {author}
                </span>
              </div>
            )}
            {category && (
              <span className={`
                px-3 py-1 text-xs font-tech font-bold rounded-full 
                border ${currentTheme.border} ${currentTheme.bg} ${currentTheme.accent}
              `}>
                {category}
              </span>
            )}
            {publishedAt && (
              <span className="text-gothic-steel text-sm">
                {new Date(publishedAt).toLocaleDateString()}
              </span>
            )}
            {readTime && (
              <span className="text-gothic-steel text-sm">
                {readTime} read
              </span>
            )}
          </motion.div>
        )}

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`
            prose prose-lg max-w-none
            prose-headings:font-gothic prose-headings:${currentTheme.accent}
            prose-p:text-gothic-silver prose-p:leading-relaxed
            prose-strong:${currentTheme.accent}
            prose-em:text-gothic-steel prose-em:italic
            prose-blockquote:border-l-4 prose-blockquote:${currentTheme.border}
            prose-blockquote:pl-6 prose-blockquote:${currentTheme.bg}
            prose-code:${currentTheme.accent} prose-code:bg-gothic-dark-gray/50
            prose-pre:bg-gothic-dark-gray prose-pre:border prose-pre:${currentTheme.border}
          `}
        >
          {children}
        </motion.div>

        {/* Footer Actions */}
        {showFooter && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`
              flex justify-between items-center pt-6 mt-8 
              border-t ${currentTheme.border}
            `}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-2 h-2 rounded-full ${currentTheme.accent} animate-pulse`} />
              <span className="text-gothic-steel text-sm font-tech">
                Neural Archive Entry
              </span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className={`
                  px-6 py-3 rounded-lg transition-all duration-200 
                  ${currentTheme.button} font-medium shadow-lg 
                  ${currentTheme.glow} hover:shadow-xl
                  border ${currentTheme.border}
                `}
              >
                Close Archive
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
