# Authentication System Documentation

## Overview
This document details the implementation of the authentication system for Kusina de Amadeo, focusing on Google OAuth integration with Supabase, role-based access control, and SSR compatibility.

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
\`\`\`

## Lessons Learned

### Critical Issues
1. **SSR Compatibility**
   - Issue: Browser APIs accessed during server rendering
   - Solution: Implemented environment checks
   - Prevention: Created separate client/server configurations

2. **Authentication Flow**
   - Issue: PKCE flow implementation challenges
   - Solution: Simplified OAuth implementation
   - Impact: Improved reliability and user experience

3. **Cookie Handling**
   - Issue: Cookie management in SSR context
   - Solution: Implemented SSR-safe cookie handlers
   - Prevention: Created reusable cookie utilities

## Best Practices

### 1. Code Organization
- Separate client/server configurations
- Clear component responsibilities
- Proper type definitions
- Comprehensive error handling

### 2. Security
- Environment variable validation
- Secure cookie handling
- Protected route implementation
- Role-based access control

### 3. User Experience
- Clear error messages
- Loading states
- Success notifications
- Smooth redirects

## Version History
- [v0.0.26] Added SSR compatibility fixes
- [v0.0.25] Completed authentication features
- [v0.0.24] Fixed CSS configuration
- [v0.0.23] Enhanced error handling
- [v0.0.22] Completed auth implementation
- [v0.0.21] Added Google OAuth
- [v0.0.20] Enhanced UX features
- [v0.0.19] Added dark mode support
- [v0.0.18] Implemented UI components
- [v0.0.17] Core auth system working
- [v0.0.15] Initial setup complete

## References
- [Project Requirements](../../project-requirements.md)
- [Lessons Learned](../../../.cursor/lessons-learned.md)
- [Project Memories](../../../.cursor/memories.md)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
