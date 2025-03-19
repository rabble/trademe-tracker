# TradeMe OAuth and Synchronization Fix Plan

## Issues Identified

After analyzing the codebase, several issues were identified that are preventing the TradeMe OAuth authentication and data synchronization from working properly:

1. **OAuth Callback URL Mismatch**
   - Inconsistent callback URLs are used in different parts of the application
   - In `TradeMeDebugPanel.tsx`: `/settings/trademe-callback`
   - In `trademeAuthService.ts`: `/oauth-callback`
   - The route is defined in `routes.tsx` as `/settings/trademe-callback`

2. **Token Storage and Retrieval Issues**
   - OAuth tokens are stored in localStorage but may not be correctly retrieved
   - User ID retrieval in `trademePropertyService.ts` may be failing
   - Manual token management is needed through the debug panel

3. **TradeMe API Integration Problems**
   - API response structure may not match expected format
   - Extensive debugging code suggests issues with API responses
   - Error handling for API requests could be improved

4. **Data Synchronization Issues**
   - User ID association with properties may be missing
   - Database schema might require adjustments

## Action Plan

### 1. Fix OAuth Callback URL Consistency

- [ ] **Update callback URL in services**
  - Open `src/services/trademe/trademeAuthService.ts`
  - Modify line ~71 to use `/settings/trademe-callback` instead of `/oauth-callback`
  - Ensure this matches the route defined in `routes.tsx`

- [ ] **Add a redirect route for the old callback URL**
  - Add a new route in `routes.tsx` for `/oauth-callback` that redirects to `/settings/trademe-callback`
  - This ensures compatibility with any existing tokens that might use the old URL

### 2. Improve Token Storage and Retrieval

- [ ] **Fix user ID storage and retrieval**
  - Update `trademePropertyService.ts` line ~245 to use Supabase auth user ID
  - Add proper error handling if user ID is not available

- [ ] **Add token validation check**
  - Create a function to validate stored tokens before attempting API calls
  - Log detailed token status information to help with debugging

- [ ] **Add token refresh mechanism**
  - Implement logic to refresh expired tokens if possible
  - Add fallback for when refresh fails

### 3. Enhance TradeMe API Integration

- [ ] **Add robust error handling for API responses**
  - Improve error checking in `trademePropertyService.ts`
  - Handle different data structures that might be returned by the API

- [ ] **Update API request format**
  - Ensure proper headers and parameters are being sent
  - Validate against TradeMe API documentation

- [ ] **Add logging for failed API calls**
  - Add more detailed logging for failed API calls
  - Capture full request and response details for debugging

### 4. Fix Synchronization Logic

- [ ] **Update property mapping functions**
  - Modify `mapWatchlistItemToProperty()` in `propertyMappers.ts` to include user ID
  - Ensure all required fields for database schema are included

- [ ] **Improve error handling in sync process**
  - Add transaction-based approach to ensure data consistency
  - Implement partial success handling for batch operations

- [ ] **Add retry mechanism for failed sync operations**
  - Implement automatic retry for failed operations
  - Add backoff strategy to avoid overwhelming the API

### 5. Testing and Validation

- [ ] **Test OAuth flow end-to-end**
  - Verify authorization request
  - Check callback handling 
  - Validate token storage

- [ ] **Test API data retrieval**
  - Fetch watchlist items
  - Verify data structure matches expectations
  - Check error handling for edge cases

- [ ] **Test synchronization process**
  - Verify properties are properly stored in database
  - Check that changes are detected and recorded
  - Validate user association with properties

## Implementation Notes

1. **TradeMe API Documentation**
   - Refer to official TradeMe API documentation for correct endpoints and data formats
   - Ensure OAuth 1.0a implementation follows the specifications

2. **Local Storage Security**
   - Consider using more secure storage methods for tokens if possible
   - Implement proper encryption or obfuscation for sensitive data

3. **Debug Tooling**
   - Use the existing debug panel to verify changes
   - Add more detailed logging for OAuth and API operations
   - Consider adding a dedicated monitoring tool for API calls

4. **User Experience**
   - Add better error messages for users when OAuth fails
   - Provide clear instructions for reconnecting when tokens expire
   - Show sync status and progress indicators

By addressing these issues, the TradeMe OAuth integration and data synchronization should function correctly, allowing users to connect their accounts and sync their watchlist properties.