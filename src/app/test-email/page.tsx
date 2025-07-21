'use client';

import { useState } from 'react';

export default function EmailTestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const testEmailSystem = async () => {
    if (!testEmail) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);
    setTestResult('');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResult('✅ Test email sent successfully! Check your inbox.');
      } else {
        setTestResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="gothic-container p-8">
          <h1 className="text-4xl font-gothic font-bold text-gothic-silver mb-6">
            Email System Test
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-gothic-steel text-sm font-medium mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter your email to test the system"
                className="w-full bg-gothic-dark-gray border border-gothic-dark-gray rounded-md px-4 py-3 text-white focus:outline-none focus:border-gothic-silver"
              />
            </div>
            
            <button
              onClick={testEmailSystem}
              disabled={loading}
              className="cyber-button w-full py-4 disabled:opacity-50"
            >
              {loading ? 'Sending Test Email...' : 'Send Test Email'}
            </button>
            
            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.includes('✅') ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
              }`}>
                {testResult}
              </div>
            )}
            
            <div className="mt-8 p-4 bg-gothic-dark-gray/20 rounded-lg">
              <h3 className="text-gothic-silver font-medium mb-2">Email Configuration Status:</h3>
              <ul className="text-gothic-steel text-sm space-y-1">
                <li>✅ Resend API configured</li>
                <li>✅ Domain: lamentandquill.com</li>
                <li>✅ From email: support@lamentandquill.com</li>
                <li>✅ Admin notifications: support@lamentandquill.com</li>
              </ul>
            </div>
            
            <div className="mt-8 p-4 bg-blue-600/20 rounded-lg border border-blue-600/30">
              <h3 className="text-blue-400 font-medium mb-2">How It Works:</h3>
              <p className="text-gothic-steel text-sm">
                When a customer places an order, the system automatically sends:
              </p>
              <ul className="text-gothic-steel text-sm mt-2 space-y-1">
                <li>• <strong>Customer confirmation</strong> - Beautiful HTML email with order details</li>
                <li>• <strong>Admin notification</strong> - Detailed order info for processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
