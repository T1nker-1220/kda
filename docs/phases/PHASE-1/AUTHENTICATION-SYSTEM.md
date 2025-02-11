# Authentication System Documentation

## Overview
This document outlines the implemented authentication system and Row Level Security (RLS) policies for Kusina de Amadeo's food ordering system. The system uses Supabase with Google OAuth as the exclusive authentication method.

## Implemented Features

### 1. Authentication Implementation [✅]
- **Supabase Client Setup**
  - Configured Supabase client with proper environment variables
  - Implemented auth context for state management
  - Set up authentication hooks for reusability
  - Added comprehensive error handling
  - Ensured SSR compatibility

### 2. Authentication UI [✅]
- Implemented responsive auth layout with dark mode support
- Created loading states and spinners
- Added error handling components
- Integrated Google OAuth button
- Implemented OAuth popup handling
- Added welcome messages and notifications
- Created error pages
- Integrated Toaster notifications
- Completed full authentication flow testing

### 3. Auth Flow Implementation [✅]
- Implemented secure sign-in logic
- Added robust auth state handling
- Configured proper error management
- Set up protected route redirects
- Updated middleware for role-based access
- Tested all protected routes

## Row Level Security (RLS) Policies

### 1. User Table Policies
```sql
-- Admins have full access
POLICY "Admins can view all data" ON "User"
FOR ALL USING (auth.is_admin() = true);

-- Users can update their own data
POLICY "Users can update own data" ON "User"
FOR UPDATE USING (id = auth.uid()::text);

-- Users can view their own data
POLICY "Users can view own data" ON "User"
FOR SELECT USING ((id = auth.uid()::text) OR (auth.is_admin() = true));
```

### 2. Order Management Policies
```sql
-- Admin order management
POLICY "Admins can manage orders" ON "Order"
FOR ALL USING (auth.is_admin() = true);

-- User order creation
POLICY "Users can create orders" ON "Order"
FOR INSERT WITH CHECK (true);

-- User order viewing
POLICY "Users can view own orders" ON "Order"
FOR SELECT USING ((userId = auth.uid()::text) OR (auth.is_admin() = true));
```

### 3. Product Management Policies
```sql
-- Admin product management
POLICY "Admins can manage products" ON "Product"
FOR ALL USING (auth.is_admin() = true);

-- Public product viewing
POLICY "Products are viewable by everyone" ON "Product"
FOR SELECT USING (true);
```

### 4. Payment Policies
```sql
-- Admin payment management
POLICY "Admins can manage payments" ON "Payment"
FOR ALL USING (auth.is_admin() = true);

-- User payment creation
POLICY "Users can create payments" ON "Payment"
FOR INSERT WITH CHECK (true);

-- User payment viewing
POLICY "Users can view own payments" ON "Payment"
FOR SELECT USING (EXISTS (
    SELECT 1 FROM "Order"
    WHERE "Order".id = "Payment".orderId
    AND "Order".userId = auth.uid()::text
) OR (auth.is_admin() = true));
```

## Security Features

### 1. Role-Based Access Control
- Default role assignment: 'CUSTOMER'
- Admin role with elevated privileges
- Role verification in middleware
- Protected route implementation

### 2. Data Access Security
- Row-level security for all tables
- User data isolation
- Admin-only management features
- Public read-only access where appropriate

### 3. API Security
- Protected API routes
- Role-based endpoint access
- Secure session management
- Token-based authentication

## Best Practices Implemented

1. **Authentication Flow**
   - Secure token handling
   - Protected route middleware
   - Error boundary implementation
   - Loading state management

2. **User Management**
   - Secure role assignment
   - Profile data protection
   - Session management
   - Access control enforcement

3. **Security Measures**
   - RLS policy enforcement
   - Data isolation
   - Role verification
   - Secure API access

## Testing & Verification

1. **Authentication Testing**
   - Sign-in flow verification
   - Protected route testing
   - Role-based access testing
   - Error handling verification

2. **Security Testing**
   - RLS policy verification
   - Access control testing
   - Data isolation testing
   - API security testing

## Maintenance & Updates

1. **Regular Tasks**
   - Monitor authentication logs
   - Review access patterns
   - Update security policies
   - Maintain documentation

2. **Security Updates**
   - Regular policy reviews
   - Access pattern monitoring
   - Security patch application
   - Documentation updates

## Table of Contents
1. [Architecture](#architecture)
2. [Core Components](#core-components)
3. [Authentication Flow](#authentication-flow)
4. [Security Measures](#security-measures)
5. [Implementation Details](#implementation-details)
6. [Lessons Learned](#lessons-learned)
7. [Best Practices](#best-practices)

## Architecture

### System Design
- **Authentication Provider**: Supabase Auth with Google OAuth
- **Session Management**: SSR-compatible cookie-based sessions
- **Role Management**: Role-based access control (ADMIN/CUSTOMER)
- **Client Architecture**: Separate client/server configurations

### File Structure
```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts    # Client-side Supabase configuration
│   │   └── server.ts    # Server-side Supabase configuration
│   └── auth-context.tsx # Authentication context provider
├── app/
│   ├── (auth)/
│   │   └── login/      # Login page with Google OAuth
│   └── auth/
│       └── callback/    # OAuth callback handler
└── middleware.ts       # Authentication middleware
```

## Core Components

### 1. Supabase Client Configuration
- Separate client/server configurations for SSR compatibility
- Environment variable validation
- Type-safe client creation
- SSR-safe cookie handling

### 2. Authentication Context
- Global auth state management
- Role-based access control
- Session persistence
- Google OAuth integration
- Error handling

### 3. Protected Routes
- Route-based authentication
- Role-based access control
- Error handling
- Proper redirects

## Authentication Flow

1. **Login Process**
   - User clicks Google OAuth button
   - Redirects to Google consent screen
   - Handles OAuth callback
   - Sets up user role
   - Redirects to dashboard

2. **Session Management**
   - Cookie-based session storage
   - Automatic session refresh
   - Proper error handling
   - SSR compatibility

3. **Role Assignment**
   - Default role: CUSTOMER
   - Admin role assignment through metadata
   - Role-based route protection
   - Access control in middleware

## Security Measures

### 1. Authentication Security
- PKCE flow for OAuth
- Secure cookie handling
- Environment variable validation
- XSS protection

### 2. Route Protection
- Protected route configuration
- Role-based access control
- Error boundary implementation
- Secure redirects

### 3. Error Handling
- Comprehensive error messages
- Proper error logging
- User-friendly notifications
- Recovery mechanisms

## Implementation Details

### 1. Client-Side Configuration
\`\`\`typescript
// src/lib/supabase/client.ts
export const createBrowserSupabaseClient = () => {
  return createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: cookieHandlers // SSR-safe cookie handling
    }
  )
}
\`\`\`

### 2. Server-Side Configuration
\`\`\`typescript
// src/lib/supabase/server.ts
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerClientBase<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        get: name => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: (name, options) => cookieStore.delete({ name, ...options })
      }
    }
  )
}
\`\`\`

### 3. Authentication Context
\`\`\`typescript
// src/lib/auth-context.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ... state management

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: \`\${window.location.origin}/auth/callback\`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        },
        scopes: 'email profile'
      }
    })
    // ... error handling
  }

  // ... provider implementation
}
\`\`
