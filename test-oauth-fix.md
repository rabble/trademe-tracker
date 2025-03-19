# OAuth Integration Test Plan

## Prerequisites
- TradeMe account (sandbox or production)
- Application running on a domain that TradeMe can redirect to

## Test Cases

### 1. Basic OAuth Authentication

#### Test Steps:
1. Navigate to the Settings page
2. Click "Connect to TradeMe Sandbox" or "Connect to TradeMe Production"
3. You should be redirected to TradeMe login page
4. Log in with your TradeMe credentials
5. Authorize the application
6. You should be redirected back to the application settings page
7. Connection status should show "Successfully connected to TradeMe"

#### Validation Points:
- Check browser console for any errors
- Check localStorage for the presence of OAuth tokens
- Use the debug panel to verify the connection status

### 2. Property Watchlist Synchronization

#### Test Steps:
1. After successful OAuth authentication, click "Sync Watchlist"
2. Wait for the sync operation to complete
3. Check for success message showing number of properties synced
4. Navigate to the Dashboard or Properties page to see synchronized properties

#### Validation Points:
- Check browser console for detailed API logs
- Verify that properties appear in the application
- Check that property details match what's on TradeMe

### 3. Error Handling and Recovery

#### Test Steps:
1. Disconnect from TradeMe using the "Disconnect" button
2. Try to sync watchlist and verify proper error message is shown
3. Reconnect to TradeMe and try syncing again
4. Use the Debug panel (if available) to test connection directly

#### Validation Points:
- Error messages should be clear and helpful
- Application should not crash on errors
- Recovery from errors should work as expected

### 4. Edge Cases

#### Callback URL Handling
1. Try navigating directly to `/oauth-callback` with invalid parameters
2. Verify that you are redirected to the settings page with an error message

#### Token Expiry
1. If possible, test with expired tokens (may require waiting or manual modification)
2. Verify that the application detects expired tokens and prompts for re-authentication

#### Network Issues
1. Disable network connection and try synchronizing
2. Verify appropriate error handling

## Recording Results

For each test case, record:
- Test date and time
- Pass/Fail status
- Any error messages or unexpected behavior
- Screenshots of important steps

## Troubleshooting Tips

### Common Issues:
1. **Callback URL mismatch**: Ensure the callback URL in the application matches what's registered with TradeMe
2. **CORS issues**: Check for CORS errors in the console when making API requests
3. **Missing tokens**: Verify that OAuth tokens are properly stored in localStorage
4. **User ID issues**: Check if the user ID is correctly associated with properties

### Debug Tools:
- Use browser dev tools to inspect localStorage entries
- Check network requests and responses for API calls
- Use the in-app debug panel for connection testing
- Check console logs for detailed error information