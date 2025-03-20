/**
 * Progressive Login Testing Component
 * 
 * This component provides a UI for testing the progressive login system,
 * including edge cases, cross-device functionality, and performance metrics.
 */

import React, { useState, useEffect } from 'react';
import { 
  runTestSuite,
  exportTempUserData,
  importTempUserData
} from '../../lib/testing/progressiveLoginTester';
import { getTempUserId } from '../../lib/tempUserManager';
import useProgressiveAuth from '../../hooks/useProgressiveAuth';

const ProgressiveLoginTester: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [exportedData, setExportedData] = useState<string | null>(null);
  const [importData, setImportData] = useState('');
  const [importResults, setImportResults] = useState<any>(null);
  const [showExportData, setShowExportData] = useState(false);
  
  const { isAuthenticated, isTemporaryUser, tempUserId } = useProgressiveAuth();

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await runTestSuite();
      setTestResults(results);
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleExportData = async () => {
    try {
      const exportString = await exportTempUserData();
      setExportedData(exportString);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImportData = async () => {
    if (!importData) return;
    
    try {
      const results = await importTempUserData(importData);
      setImportResults(results);
      
      // Clear the input if successful
      if (results.success) {
        setImportData('');
      }
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  // Check if a temporary user exists on load
  const [hasTempUser, setHasTempUser] = useState(false);
  
  useEffect(() => {
    const checkTempUser = async () => {
      const id = getTempUserId();
      setHasTempUser(!!id);
    };
    
    checkTempUser();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Progressive Login System Tester</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
        <h3 className="text-lg font-medium mb-2">Current State</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Authentication Status:</p>
            <p className="font-medium">
              {isAuthenticated ? 'Authenticated User' : isTemporaryUser ? 'Temporary User' : 'No User'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">User ID:</p>
            <p className="font-medium break-all">
              {tempUserId || 'None'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Suite Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">System Tests</h3>
          <p className="text-sm text-gray-600 mb-4">
            Run comprehensive tests for storage, security, and performance of the progressive login system.
          </p>
          
          <button
            onClick={handleRunTests}
            disabled={isRunningTests}
            className="w-full mb-4 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isRunningTests ? 'Running Tests...' : 'Run Test Suite'}
          </button>
          
          {testResults && (
            <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-2 overflow-auto max-h-80">
              <h4 className="font-medium text-sm mb-2">Test Results:</h4>
              
              <div className="mb-3">
                <h5 className="font-medium text-xs">Storage Tests:</h5>
                <ul className="text-xs space-y-1 ml-4 list-disc">
                  <li>Cookies Enabled: <span className={testResults.storage.cookiesEnabled ? 'text-green-600' : 'text-red-600'}>
                    {testResults.storage.cookiesEnabled ? 'Yes' : 'No'}
                  </span></li>
                  <li>LocalStorage Enabled: <span className={testResults.storage.localStorageEnabled ? 'text-green-600' : 'text-red-600'}>
                    {testResults.storage.localStorageEnabled ? 'Yes' : 'No'}
                  </span></li>
                  <li>Fallback Working: <span className={testResults.storage.fallbackWorking ? 'text-green-600' : 'text-red-600'}>
                    {testResults.storage.fallbackWorking ? 'Yes' : 'No'}
                  </span></li>
                  <li>Storage Size: {testResults.storage.storageSize} bytes</li>
                </ul>
              </div>
              
              <div className="mb-3">
                <h5 className="font-medium text-xs">Security Tests:</h5>
                <ul className="text-xs space-y-1 ml-4 list-disc">
                  <li>Cookie Security: <span className={testResults.security.cookieSecure ? 'text-green-600' : 'text-yellow-600'}>
                    {testResults.security.cookieSecure ? 'Secure' : 'Not Secure (expected on localhost)'}
                  </span></li>
                  <li>ID Format Valid: <span className={testResults.security.idFormatValid ? 'text-green-600' : 'text-red-600'}>
                    {testResults.security.idFormatValid ? 'Yes' : 'No'}
                  </span></li>
                  <li>RLS Policies Working: <span className={testResults.security.rlsPoliciesWorking === true ? 'text-green-600' : 'text-red-600'}>
                    {testResults.security.rlsPoliciesWorking === true ? 'Yes' : 'No'}
                  </span></li>
                </ul>
              </div>
              
              <div className="mb-3">
                <h5 className="font-medium text-xs">Performance Tests:</h5>
                <ul className="text-xs space-y-1 ml-4 list-disc">
                  <li>Storage Size: {testResults.performance.storageSizeKb.toFixed(2)} KB</li>
                  <li>ID Generation Time: {testResults.performance.idGenerationTimeMs.toFixed(2)} ms</li>
                  <li>Merge Time Estimate: {testResults.performance.mergeTimeEstimateMs.toFixed(2)} ms</li>
                </ul>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs font-medium">
                  Cross-Device Ready: 
                  <span className={testResults.crossDeviceReady ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                    {testResults.crossDeviceReady ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Cross-Device Testing Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Cross-Device Testing</h3>
          <p className="text-sm text-gray-600 mb-4">
            Export your temporary user data to test on another device or browser, then import it back.
          </p>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={handleExportData}
                disabled={!isTemporaryUser}
                className="w-full mb-2 inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Export Temporary Data
              </button>
              
              {!isTemporaryUser && !hasTempUser && (
                <p className="text-xs text-red-600">
                  No temporary user detected. Browse as a temporary user first.
                </p>
              )}
              
              {exportedData && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-700">Export Code:</label>
                    <button
                      onClick={() => setShowExportData(!showExportData)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {showExportData ? 'Hide Code' : 'Show Code'}
                    </button>
                  </div>
                  
                  {showExportData ? (
                    <textarea
                      readOnly
                      value={exportedData}
                      className="w-full text-xs p-2 border border-gray-300 rounded"
                      rows={4}
                    />
                  ) : (
                    <div className="bg-gray-100 p-2 rounded text-center">
                      <p className="text-xs text-gray-600">Export code generated (click Show Code to view)</p>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(exportedData);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Import Temporary Data:
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste export code here..."
                className="w-full p-2 border border-gray-300 rounded mb-2"
                rows={3}
              />
              
              <button
                onClick={handleImportData}
                disabled={!importData}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Import Data
              </button>
              
              {importResults && (
                <div className={`mt-3 p-2 rounded text-sm ${importResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  {importResults.success ? (
                    <div>
                      <p className="font-medium text-green-800">Import Successful!</p>
                      <p className="text-xs text-green-700 mt-1">
                        Imported {importResults.summary.importedPins} pins and {importResults.summary.importedCollections} collections.
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium text-red-800">Import Failed. Please check the format and try again.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveLoginTester;