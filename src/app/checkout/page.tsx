'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Lock, Package, User, MapPin, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import StripePayment from '@/components/payments/StripePayment';

interface CartItem {
  id: string;
  merchandise_id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    stock_quantity: number;
    category: string;
  };
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const { user, profile, loading: userLoading } = useUser();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [billingAddressSame, setBillingAddressSame] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  useEffect(() => {
    if (userLoading) return; // Wait for auth to load
    
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCartItems();
  }, [user, userLoading]);

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          merchandise (
            id,
            title,
            price,
            image_url,
            stock_quantity,
            category
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        router.push('/cart');
        return;
      }
      
      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'credit-card' && !paymentIntentId) {
      // For Stripe, we'll handle this through the StripePayment component
      return;
    }
    setCurrentStep('review');
  };

  const handlePaymentSuccess = (stripePaymentIntentId: string) => {
    setPaymentIntentId(stripePaymentIntentId);
    setCurrentStep('review');
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
    setPaymentProcessing(false);
  };

  const placeOrder = async () => {
    if (!user) {
      alert('Please log in to place an order');
      router.push('/login');
      return;
    }

    setProcessing(true);

    try {
      // Check if user session is still valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        alert('Your session has expired. Please log in again.');
        router.push('/login');
        return;
      }

      // Generate order number
      const { data: orderNumber, error: orderNumError } = await supabase
        .rpc('generate_order_number');

      if (orderNumError) {
        console.error('Order number generation error:', orderNumError);
        throw new Error(`Failed to generate order number: ${orderNumError.message}`);
      }

      if (!orderNumber) throw new Error('Failed to generate order number');

      console.log('Generated order number:', orderNumber);

      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.merchandise.price * item.quantity), 
        0
      );
      const hasPhysicalItems = cartItems.some(item => item.merchandise.category !== 'digital');
      const shipping = hasPhysicalItems ? (subtotal > 50 ? 0 : 9.99) : 0;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total_amount: total,
          shipping_address: shippingAddress,
          billing_address: billingAddressSame ? shippingAddress : shippingAddress, // For now, same as shipping
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'credit-card' && paymentIntentId ? 'paid' : 'pending',
          status: 'processing',
          stripe_payment_intent_id: paymentMethod === 'credit-card' ? paymentIntentId : null
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with merchandise snapshots
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        merchandise_id: item.merchandise_id,
        quantity: item.quantity,
        price_at_time: item.merchandise.price,
        merchandise_snapshot: {
          title: item.merchandise.title,
          price: item.merchandise.price,
          image_url: item.merchandise.image_url
        }
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update stock quantities
      for (const item of cartItems) {
        const { error: stockError } = await supabase
          .from('merchandise')
          .update({
            stock_quantity: Math.max(0, item.merchandise.stock_quantity - item.quantity)
          })
          .eq('id', item.merchandise_id);

        if (stockError) console.error('Error updating stock:', stockError);
      }

      // Clear cart
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (clearCartError) throw clearCartError;

      // Send order confirmation emails
      try {
        await fetch('/api/send-order-emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId: order.id }),
        });
        console.log('Order confirmation emails sent');
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError);
        // Don't fail the order if emails fail
      }

      // Redirect to success page with order ID as query parameter
      router.push(`/order-confirmation?order=${order.id}`);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (userLoading || (!user && !userLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-gothic-steel">
          {userLoading ? 'Loading...' : 'Redirecting to login...'}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-gothic-steel">Loading checkout...</div>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.merchandise.price * item.quantity), 
    0
  );
  
  // Check if cart contains any physical items (non-digital goods)
  const hasPhysicalItems = cartItems.some(item => item.merchandise.category !== 'digital');
  
  // Only charge shipping for physical items
  const shipping = hasPhysicalItems ? (subtotal > 50 ? 0 : 9.99) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <button
            onClick={() => router.push('/cart')}
            className="mr-4 text-gothic-steel hover:text-gothic-silver transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-gothic font-bold text-gothic-silver glow-text">
              Secure Checkout
            </h1>
            <p className="text-gothic-steel mt-2">
              Complete your order from the shadow markets
            </p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-8">
            {[
              { key: 'shipping', label: 'Shipping', icon: MapPin },
              { key: 'payment', label: 'Payment', icon: CreditCard },
              { key: 'review', label: 'Review', icon: Package }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = step.key === currentStep;
              const isCompleted = ['shipping', 'payment', 'review'].indexOf(currentStep) > 
                                 ['shipping', 'payment', 'review'].indexOf(step.key);
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600 text-white'
                      : isActive 
                        ? 'border-gothic-silver text-gothic-silver'
                        : 'border-gothic-dark-gray text-gothic-steel'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <span className={`ml-3 ${
                    isActive 
                      ? 'text-gothic-silver font-medium'
                      : 'text-gothic-steel'
                  }`}>
                    {step.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 ml-8 ${
                      isCompleted ? 'bg-green-600' : 'bg-gothic-dark-gray'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'shipping' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="gothic-container p-8"
              >
                <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-6 flex items-center">
                  <MapPin size={24} className="mr-3" />
                  Shipping Information
                </h2>
                
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gothic-steel text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress(prev => 
                          ({ ...prev, firstName: e.target.value })
                        )}
                        className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                      />
                    </div>
                    <div>
                      <label className="block text-gothic-steel text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress(prev => 
                          ({ ...prev, lastName: e.target.value })
                        )}
                        className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gothic-steel text-sm font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress(prev => 
                          ({ ...prev, email: e.target.value })
                        )}
                        className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                      />
                    </div>
                    <div>
                      <label className="block text-gothic-steel text-sm font-medium mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress(prev => 
                          ({ ...prev, phone: e.target.value })
                        )}
                        className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gothic-steel text-sm font-medium mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.address1}
                      onChange={(e) => setShippingAddress(prev => 
                        ({ ...prev, address1: e.target.value })
                      )}
                      className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                    />
                  </div>

                  <div>
                    <label className="block text-gothic-steel text-sm font-medium mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address2}
                      onChange={(e) => setShippingAddress(prev => 
                        ({ ...prev, address2: e.target.value })
                      )}
                      className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gothic-steel text-sm font-medium mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => 
                          ({ ...prev, city: e.target.value })
                        )}
                        className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                      />
                    </div>
                    <div>
                      <label className="block text-gothic-steel text-sm font-medium mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => 
                          ({ ...prev, state: e.target.value })
                        )}
                        className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                      />
                    </div>
                    <div>
                      <label className="block text-gothic-steel text-sm font-medium mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress(prev => 
                          ({ ...prev, zipCode: e.target.value })
                        )}
                        className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="cyber-button w-full py-4"
                  >
                    Continue to Payment
                  </button>
                </form>
              </motion.div>
            )}

            {currentStep === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="gothic-container p-8"
              >
                <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-6 flex items-center">
                  <CreditCard size={24} className="mr-3" />
                  Payment Method
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="credit-card"
                        name="payment"
                        value="credit-card"
                        checked={paymentMethod === 'credit-card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-gothic-silver"
                      />
                      <label htmlFor="credit-card" className="ml-3 text-gothic-silver">
                        Credit Card
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="crypto"
                        name="payment"
                        value="crypto"
                        checked={paymentMethod === 'crypto'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-gothic-silver"
                      />
                      <label htmlFor="crypto" className="ml-3 text-gothic-silver">
                        Cryptocurrency
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'credit-card' && (
                    <StripePayment
                      amount={total}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      onProcessingChange={setPaymentProcessing}
                      metadata={{
                        userId: user.id,
                        orderType: 'merchandise'
                      }}
                    />
                  )}

                  {paymentMethod === 'crypto' && (
                    <div className="space-y-4 p-4 bg-gothic-dark-gray/20 rounded-lg">
                      <p className="text-gothic-steel text-sm">
                        Accepted cryptocurrencies: Bitcoin, Ethereum, Litecoin
                      </p>
                      <div className="text-center text-gothic-steel py-8">
                        <div className="text-4xl mb-4">₿</div>
                        <p>Crypto payment processing would be integrated here</p>
                        <p className="text-xs mt-2">
                          (BitPay, Coinbase Commerce, etc.)
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('shipping')}
                      className="flex-1 border border-gothic-dark-gray text-gothic-steel hover:text-gothic-silver hover:border-gothic-silver transition-colors py-4 rounded-lg"
                    >
                      Back to Shipping
                    </button>
                    {paymentMethod === 'crypto' && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep('review')}
                        className="cyber-button flex-1 py-4"
                      >
                        Review Order
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'review' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="gothic-container p-8"
              >
                <h2 className="text-2xl font-gothic font-bold text-gothic-silver mb-6 flex items-center">
                  <Package size={24} className="mr-3" />
                  Review Your Order
                </h2>
                
                <div className="space-y-6">
                  {/* Shipping Address Review */}
                  <div>
                    <h3 className="text-lg font-medium text-gothic-silver mb-3">Shipping Address</h3>
                    <div className="bg-gothic-dark-gray/20 p-4 rounded-lg text-gothic-steel">
                      <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                      <p>{shippingAddress.address1}</p>
                      {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                      <p>{shippingAddress.email}</p>
                      <p>{shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Payment Method Review */}
                  <div>
                    <h3 className="text-lg font-medium text-gothic-silver mb-3">Payment Method</h3>
                    <div className="bg-gothic-dark-gray/20 p-4 rounded-lg text-gothic-steel capitalize">
                      {paymentMethod.replace('-', ' ')}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-medium text-gothic-silver mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gothic-dark-gray/20 p-4 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gothic-dark-gray rounded overflow-hidden flex-shrink-0">
                              {item.merchandise.image_url ? (
                                <img
                                  src={item.merchandise.image_url}
                                  alt={item.merchandise.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gothic-steel">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-gothic-silver font-medium">{item.merchandise.title}</p>
                              <p className="text-gothic-steel text-sm">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-gothic-silver font-medium">
                            ${(item.merchandise.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('payment')}
                      className="flex-1 border border-gothic-dark-gray text-gothic-steel hover:text-gothic-silver hover:border-gothic-silver transition-colors py-4 rounded-lg"
                    >
                      Back to Payment
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={processing || (paymentMethod === 'credit-card' && !paymentIntentId)}
                      className="cyber-button flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 
                       (paymentMethod === 'credit-card' && !paymentIntentId) ? 'Complete Payment First' : 
                       'Place Order'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="gothic-container p-6 sticky top-8"
            >
              <h2 className="text-xl font-gothic font-bold text-gothic-silver mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3 text-sm">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gothic-steel">
                      {item.merchandise.title} × {item.quantity}
                    </span>
                    <span className="text-gothic-silver">
                      ${(item.merchandise.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gothic-dark-gray mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gothic-steel">Subtotal</span>
                  <span className="text-gothic-silver">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gothic-steel">Shipping</span>
                  <span className="text-gothic-silver">
                    {!hasPhysicalItems ? (
                      <span className="text-gothic-silver">📱 Digital goods - No shipping required</span>
                    ) : shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gothic-steel">Tax</span>
                  <span className="text-gothic-silver">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gothic-dark-gray pt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-gothic-silver">Total</span>
                    <span className="text-gothic-silver">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
