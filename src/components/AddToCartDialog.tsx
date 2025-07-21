'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddToCartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
}

export default function AddToCartDialog({ isOpen, onClose, productTitle }: AddToCartDialogProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleContinueShopping = () => {
    onClose();
  };

  const handleGoToCart = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/20 to-zinc-800/20 p-6 border-b border-zinc-700">
          <h3 className="text-xl font-bold text-white mb-2">
            ✓ Added to Cart
          </h3>
          {productTitle && (
            <p className="text-zinc-300 text-sm">
              "{productTitle}" has been added to your cart
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-zinc-300 mb-6">
            What would you like to do next?
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleContinueShopping}
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-600 transition-all duration-200 hover:border-zinc-500 font-medium"
            >
              Continue Shopping
            </button>
            
            <button
              onClick={handleGoToCart}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-lg transition-all duration-200 font-medium"
            >
              Go to Cart
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
