# TradeMe Tracker Deployment Plan

## Pre-Deployment Checks

1. **Code Review**
   - Ensure all changes to `worker/src/index.ts` are complete
   - Verify all fixes to `worker/src/templates/indexTemplate.ts` are properly implemented
   - Check for any remaining TypeScript errors

2. **Local Testing**
   - Run `npm run dev` in the worker directory to test locally
   - Test the landing page loading
   - Test the login functionality with demo credentials
   - Test the dashboard display after login
   - Verify the debug endpoints work correctly

## Deployment Steps

1. **Build the Worker**
   ```bash
   cd /Users/rabble/code/experiments/trademe_tracker/worker
   npm run build
   ```

2. **Deploy the Worker**
   ```bash
   cd /Users/rabble/code/experiments/trademe_tracker/worker
   npm run deploy
   ```

3. **Verify Deployment**
   - Access the deployed worker URL
   - Test the landing page loading
   - Verify static assets are loading correctly
   - Check the debug endpoints for any issues

## Post-Deployment Testing

1. **Functionality Testing**
   - Test the landing page layout and styling
   - Click on "Sign in" to access the login page
   - Log in with demo credentials (demo@example.com / password123)
   - Verify redirection to the dashboard
   - Test the logout functionality
   - Verify session persistence with cookies

2. **Error Handling Testing**
   - Try to access the dashboard without logging in
   - Enter incorrect login credentials
   - Check the error messages
   - Test the debug endpoints for troubleshooting

3. **Performance Testing**
   - Measure initial page load time
   - Check responsiveness on different devices
   - Verify that static content is served quickly

## Rollback Plan

If any critical issues are discovered after deployment:

1. **Revert to Previous Version**
   ```bash
   cd /Users/rabble/code/experiments/trademe_tracker/worker
   git checkout HEAD~1 -- src/index.ts src/templates/indexTemplate.ts
   npm run build
   npm run deploy
   ```

2. **Verify Rollback**
   - Access the deployed worker URL
   - Verify that the site is functioning as before

## Next Development Iterations

1. **Connect to Real Authentication**
   - Integrate the fallback login with Supabase
   - Add real user authentication

2. **Enhance Dashboard**
   - Add real data integration
   - Improve UI and interactivity

3. **Add More Fallback Views**
   - Create fallback registration page
   - Add fallback property listing views

4. **Improve Error Handling**
   - Add more detailed error messages
   - Enhance debugging capabilities