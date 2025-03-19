# TradeMe Property Tracker - Technical Specification

## Project Overview
A web application that automatically tracks favorited properties from TradeMe, primarily residential and land listings. The tool will use the TradeMe API to retrieve property data daily, track changes over time, store historical information (including images and descriptions), visualize properties on maps and in various formats, and provide AI-generated insights about the properties.

## Key Requirements

### Core Functionality
1. Automated tracking of favorited TradeMe property listings via API
2. Persistent storage of all property data, including after listings are removed from TradeMe
3. Change tracking for prices, listing methods, and status
4. Multiple visualization methods (cards, table, map)
5. Statistical analysis of property lifecycle
6. AI-powered insights using Claude 3.7 Sonnet

### Technical Stack
- **Frontend**: React with Vite, deployed on Cloudflare Pages
- **Backend**: Cloudflare Workers for API and data integration
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage for images
- **Authentication**: Supabase Auth
- **API Integration**: TradeMe API with OAuth
- **Visualization**: Recharts for charts, React-Leaflet with OpenStreetMap
- **Styling**: Tailwind CSS
- **AI Integration**: Claude 3.7 Sonnet

## Detailed Architecture

### Frontend Architecture
The React application will use a component-based architecture with the following main sections:

1. **Authentication**
   - Login/Register page using Supabase Auth UI components
   - Protected routes for authenticated users

2. **Property Dashboard**
   - Card Grid View (default)
   - Data Table View
   - Map View
   - Insights View

3. **State Management**
   - React Context for global state
   - React Query for server state and caching

4. **Routing**
   - React Router for navigation between views
   - URL parameters for filters and property details

### Backend Services

#### Cloudflare Workers

1. **API Service Worker**
   - Handles authenticated requests from the frontend
   - Communicates with Supabase for data storage and retrieval
   - Processes property data before sending to frontend
   - Validates incoming requests

2. **TradeMe API Worker**
   - Triggered by CRON jobs daily
   - Integrates with TradeMe API via OAuth
   - Processes and compares data to detect changes
   - Downloads and uploads images to Supabase Storage
   - Updates database with new information
   - Triggers AI analysis when new data is found

#### Supabase Services

1. **Database** - Follows the schema outlined below
2. **Authentication** - Handles user registration, login, and session management
3. **Storage** - Stores property images with organized folder structure

## Database Schema

### properties
```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trademe_id VARCHAR(255) UNIQUE NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    suburb VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    bedrooms INTEGER,
    bathrooms INTEGER,
    land_area INTEGER,
    floor_area INTEGER,
    year_built INTEGER,
    first_seen_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_status VARCHAR(50) DEFAULT 'active',
    user_notes TEXT,
    ai_insights_summary TEXT,
    favorite_date TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### property_images
```sql
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url VARCHAR(1024) NOT NULL,
    storage_path VARCHAR(1024),
    sort_order INTEGER,
    caption TEXT,
    first_seen_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### property_listings
```sql
CREATE TABLE property_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    price INTEGER,
    price_display_text VARCHAR(255),
    listing_type VARCHAR(100),
    description TEXT,
    agent_name VARCHAR(255),
    agency_name VARCHAR(255),
    end_date TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT FALSE,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### property_views
```sql
CREATE TABLE property_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    view_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## TradeMe API Implementation

### TradeMe API Integration Process
1. **Authentication with TradeMe API**
   - Implement OAuth authentication flow
   - Obtain and refresh API access tokens
   - Handle authentication errors gracefully

2. **Data Retrieval**
   - Fetch list of all favorited properties via API
   - For each property:
     - Retrieve complete property details via API
     - Get all property images via API endpoints
     - Fetch listing status and price details
     - Store agent and listing information

3. **Change Detection**
   - Compare API data with existing database records
   - Identify changes in price, description, status, or listing method
   - Record all changes in the `property_listings` table with a new snapshot

4. **Image Handling**
   - Download property images from URLs provided by the API
   - Upload to Supabase Storage with organized naming (property_id/date/image_number)
   - Store both original URL and storage path

### CRON Job Configuration
- Schedule: Daily at 3:00 AM NZT (low traffic time for TradeMe API)
- Timeout: 15 minutes maximum execution time
- Error handling: Notification system for API failures

## AI Integration

### Claude 3.7 Sonnet Implementation
1. **Batch Analysis Process**
   - Triggered after scraping completes and changes are detected
   - Processes properties in batches to avoid rate limits

2. **Analysis Types**
   - **Property Summary**: Generate condensed highlights of each property
   - **Change Analysis**: Interpret significance of price or listing changes
   - **Market Comparison**: Compare property to similar listings
   - **Investment Potential**: Assess potential as investment property
   - **Pattern Recognition**: Identify trends in favorited properties

3. **Data Structure for AI Insights**
   - Store summarized insights in the main property record
   - Store detailed analysis as JSON in a dedicated field
   - Include confidence scores for each insight

4. **Prompt Engineering**
   - Develop structured prompts for consistent analysis
   - Include property data, historical trends, and location information
   - Specify output format for easy parsing

## Frontend Implementation

### Authentication Flow
1. User navigates to site
2. Supabase Auth UI handles login/registration
3. JWT token stored in browser
4. Token validated by Cloudflare Worker for API access

### User Interface Components

#### Progressive Enhancement
- Static HTML fallback for all critical pages
- Non-JavaScript authentication with cookie-based sessions
- Detailed error diagnostics and reporting
- Demo mode with sample data and credentials (demo@example.com / password123)
- Responsive design in both React app and HTML fallbacks
- Graceful degradation when JavaScript fails to load

#### Navigation
- Main navigation bar with view toggles
- Filter sidebar for refining property list
- Search functionality for finding specific properties

#### Card Grid View
- Responsive grid of property cards
- Visual indicators for status and changes
- Quick action buttons for each property
- Infinite scroll with lazy loading

#### Data Table View
- Sortable columns for all property attributes
- Expandable rows for additional details
- Bulk actions for multiple properties
- Export functionality for data

#### Map View
- Clustering for properties in same area
- Custom markers indicating property type
- Popup details on marker click
- Filter controls integrated with map

#### Insights Dashboard
- Summary statistics at the top
- Charts showing portfolio trends
- AI-generated insights in card format
- Time-based filtering controls

### Filtering System
The filtering system will include options for:
- Price range
- Property type (house, apartment, land, etc.)
- Location (region, city, suburb)
- Bedrooms and bathrooms
- Land and floor area
- Days on market
- Status (active, under offer, sold)
- Listing type (auction, price by negotiation, etc.)
- Custom tags (if implemented)

### Data Visualization Components

#### Property Statistics
- Days on market chart
- Price history timeline
- Comparable property ranges
- Method of sale distribution

#### Market Analysis
- Region price trends
- Sale method effectiveness
- Price per square meter comparisons
- Time on market averages

## API Endpoints

### Property Management
- `GET /api/properties` - List all properties with pagination and filtering
- `GET /api/properties/:id` - Get single property with full details
- `PATCH /api/properties/:id` - Update user notes or custom fields
- `DELETE /api/properties/:id` - Archive a property (not physically delete)

### Analytics
- `GET /api/analytics/summary` - Get portfolio summary statistics
- `GET /api/analytics/changes` - Get recent property changes
- `GET /api/analytics/insights` - Get AI-generated insights

### Image Handling
- `GET /api/images/:propertyId` - Get all images for a property
- `GET /api/images/history/:propertyId` - Get historical images

## Error Handling Strategy

### Frontend Error Handling
1. **API Request Errors**
   - Implement React Query error boundaries
   - Provide user-friendly error messages
   - Automatic retry for transient errors
   - Graceful degradation when services are unavailable

2. **Rendering Errors**
   - Use React Error Boundaries for component-level errors
   - Fallback UI for failed components
   - Error reporting to monitoring service
   
3. **Progressive Enhancement Error Handling**
   - Static HTML fallback when JavaScript fails to load
   - Detailed debug pages with comprehensive diagnostics
   - Client-side error detection and reporting
   - Environment validation with informative error messages
   - Cookie-based session persistence for authentication
   - Specific error handling for missing static assets

### Backend Error Handling
1. **API Errors**
   - Retry mechanism for failed API requests
   - Circuit breaker pattern for repeatedly failing operations
   - Logging of all API failures
   - Partial success handling (some properties succeeded, others failed)

2. **Database Errors**
   - Transaction management for atomic operations
   - Connection pool management
   - Query timeout handling
   - Retry mechanism for transient errors

3. **Static Content Errors**
   - Fallback content serving for missing assets
   - Content-type detection and appropriate headers
   - Default placeholder responses for critical assets
   - Comprehensive debugging endpoints (/debug/static-report)

4. **General Error Strategy**
   - Structured error logging
   - Centralized error tracking
   - Alert system for critical failures
   - Detailed debugging information for troubleshooting

## Performance Considerations

### Frontend Performance
1. **Optimization Techniques**
   - Code splitting for route-based loading
   - Lazy loading for images and components
   - Memoization of expensive calculations
   - Virtualization for long lists

2. **Data Management**
   - Client-side caching with React Query
   - Pagination for large data sets
   - Debouncing for search and filter inputs
   - Optimistic UI updates for better perceived performance

### Backend Performance
1. **Database Optimization**
   - Proper indexing on frequently queried fields
   - Query optimization for complex analytics
   - Connection pooling
   - Caching for frequent queries

2. **API Optimization**
   - Parallel processing where appropriate
   - Rate limiting to comply with TradeMe API limits
   - Incremental updates when possible
   - Prioritization of critical data

## Security Considerations

### Authentication Security
- JWT token validation on all API endpoints
- CSRF protection
- Short-lived access tokens with refresh mechanism
- Secure cookie handling

### Data Security
- Input validation on all API endpoints
- Parameterized queries to prevent SQL injection
- Validation of API response data
- XSS protection for user-generated content

### Infrastructure Security
- HTTPS for all communications
- Restricted Supabase access by IP (if possible)
- Least privilege principle for service accounts
- Regular security audits

## Testing Strategy

### Frontend Testing
1. **Unit Tests**
   - Component rendering tests
   - State management tests
   - Utility function tests

2. **Integration Tests**
   - User flow testing
   - API integration tests
   - Filter and search functionality

3. **End-to-End Tests**
   - Critical user journeys
   - Cross-browser compatibility
   - Responsive design testing

### Backend Testing
1. **Unit Tests**
   - API endpoint validation
   - Business logic functions
   - Data transformation functions

2. **Integration Tests**
   - Database interaction tests
   - External service integration tests
   - Authentication flow tests

3. **API Integration Tests**
   - Mock TradeMe API response tests
   - Change detection tests
   - Error handling tests

### Performance Testing
- Load testing for API endpoints
- Memory usage monitoring
- Response time benchmarking

## Deployment Pipeline

### Frontend Deployment
1. GitHub repository for source code
2. CI/CD pipeline with GitHub Actions
3. Automated testing before deployment
4. Deployment to Cloudflare Pages
5. Preview deployments for pull requests

### Backend Deployment
1. Cloudflare Workers deployment via Wrangler
2. Staged deployment process (dev, staging, production)
3. Database migration handling
4. Rollback capability for failed deployments

## Monitoring and Analytics

### Application Monitoring
- Error tracking with Sentry or similar service
- Performance monitoring
- Uptime checks
- Alerting for critical issues

### User Analytics
- Basic usage statistics
- Feature adoption tracking
- Performance metrics
- Error rate monitoring

## Development Timeline and Milestones

### Phase 1: Foundation (2-3 weeks)
- Set up project infrastructure
- Implement authentication
- Create basic database schema
- Develop initial TradeMe API integration
- Build basic UI components

### Phase 2: Core Features (3-4 weeks)
- Complete TradeMe API integration
- Implement change tracking
- Develop visualization components
- Create filtering system
- Build map integration

### Phase 3: AI Integration (2-3 weeks)
- Implement Claude 3.7 Sonnet integration
- Develop AI analysis features
- Create insights dashboard
- Refine analytics capabilities

### Phase 4: Refinement (2-3 weeks)
- Performance optimization
- UI/UX improvements
- Comprehensive testing
- Documentation
- Bug fixes and refinements

## Future Enhancements (Backlog)
1. Mobile application or PWA functionality
2. Email notifications for significant changes
3. Expanded AI insights and recommendations
4. Integration with other property data sources
5. Export functionality for reports
6. Social sharing capabilities
7. Collaborative features for teams
8. Advanced investment analysis tools

## Technical Constraints and Considerations
1. TradeMe may change their API structure, requiring integration updates
2. API usage may encounter rate limiting or quota restrictions
3. Claude 3.7 API costs should be monitored
4. Cloudflare Workers have execution time limits
5. Image storage costs will increase over time
6. TradeMe API may have usage restrictions or costs

## Appendix

### Required Dependencies
- React
- Vite
- React Router
- React Query
- Tailwind CSS
- Recharts
- React-Leaflet
- Supabase JS Client
- OAuth Library
- Axios/Fetch API wrapper
- Date-fns for date manipulation
- Testing libraries (Jest, React Testing Library)

### Useful Resources
- Supabase Documentation
- Cloudflare Workers Documentation
- TradeMe API Documentation
- React and Vite Documentation
- OAuth 2.0 Implementation Guides
