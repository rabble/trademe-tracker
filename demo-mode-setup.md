# Demo Mode Configuration Guide

## Overview
This document explains how to enable or disable the demo mode in TradeMe Tracker. Demo mode allows users to sign in with predefined test credentials for demonstration purposes.

## How Demo Mode Works

Demo mode provides:
1. A simple way to demonstrate the application without real credentials
2. A fallback for when Supabase authentication is unavailable
3. A mechanism for onboarding new users

By default, demo mode is **enabled** to ensure the application has a fallback method of authentication.

### Demo Access Options

When demo mode is enabled, users can access the demo in three ways:

1. **Quick Demo Button** - On the landing page, a "Try Demo" button provides direct access to the demo dashboard without requiring any login

2. **Quick Demo via Login Page** - On the login page, an "Enter Quick Demo" button grants instant access to the dashboard 

3. **Demo Credentials** - Login with demo credentials:
   - Email: `demo@example.com`
   - Password: `password123`

All three methods create a demo session with the same level of access.

## Configuring Demo Mode

### Option 1: Environment Variable

You can control demo mode by setting the `DEMO_MODE_ENABLED` environment variable in your Cloudflare Worker:

```toml
# In wrangler.toml
[vars]
DEMO_MODE_ENABLED = "false"  # Disable demo mode
```

Or you can set it to `"true"` to explicitly enable it (though this is the default).

### Option 2: Cloudflare Dashboard

1. Log in to the Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Select your TradeMe Tracker worker
4. Go to Settings > Variables
5. Add an environment variable:
   - Variable name: `DEMO_MODE_ENABLED`
   - Value: `false` (to disable) or `true` (to enable)

## Testing Demo Mode Status

When demo mode is enabled:
1. The login form displays a message indicating demo mode is active
2. Login errors suggest using demo credentials
3. Demo credentials (demo@example.com / password123) work successfully
4. The dashboard shows a "Demo" indicator

When demo mode is disabled:
1. No demo mode message appears on the login form
2. Login errors don't mention demo credentials
3. Demo credentials are rejected
4. Only real Supabase authentication works

## Security Considerations

- In production environments, consider disabling demo mode for enhanced security
- When demonstration is required, enable it temporarily
- Demo access is limited to basic features and does not expose sensitive data
- Demo sessions expire after 1 hour (3600 seconds)

## Troubleshooting

If you change the demo mode setting but don't see changes:
1. Clear your browser's cache and cookies
2. Verify the environment variable is correctly set
3. Redeploy the worker to ensure changes take effect
4. Check the console logs for any configuration issues

## Best Practices

- **Development/Testing**: Enable demo mode for easier testing
- **Production**: Disable demo mode unless specifically needed
- **User Onboarding**: Enable temporarily when giving demonstrations
- **No Supabase Access**: Keep enabled as a fallback when Supabase is not accessible