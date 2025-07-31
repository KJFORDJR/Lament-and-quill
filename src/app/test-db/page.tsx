'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function TestDbPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testDatabase();
  }, []);

  const testDatabase = async () => {
    setLoading(true);
    const results: any = {};

    try {
      console.log('Testing database connection...');

      // Test 1: Check connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      results.connection = {
        success: !connectionError,
        error: connectionError?.message,
        data: connectionTest
      };

      // Test 2: Check lament_fragments_entries table
      const { data: fragmentsData, error: fragmentsError } = await supabase
        .from('lament_fragments_entries')
        .select('*')
        .limit(5);
      
      results.lamentFragments = {
        success: !fragmentsError,
        error: fragmentsError?.message,
        count: fragmentsData?.length || 0,
        data: fragmentsData
      };

      // Test 3: Test insertion (if user is logged in)
      if (user) {
        const testFragment = {
          title: `Test Fragment ${Date.now()}`,
          content: 'This is a test fragment to verify database insertion works',
          author_id: user.id,
          status: 'published'
        };

        const { data: insertData, error: insertError } = await supabase
          .from('lament_fragments_entries')
          .insert(testFragment)
          .select();

        results.insertion = {
          success: !insertError,
          error: insertError?.message,
          data: insertData
        };

        // Clean up test data
        if (insertData && insertData[0]) {
          await supabase
            .from('lament_fragments_entries')
            .delete()
            .eq('id', insertData[0].id);
        }
      }

      setResults(results);
    } catch (err: any) {
      results.generalError = err.message;
      setResults(results);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        <p>Testing database connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test Results</h1>
      
      <div className="space-y-6">
        {/* Connection Test */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">1. Connection Test</h2>
          <p className={results.connection?.success ? 'text-green-400' : 'text-red-400'}>
            Status: {results.connection?.success ? 'SUCCESS' : 'FAILED'}
          </p>
          {results.connection?.error && (
            <p className="text-red-400">Error: {results.connection.error}</p>
          )}
        </div>

        {/* Lament Fragments Test */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">2. Lament Fragments Table</h2>
          <p className={results.lamentFragments?.success ? 'text-green-400' : 'text-red-400'}>
            Status: {results.lamentFragments?.success ? 'SUCCESS' : 'FAILED'}
          </p>
          <p>Records found: {results.lamentFragments?.count || 0}</p>
          {results.lamentFragments?.error && (
            <p className="text-red-400">Error: {results.lamentFragments.error}</p>
          )}
          {results.lamentFragments?.data && (
            <pre className="mt-2 p-2 bg-gray-800 text-xs overflow-x-auto">
              {JSON.stringify(results.lamentFragments.data, null, 2)}
            </pre>
          )}
        </div>

        {/* Insertion Test */}
        {user ? (
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">4. Insertion Test</h2>
            <p className={results.insertion?.success ? 'text-green-400' : 'text-red-400'}>
              Status: {results.insertion?.success ? 'SUCCESS' : 'FAILED'}
            </p>
            {results.insertion?.error && (
              <p className="text-red-400">Error: {results.insertion.error}</p>
            )}
            {results.insertion?.data && (
              <pre className="mt-2 p-2 bg-gray-800 text-xs overflow-x-auto">
                {JSON.stringify(results.insertion.data, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">4. Insertion Test</h2>
            <p className="text-yellow-400">Skipped - User not logged in</p>
          </div>
        )}

        {/* General Error */}
        {results.generalError && (
          <div className="p-4 border rounded">
            <h2 className="text-lg font-semibold mb-2">General Error</h2>
            <p className="text-red-400">{results.generalError}</p>
          </div>
        )}

        {/* Current User Info */}
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Current User Info</h2>
          {user ? (
            <pre className="p-2 bg-gray-800 text-xs overflow-x-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <p className="text-yellow-400">Not logged in</p>
          )}
        </div>

        <div className="pt-4">
          <button
            onClick={testDatabase}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retest Database
          </button>
        </div>
      </div>
    </div>
  );
}
