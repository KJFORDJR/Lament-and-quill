'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestRegister() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');
    
    try {
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      if (error) {
        setResult(`Error: ${error.message}`);
        return;
      }
      
      setResult(`✅ Connection successful! Profiles table has ${data} records.`);
    } catch (err) {
      setResult(`❌ Exception: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    setResult('Testing registration...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testUsername = `testuser${Date.now()}`;
    
    try {
      // Test registration
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          data: {
            username: testUsername,
          }
        }
      });

      if (error) {
        setResult(`Registration Error: ${error.message}`);
        return;
      }

      if (data.user) {
        setResult(`✅ Registration successful! User ID: ${data.user.id}`);
        
        // Try to create profile
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: testUsername,
              user_role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            setResult(prev => prev + `\n❌ Profile Error: ${profileError.message}`);
          } else {
            setResult(prev => prev + `\n✅ Profile created successfully!`);
          }
        } catch (profileErr) {
          setResult(prev => prev + `\n❌ Profile Exception: ${profileErr}`);
        }
      }
    } catch (err) {
      setResult(`❌ Registration Exception: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full gothic-container p-8 rounded-lg tech-border">
        <h1 className="text-2xl font-bold text-gothic-silver mb-6">Registration Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full bg-gothic-crimson hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Test Database Connection
          </button>
          
          <button
            onClick={testRegistration}
            disabled={loading}
            className="w-full bg-gothic-steel hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Test Registration Process
          </button>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-black border border-gothic-steel rounded">
            <pre className="text-gothic-silver text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
