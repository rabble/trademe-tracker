import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PropertyDbService } from '../../services/property/propertyDbService';

export function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tables, setTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check available tables on component mount
    checkTables();
  }, []);

  const checkTables = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (error) throw error;
      
      const tableNames = data.map((t: any) => t.table_name);
      setTables(tableNames);
      setError(null);
    } catch (err) {
      console.error('Error checking tables:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setIsLoading(true);
      setTestResult('');
      setError(null);
      
      const { data, error } = await supabase.from('properties').select('count');
      
      if (error) throw error;
      
      setTestResult(`Connection successful! Properties count: ${data[0]?.count || 0}`);
    } catch (err) {
      console.error('Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTestResult('Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestProperty = async () => {
    try {
      setIsLoading(true);
      setTestResult('');
      setError(null);
      
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) {
        setError('User not authenticated');
        return;
      }
      
      const testProperty = {
        title: 'Test Property',
        address: '123 Test Street, Wellington',
        price: 750000,
        bedrooms: 3,
        bathrooms: 2,
        status: 'active' as const,
        property_type: 'house' as const,
        description: 'This is a test property created to verify Supabase integration',
        user_id: userId
      };
      
      const newProperty = await PropertyDbService.createProperty(testProperty);
      
      setTestResult(`Test property created successfully! ID: ${newProperty.id}`);
      
      // Add a test image
      await PropertyDbService.addPropertyImage({
        property_id: newProperty.id,
        url: 'https://via.placeholder.com/800x600?text=Test+Property',
        is_primary: true
      });
      
      // Record a test change
      await PropertyDbService.recordPropertyChange({
        property_id: newProperty.id,
        change_type: 'price',
        old_value: '800000',
        new_value: '750000',
        description: 'Test price change'
      });
      
    } catch (err) {
      console.error('Error creating test property:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Supabase Integration Test</h2>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Available Tables:</h3>
        {isLoading && <p>Loading tables...</p>}
        {tables.length > 0 ? (
          <ul className="list-disc pl-5">
            {tables.map(table => (
              <li key={table}>{table}</li>
            ))}
          </ul>
        ) : (
          <p>No tables found</p>
        )}
        <button 
          onClick={checkTables}
          className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Refresh Tables
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Connection
          </button>
          
          <button
            onClick={createTestProperty}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Create Test Property
          </button>
        </div>
        
        {isLoading && <p className="text-gray-500">Loading...</p>}
        
        {testResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">{testResult}</p>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
