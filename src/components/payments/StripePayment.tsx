import React, { useState, useEffect } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Lock, CreditCard } from 'lucide-react';
import getStripe from '@/lib/stripe';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  metadata?: Record<string, string>;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  processing,
  setProcessing,
  metadata = {}
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Create payment intent
    createPaymentIntent();
  }, [amount]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError('Failed to initialize payment. Please try again.');
      onPaymentError(err.message);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    setProcessing(false);

    if (error) {
      setError(error.message || 'Payment failed');
      onPaymentError(error.message || 'Payment failed');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#e5e7eb', // Gothic silver
        backgroundColor: 'transparent',
        '::placeholder': {
          color: '#6b7280', // Gothic steel
        },
        iconColor: '#e5e7eb',
      },
      invalid: {
        color: '#ef4444', // Red for errors
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Lock size={20} className="text-gothic-silver" />
          <h3 className="text-lg font-gothic font-bold text-gothic-silver">
            Secure Payment
          </h3>
        </div>

        <div className="p-4 border border-gothic-dark-gray/50 rounded-lg bg-gothic-charcoal/20">
          <label className="block text-sm font-medium text-gothic-steel mb-2">
            <CreditCard size={16} className="inline mr-2" />
            Card Information
          </label>
          <div className="p-3 border border-gothic-dark-gray rounded-md bg-gothic-charcoal/30">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-md"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        <div className="p-4 bg-gothic-dark-gray/20 border border-gothic-dark-gray/30 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gothic-steel">Total Amount:</span>
            <span className="text-xl font-bold text-gothic-silver">
              ${amount.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gothic-steel">
            🔒 Your payment information is secured with 256-bit SSL encryption
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || !clientSecret}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
          processing || !stripe || !clientSecret
            ? 'bg-gothic-dark-gray/50 text-gothic-steel cursor-not-allowed'
            : 'cyber-button hover:shadow-lg hover:shadow-gothic-silver/20'
        }`}
      >
        {processing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-gothic-silver/30 border-t-gothic-silver rounded-full animate-spin"></div>
            <span>Processing Payment...</span>
          </div>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>

      <p className="text-xs text-gothic-steel text-center">
        By completing your purchase, you agree to our terms of service and privacy policy.
      </p>
    </motion.form>
  );
};

// Wrapper component with Stripe Elements provider
interface StripePaymentProps extends Omit<PaymentFormProps, 'processing' | 'setProcessing'> {
  onProcessingChange?: (processing: boolean) => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({ onProcessingChange, ...props }) => {
  const [processing, setProcessing] = useState(false);
  const stripePromise = getStripe();

  useEffect(() => {
    if (onProcessingChange) {
      onProcessingChange(processing);
    }
  }, [processing, onProcessingChange]);

  if (!stripePromise) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-400 mb-4">⚠️ Payment system unavailable</div>
        <p className="text-gothic-steel text-sm">
          Stripe configuration is missing. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        {...props}
        processing={processing}
        setProcessing={setProcessing}
      />
    </Elements>
  );
};

export default StripePayment;
