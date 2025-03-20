# Progressive Login System Implementation

## Overview

The progressive login system allows users to interact with the application without requiring immediate registration. It provides a frictionless entry point for users while encouraging account creation at strategic moments.

## Key Components

### 1. Temporary User Management (`tempUserManager.ts`)
- Handles generation and management of temporary user IDs
- Uses cookies with localStorage fallback for persistence
- Provides utility functions for creating, retrieving, and validating temporary IDs

### 2. Database Schema
- `temp_users` table for storing temporary user information
- Support for temp user references in `property_pins` and `property_collections` tables
- Row-level security policies for proper access control
- Data merging function for transitioning to permanent accounts

### 3. Authentication Hook (`useProgressiveAuth.ts`)
- Provides a unified interface for both temporary and permanent users
- Handles merging of temporary data when users create permanent accounts
- Offers feature gating for limiting certain features to registered users

### 4. Data Access Hooks
- `usePropertyPins.ts` - Manages property pins for both user types
- `usePropertyCollections.ts` - Handles collections for both user types

### 5. UI Components
- `LoginPromptBanner.tsx` - Shown after first pin action
- `MultiplePinsReminder.tsx` - Shown when multiple pins are saved
- `FeatureGatingModal.tsx` - Appears when users attempt to access restricted features
- `CollectionCreatePrompt.tsx` - For creating and organizing property collections
- `EmailCaptureForm.tsx` - Lightweight form for partial registration

### 6. Analytics Tracking
- Conversion events for temporary to permanent users
- Feature usage tracking
- Pin/action counting before registration
- Drop-off point identification in the conversion funnel

## Usage

### Accessing Current User
```tsx
import useProgressiveAuth from '../hooks/useProgressiveAuth';

function MyComponent() {
  const { 
    isAuthenticated,    // Is this a permanent user?
    isTemporaryUser,    // Is this a temporary user?
    effectiveUserId,    // The current user ID (temp or permanent)
    needsUpgrade        // Function to check if a feature is gated
  } = useProgressiveAuth();
  
  // Use the hook to determine what features to show
}
```

### Working with Pins and Collections
```tsx
import { usePropertyPins, usePropertyCollections } from '../hooks/property';

function PropertyComponent({ propertyId }) {
  // Pins work with both temporary and permanent users
  const { isPinned, togglePin } = usePropertyPins();
  const { collections, createCollection } = usePropertyCollections();
  
  // These functions work transparently with both user types
}
```

### Showing Login Prompts
```tsx
import { LoginPromptBanner, FeatureGatingModal } from '../components/auth';

function MyComponent() {
  const [showLoginBanner, setShowLoginBanner] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  
  // Show login prompt after a user action
  const handlePin = () => {
    pinProperty(id);
    setShowLoginBanner(true);
  };
  
  // Show feature gating modal when attempting restricted action
  const handleComment = () => {
    if (needsUpgrade('comment')) {
      setShowFeatureModal(true);
    } else {
      // Allow commenting
    }
  };
  
  return (
    <>
      {/* Your component content */}
      
      <LoginPromptBanner 
        action="pin"
        onDismiss={() => setShowLoginBanner(false)}
      />
      
      <FeatureGatingModal
        feature="comment"
        isOpen={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
      />
    </>
  );
}
```

## Conversion Points

The system encourages account creation at these strategic moments:

1. **After first pin** - Basic notification banner
2. **Multiple pins collected** - More prominent reminder 
3. **Feature limitations** - Modal for gated features (comments, notes, sharing)
4. **Email capture** - Partial registration for cross-device access
5. **Collection creation** - Encourages organization and persistence

## Analytics

All key interactions are tracked to optimize conversion:

- Temporary user creation
- Pin and collection actions
- Feature gating events
- Login prompt displays and responses
- Account creation events
- Data merging operations

## Security Considerations

- Temporary data is stored securely with row-level security
- No sensitive information is stored in cookies/localStorage
- Data is properly merged during account creation
- Expired temporary user data is automatically cleaned up