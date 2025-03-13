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
    supabase.from('properties').select('count').limit(1).then(({ data, error }) => {
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
      }
    }).catch((error: unknown) => {
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
        <button
          onClick={() => console.log('Debug data:', { envInfo, diagnostics, supabaseTest })}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Log Debug Data to Console
        </button>
      </div>
    </div>
  );
}
