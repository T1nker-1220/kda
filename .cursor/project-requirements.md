`Project Requirements rules *@docs/project-requirements.md* You will use tools codebase to know what are the details of the files of this *@docs/project-requirements.md* directory files to check the project requirements and the project standards that you need to follow. This will be the guide for you to make sure you are following the project standards. So make sure to read this when planning and implementing the project to avoid duplications, conflicts, and errors. Don't touch that folder and files, you will only read it. Don't over do it to the point that you are not following the project requirements. DON'T REMOVE THIS LINE 1!!!!`

# Kusina de Amadeo - Project Information & Documentation

## Project Overview

Kusina de Amadeo is a full-stack food ordering system for an authentic Filipino restaurant located in Amadeo, Cavite. The system is designed to provide a seamless ordering experience while maintaining the authenticity of traditional Filipino cuisine.

## Technical Stack

### Frontend Technologies
- **Framework**: Next.js 14.1.0 (App Router)
- **Styling & UI Components**:
  - Shadcn/UI (customizable prebuilt components)
  - TailwindCSS
- **State Management**: Zustand
- **Form Validation**: Zod

### Backend & Database
- **Database**: Supabase with PostgreSQL (Remote CLI)
- **Authentication**: Google OAuth only nothing else
- **Type Safety**: Generated types & Zod schemas

### Deployment
- **Platform**: Vercel
- **Version Control**: GitHub
- **Package Manager**: PNPM

## Business Information

### Contact Details
- **Address**: 107 i Purok 4 Dagatan, Amadeo, Cavite
- **Mobile**: +63 939 719 689
- **Landline**: (046) 890-9060
- **BusinessEmail**: kusinadeamadeo@gmail.com
- **Admin Email**: kusinadeamadeo@gmail.com

### Location Links
- **Google Maps**: [View Location](https://maps.app.goo.gl/jvsb9KDwfxy3dYGo7)
- **Facebook Page**: [Kusina de Amadeo](https://www.facebook.com/people/Kusina-de-Amadeo/100063686464435/)

### Operating Hours
- **Store Hours**: 5:00 AM to 11:00 PM (daily)
- **Order Processing**: 8:00 AM to 10:00 PM (Asia/Manila timezone)
- **Pickup Hours**: 5:00 AM to 10:00 PM (Asia/Manila timezone)

## System Requirements & Features

### Authentication System
1. **Single Sign-in Method**
   - Google OAuth exclusively (Simple login) no other login method
   - Profile integration with Google Avatar
   - Role-based access control (admin/customer)
   - Protected routes and RLS policies

2. **User Roles** (as per users table)
   - **Admin Access**:
     - Product with variants and add-ons & category management
     - Order processing & verification
     - Payment verification (GCash only)
   - **Customer Access**:
     - Order placement
     - Order history viewing
     - Payment submission

### Order System Requirements

1. **Customer Information** (as per users table)
   - Email (from Google data from OAuth)
   - Full name (from Google data from OAuth)
   - Phone number (from Google data from OAuth)
   - Delivery address (from Google data from OAuth)

2. **Payment Methods** (as per orders & payment_information tables)
     - Receipt generation both gcash and cash
   - **GCash**:
     - Customer upload the payment on facebook page of kusina de amadeo
   - **Cash**:
     - In-store payment

3. **Order Validation** (as per database constraints)
   - Order status tracking
   - Payment status verification (GCash only)
   - Receipt ID validation

### Product Management (as per database schema)

1. **Categories**
   - Name and description
   - Image management
   - Add-ons configuration

2. **Products**
   - Basic information (name, description, price)
   - Image management
   - Category assignment
   - Add-ons configuration
   - Active status control

3. **Variants**
   - Name and price
   - Image management
   - Active status

4. **Add-ons System**
   - Global add-ons configuration (choose by admin)
   - Product-specific availability
   - Pricing management

## Performance Requirements

1. **Loading Performance**
   - Initial page load: < 3 seconds
   - Mobile responsiveness
   - Basic image optimization

2. **Caching Strategy**
   - Static page caching
   - API response caching
   - Image optimization and caching
   - State persistence

## Security Requirements

1. **Data Protection**
   - HTTPS enforcement
   - XSS protection
   - CSRF protection
   - SQL injection prevention
   - Input sanitization

2. **Rate Limiting**
   - API rate limiting: 100 requests per minute
   - Login attempts: 5 per minute
   - Order submissions: 10 per minute

3. **Error Handling**
   - Graceful error recovery
   - User-friendly error messages
   - Detailed error logging
   - Security breach notifications

## SEO Requirements

1. **Metadata Management**
   - Dynamic meta titles and descriptions
   - Structured data for products
   - OpenGraph tags for social sharing
   - Twitter cards implementation

2. **Technical SEO**
   - Sitemap generation
   - Robots.txt configuration
   - Canonical URL implementation
   - Mobile-first indexing optimization

3. **Basic SEO**
   - Basic meta tags
   - Simple sitemap
   - Mobile-friendly design

## Accessibility Requirements

1. **WCAG Compliance**
   - WCAG 2.1 Level AA compliance
   - Keyboard navigation support
   - Screen reader optimization
   - Color contrast requirements
   - Focus management

2. **Responsive Design**
   - Mobile-first approach
   - Fluid typography
   - Responsive images
   - Touch-friendly interfaces

## Testing Requirements

1. **Testing Types**
   - Component testing
   - API endpoint testing
   - Authentication flow testing
   - Payment process testing
   - Order flow testing

2. **Quality Assurance**
   - Automated testing pipeline
   - Manual testing checklist
   - Cross-browser testing
   - Mobile device testing
   - Accessibility testing

1. **Testing Requirements**
   - Basic component testing
   - Critical path testing
   - Mobile device testing

## Project Roadmap

### Phase 1: Foundation Setup & Authentication 🏗️
1. **Project Initialization**
   - Set up Next.js 14.1.0 with App Router
   - Configure TailwindCSS and Shadcn/UI
   - Implement proper TypeScript configuration
   - Set up development tools and linting
     - Prettier
     - ESLint

2. **Authentication System**
   - Integrate Google OAuth (Supabase auth)
   - Set up role-based access (admin/customer)
   - Implement protected routes
   - Configure RLS policies

3. **Database Integration**
   - Connect existing Supabase database
   - Set up type generation
   - Implement database utilities
   - Configure environment variables

### Phase 2: Core Features Implementation 🚀
1. **Image Management System**
   - Implement structured storage organization
   - Create image upload utilities
   - Set up image cropping functionality
   - Configure Next.js image optimization
   - Implement URL generation system

2. **Product Management**
   - Create product CRUD operations
   - Implement category management
   - Set up variant system
   - Configure add-ons functionality
   - Implement image management for products

3. **Admin Dashboard**
   - Create admin layout
   - Implement product management UI
   - Set up order management interface
   - Create category management system
   - Implement payment verification UI

### Phase 3: Order System & Payment Integration 💳
1. **Order Management**
   - Implement order creation flow
   - Set up order status tracking
   - Create order history view
   - Implement order validation
   - Set up notifications

2. **Payment System**
   - Implement GCash integration
   - Set up cash payment handling
   - Create receipt generation
   - Implement payment status tracking
   - Set up payment verification

### Phase 4: User Experience & Optimization ✨
1. **UI/UX Enhancements**
   - Implement responsive design
   - Add loading states
   - Create error boundaries
   - Implement toast notifications
   - Add confirmation dialogs

2. **Performance Optimization**
   - Implement caching strategies
   - Optimize image loading
   - Add lazy loading
   - Implement pagination
   - Optimize API calls

3. **Testing & Quality Assurance**
   - Implement component testing
   - Add API endpoint tests
   - Test authentication flows
   - Verify payment processes
   - Test order workflows

### Phase 5: Deployment & Documentation 📚
1. **Deployment**
   - Configure Vercel deployment
   - Set up environment variables
   - Configure domain settings
   - Implement monitoring
   - Set up error tracking

2. **Documentation**
   - Create user documentation
   - Write admin documentation
   - Document API endpoints
   - Create maintenance guides
   - Document deployment process

Total Estimated Time: 6 weeks

### Priority Levels
🔴 Critical: Authentication, Core Product Features, Order System
🟡 High: Payment Integration, Image Management, Admin Dashboard
🟢 Medium: UI/UX Enhancements, Documentation
⚪ Low: Advanced Optimizations, Additional Features

### Success Metrics
1. **Performance**
   - Page load time < 3 seconds
   - Image optimization > 80%
   - API response time < 500ms

2. **User Experience**
   - Zero authentication errors
   - Successful order rate > 95%
   - Payment success rate > 98%

3. **Business Goals**
   - Increased order efficiency
   - Reduced management overhead
   - Improved customer satisfaction
