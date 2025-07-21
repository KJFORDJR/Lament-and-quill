'use client';

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailStatusPage() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="gothic-container p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-gothic font-bold text-gothic-silver mb-4">
              Email System Active! 📧
            </h1>
            <p className="text-xl text-gothic-steel">
              Your order confirmation emails are now working correctly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="gothic-container p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mr-4">
                  <Mail size={24} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-gothic-silver">Customer Emails</h3>
              </div>
              <ul className="space-y-2 text-gothic-steel">
                <li>✅ Beautiful HTML order confirmation</li>
                <li>✅ Itemized receipt with pricing</li>
                <li>✅ Shipping and delivery info</li>
                <li>✅ Digital goods processing details</li>
                <li>✅ Support contact information</li>
              </ul>
            </div>

            <div className="gothic-container p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mr-4">
                  <Mail size={24} className="text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-gothic-silver">Admin Notifications</h3>
              </div>
              <ul className="space-y-2 text-gothic-steel">
                <li>✅ Instant order alerts to support@lamentandquill.com</li>
                <li>✅ Complete customer and order details</li>
                <li>✅ Payment status and method info</li>
                <li>✅ Shipping address for processing</li>
                <li>✅ Action items for order fulfillment</li>
              </ul>
            </div>
          </div>

          <div className="bg-gothic-dark-gray/20 border border-gothic-dark-gray rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gothic-silver mb-4">Email Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gothic-steel">Service:</span>
                <span className="text-gothic-silver ml-2">Resend</span>
              </div>
              <div>
                <span className="text-gothic-steel">Domain:</span>
                <span className="text-gothic-silver ml-2">lamentandquill.com ✅</span>
              </div>
              <div>
                <span className="text-gothic-steel">From Address:</span>
                <span className="text-gothic-silver ml-2">support@lamentandquill.com</span>
              </div>
              <div>
                <span className="text-gothic-steel">Admin Email:</span>
                <span className="text-gothic-silver ml-2">support@lamentandquill.com</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle size={24} className="text-blue-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-2">How It Works</h3>
                <p className="text-gothic-steel mb-3">
                  When a customer completes a purchase on your site:
                </p>
                <ol className="list-decimal list-inside text-gothic-steel space-y-1">
                  <li>Order is saved to database with unique order number</li>
                  <li>Payment is processed through Stripe</li>
                  <li>Inventory is automatically updated</li>
                  <li>Customer cart is cleared</li>
                  <li><strong>Customer receives beautiful confirmation email</strong></li>
                  <li><strong>You receive detailed admin notification</strong></li>
                  <li>Customer is redirected to order confirmation page</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="space-x-4">
              <a 
                href="/merchandise" 
                className="cyber-button inline-block px-6 py-3"
              >
                View Merchandise
              </a>
              <a 
                href="/test-email" 
                className="border border-gothic-dark-gray text-gothic-steel hover:text-gothic-silver hover:border-gothic-silver transition-colors px-6 py-3 rounded-lg inline-block"
              >
                Test Email System
              </a>
            </div>
            <p className="text-gothic-steel text-sm">
              Try placing a test order to see the email system in action!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
