*This lessons-learned file serves as a critical knowledge base for capturing and preventing mistakes. During development, document any reusable solutions, bug fixes, or important patterns using the format: [Version] Category: Issue → Solution → Impact. Entries must be categorized by priority (Critical/Important/Enhancement) and include clear problem statements, solutions, prevention steps, and code examples. Only update upon user request with "lesson" trigger word. Focus on high-impact, reusable lessons that improve code quality, prevent common errors, and establish best practices. Cross-reference with @memories.md for context.*

# Lessons Learned

### Image Handling
[0.0.1] Important - Image Storage Architecture: Issue: Unorganized image storage and URL management in Supabase leading to maintenance difficulties → Solution: Implemented structured storage configuration with dedicated buckets per content type, path generation utilities, and filename preservation system → Why: Proper organization and consistent naming conventions are crucial for long-term maintainability and prevent URL-related bugs.

[0.0.2] Important - Image Upload Management: Issue: Duplicate filenames and inconsistent image handling → Solution: Created robust upload utility with original filename preservation, automatic duplicate detection, and proper error handling → Why: Standardized upload process prevents naming conflicts and ensures reliable image storage.

[0.0.3] Enhancement - Image Optimization: Issue: Lack of image optimization and transformation capabilities → Solution: Integrated Next.js image optimization with custom URL generation utility supporting dynamic transformations → Why: Optimized images improve performance and user experience while maintaining quality.

[0.0.4] Important - Component Accessibility: Issue: Basic component implementation lacking proper accessibility features and user feedback → Solution: Enhanced components with ARIA labels, focus states, helper text, required field indicators, and smooth transitions → Why: Proper accessibility and visual feedback are crucial for usability and compliance with WCAG standards.

### Authentication
[0.0.5] Critical - Supabase PKCE Flow: Issue: Invalid request errors in Supabase authentication due to missing auth code and code verifier → Solution: Simplified auth implementation by removing custom popup handling, adding proper scopes to OAuth configuration, and implementing proper success message flow → Why: Proper OAuth configuration and simplified auth flow prevent authentication failures and improve user experience.

[0.0.6] Important - Auth State Management: Issue: Inconsistent auth state handling across components → Solution: Centralized auth state management in AuthContext with proper loading states, error handling, and role-based access → Why: Centralized state management prevents auth-related bugs and ensures consistent user experience.

### CSS Configuration
[0.0.7] Critical - PostCSS Configuration: Issue: CSS processing errors due to incorrect PostCSS plugin configuration → Solution: Updated PostCSS config to use object format for plugins and added proper type definitions → Why: Correct PostCSS configuration is essential for proper CSS processing and prevents build errors.

[0.0.8] Important - Tailwind Configuration: Issue: Missing brand colors and inconsistent styling due to incorrect Tailwind setup → Solution: Properly configured Tailwind with brand colors, dark mode support, and custom utilities → Why: Proper Tailwind configuration ensures consistent styling and maintainable CSS.

[0.0.9] Important - CSS Organization: Issue: Duplicate styles and inconsistent CSS structure → Solution: Organized CSS into proper layers (base, components, utilities) with clear separation of concerns → Why: Well-organized CSS improves maintainability and prevents style conflicts.

### Error Handling
[0.0.10] Important - Toast Notifications: Issue: Lack of user feedback for important actions → Solution: Implemented toast system with proper variants (success, error, default) and accessibility support → Why: Clear user feedback improves UX and helps users understand system state.

[0.0.11] Important - Error Boundaries: Issue: Uncaught errors causing app crashes → Solution: Added proper error boundaries with user-friendly error messages and recovery options → Why: Proper error handling prevents app crashes and provides better user experience.

### SSR & Client-Side APIs
[0.0.12] Critical - Browser APIs in SSR: Issue: ReferenceError: document is not defined due to accessing browser-only APIs during server rendering → Solution: Implemented dynamic imports or useEffect hooks for browser-specific code, and created separate client/server configurations → Why: Server components cannot access browser APIs like document/window, requiring proper code splitting and environment checks.

### Database Implementation
[0.0.13] Important - Query Caching Strategy: Issue: Inefficient database queries causing unnecessary API calls → Solution: Implemented stale-while-revalidate pattern with React Query, using 5-minute stale time and 30-minute garbage collection → Why: Proper caching strategy significantly reduces API calls while maintaining data freshness.

[0.0.14] Important - Real-time Subscription Management: Issue: Memory leaks and unnecessary updates from real-time subscriptions → Solution: Implemented proper cleanup in useEffect hooks and added enabled flag for conditional subscriptions → Why: Proper subscription management prevents memory leaks and improves performance.

[0.0.15] Important - Type-safe Database Operations: Issue: Type mismatches between database schema and frontend code → Solution: Generated comprehensive TypeScript types from database schema and created type-safe utility hooks → Why: Strong typing prevents runtime errors and improves developer experience.

*Note: This file is updated only upon user request and focuses on capturing important, reusable lessons learned during development. Each entry includes a timestamp, category, and comprehensive explanation to prevent similar issues in the future.*
