import React, { useState, useEffect } from 'react';
import { runNetworkDiagnostics } from '../utils/networkDiagnostics';
import { logEnvironmentInfo } from '../lib/debugUtils';
import { supabase } from '../lib/supabase';

export function DebugPage() {
  const [diagnostics, setDiagnostics] = useState<Record<string, any> | null>(null);
  const [supabaseTest, setSupabaseTest] = useState<{ success: boolean; message: string; data?: any; error?: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [envInfo, setEnvInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    async function runDiagnostics() {
      setLoading(true);
      
      // Log environment info to console
      logEnvironmentInfo();
      
      // Collect environment info for display
      const env = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        online: navigator.onLine,
        url: window.location.href,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not set',
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        supabaseKeyLength: (import.meta.env.VITE_SUPABASE_ANON_KEY || '').length,
        buildTime: new Date().toISOString()
      };
      
      setEnvInfo(env);
      
      // Run network diagnostics
      const results = await runNetworkDiagnostics();
      setDiagnostics(results);
      
      // Test Supabase connection
      try {
        console.log('Testing Supabase connection from debug page...');
        const { data, error } = await supabase.from('properties').select('count').limit(1);
        
        if (error) {
          console.error('Supabase test failed:', error);
          setSupabaseTest({
            success: false,
            message: `Error: ${error.message}`,
            error
          });
        } else {
          console.log('Supabase test successful:', data);
          setSupabaseTest({
            success: true,
            message: 'Connection successful',
            data
          });
          
          // Check database schema using information_schema
          console.log('Checking database schema...');
          try {
            const { data: tablesData, error: tablesError } = await supabase
              .from('information_schema.tables')
              .select('table_name')
              .eq('table_schema', 'public');
              
            if (tablesError) {
              console.error('Error fetching tables:', tablesError);
            } else {
              console.log('Available tables:', tablesData);
              setEnvInfo(prev => ({ 
                ...prev, 
                availableTables: tablesData?.map((t: any) => t.table_name).join(', ') || 'None found' 
              }));
            }
          } catch (schemaError) {
            console.error('Error checking schema:', schemaError);
          }
        }
      } catch (error) {
        console.error('Unexpected error during Supabase test:', error);
        setSupabaseTest({
          success: false,
          message: `Exception: ${error instanceof Error ? error.message : String(error)}`,
          error
        });
      }
      
      setLoading(false);
    }
    
    runDiagnostics();
  }, []);

  const runTests = () => {
    setLoading(true);
    setDiagnostics(null);
    setSupabaseTest(null);
    
    // Re-run diagnostics
    runNetworkDiagnostics().then(results => {
      setDiagnostics(results);
      setLoading(false);
    });
    
    // Re-test Supabase
    Promise.resolve(supabase.from('properties').select('count').limit(1))
      .then(({ data, error }) => {
        if (error) {
          setSupabaseTest({
            success: false,
            message: `Error: ${error.message}`,
            error
          });
        } else {
          setSupabaseTest({
            success: true,
            message: 'Connection successful',
            data
          });
          
          // Check database schema
          Promise.resolve(supabase.from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public'))
            .then(({ data: schemaData, error: schemaError }) => {
              if (schemaError) {
                console.error('Error fetching schema:', schemaError);
              } else {
                console.log('Schema information:', schemaData);
                setEnvInfo(prev => ({ 
                  ...prev, 
                  availableTables: schemaData?.map((t: any) => t.table_name).join(', ') || 'None found' 
                }));
              }
            });
        }
      })
      .catch((error: unknown) => {
        setSupabaseTest({
          success: false,
          message: `Exception: ${error instanceof Error ? error.message : String(error)}`,
          error
        });
      });
  };

  return (
    <div className="container-wrapper">
      <h1 className="text-2xl font-bold mb-4">System Diagnostics</h1>
      
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Tests Again'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Information */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Environment Information</h2>
          {Object.entries(envInfo).map(([key, value]) => (
            <div key={key} className="mb-2">
              <span className="font-medium">{key}: </span>
              <span className="font-mono">{String(value)}</span>
            </div>
          ))}
        </div>
        
        {/* Supabase Test */}
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Supabase Connection Test</h2>
          {supabaseTest ? (
            <div>
              <div className={`mb-2 font-bold ${supabaseTest.success ? 'text-green-600' : 'text-red-600'}`}>
                {supabaseTest.success ? 'SUCCESS' : 'FAILED'}
              </div>
              <div className="mb-2">{supabaseTest.message}</div>
              {supabaseTest.data && (
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(supabaseTest.data, null, 2)}
                </pre>
              )}
              {supabaseTest.error && (
                <div className="mt-2">
                  <h3 className="font-semibold text-red-600">Error Details:</h3>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto text-red-600">
                    {JSON.stringify(supabaseTest.error, null, 2)}
                  </pre>
                  
                  {supabaseTest.error.code === 'PGRST200' && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h4 className="font-semibold text-yellow-700">Schema Relationship Error</h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        This error indicates a missing relationship between tables in your database schema.
                      </p>
                      <p className="text-sm text-yellow-700">
                        You may need to create foreign key relationships between tables or check if the tables exist.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Running test...</div>
          )}
        </div>
        
        {/* Network Diagnostics */}
        <div className="bg-white shadow rounded-lg p-4 md:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Network Diagnostics</h2>
          {diagnostics ? (
            <div>
              <h3 className="font-medium mb-2">Ping Tests:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(diagnostics.connectivity || {}).map(([domain, result]: [string, any]) => (
                  <div key={domain} className="border rounded p-3">
                    <div className="font-medium">{domain}</div>
                    <div className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? 'Success' : 'Failed'}
                    </div>
                    <div className="text-sm">
                      Time: {result.time?.toFixed(2) || 'N/A'}ms
                    </div>
                    {result.status && (
                      <div className="text-sm">
                        Status: {result.status}
                      </div>
                    )}
                    {result.error && (
                      <div className="text-sm text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Running diagnostics...</div>
          )}
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Console Output</h2>
        <p className="mb-2">
          Open your browser's developer console (F12 or Cmd+Option+I) to view detailed logs.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => console.log('Debug data:', { envInfo, diagnostics, supabaseTest })}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Log Debug Data to Console
          </button>
          
          <button
            onClick={async () => {
              console.log('Testing property_insights table...');
              const { data, error } = await supabase.from('property_insights').select('*').limit(1);
              console.log('Result:', { data, error });
              
              if (error && error.code === 'PGRST204') {
                console.log('Table property_insights does not exist. This explains the relationship error.');
              }
            }}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Test property_insights Table
          </button>
          
          <button
            onClick={async () => {
              console.log('Listing all tables in public schema...');
              const { data, error } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');
              console.log('Available tables:', { data, error });
            }}
            className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
          >
            List All Tables
          </button>
        </div>
      </div>
    </div>
  );
}
