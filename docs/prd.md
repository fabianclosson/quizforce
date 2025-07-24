# QuizForce v2.0 - Product Requirements Document

## Executive Summary

QuizForce is a Salesforce certification practice platform that provides realistic practice exams to help professionals pass their Salesforce certifications. This document outlines the requirements for building QuizForce with a modern, scalable architecture focused on simplicity and performance.

## Project Overview

### Vision

To be the leading Salesforce certification practice platform that helps professionals achieve certification success through realistic practice tests and expert guidance.

### Mission

Provide comprehensive, realistic practice exams that mirror actual Salesforce certification tests, enabling professionals to pass their certifications with confidence.

### Goals

- Create a scalable, maintainable MVP with modern technology stack
- Provide realistic practice exams for all major Salesforce certifications
- Implement one-time purchase model (no subscriptions)
- Achieve 12-month access period from enrollment
- Build beautiful, responsive UI with shadcn/ui components
- Focus on core functionality without unnecessary complexity

## Technology Stack

### Frontend

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Lucide React** for icons

### Backend

- **Next.js API Routes** for server-side logic
- **Supabase** for database and authentication
- **PostgreSQL** database (hosted by Supabase)
- **Supabase Client** for direct database operations

### Infrastructure

- **Vercel** for deployment and hosting
- **Supabase** for database hosting
- **Sentry** for error tracking (only monitoring tool)

### Key Principles

- **No subscriptions** - one-time purchase model only
- **12-month access** from enrollment date
- **Mobile-first responsive design**
- **Fast performance** with minimal dependencies

## Business Model

### Revenue Model

- **Free Individual Certification Bundles**: Basic practice tests for single certifications at no cost
- **Premium Individual Certification Bundles**: Advanced practice tests for single certifications with one-time purchase
- **Multi-Certification Bundle Packages**: Multiple certifications grouped together at discounted rates
- **No Subscriptions**: All purchases are one-time payments
- **12-Month Access**: Users get 12 months of access from enrollment date

### Pricing Strategy

- **Individual Certification Bundles**:
  - Free bundles: $0 (basic question sets for single certifications)
  - Premium bundles: $29-79 per certification (one-time payment)
- **Multi-Certification Bundle Packages**:
  - Grouped certifications at discounted rates (e.g. $99 instead of $150 individual)
  - Save 20-40% compared to buying certifications individually

## User Personas

### Primary Persona: Salesforce Professional

- **Demographics**: 25-45 years old, working in Salesforce ecosystem
- **Goals**: Pass Salesforce certification exams, advance career
- **Pain Points**: Expensive training, unrealistic practice tests, time constraints
- **Behavior**: Studies during evenings/weekends, prefers mobile-friendly platform

### Secondary Persona: Career Changer

- **Demographics**: 30-50 years old, transitioning to Salesforce career
- **Goals**: Gain Salesforce credentials, prove competency
- **Pain Points**: No prior Salesforce experience, need comprehensive preparation
- **Behavior**: Intensive study periods, values detailed explanations

## Functional Flows

### 1. User Registration & Authentication Flow

#### 1.1 New User Registration

1. User visits landing page
2. Clicks "Sign Up" button
3. Redirected to `/auth/signup`
4. User can choose between:
   - **Email Registration**: Enters email, password, first name, last name
   - **Google OAuth**: Clicks "Continue with Google" button
5. **For Email Registration:**
   - Supabase handles email verification
   - User receives verification email
   - Clicks verification link
   - Account activated, redirected to `/dashboard`
6. **For Google OAuth:**
   - Redirected to Google consent screen
   - User authorizes QuizForce access
   - Account created automatically with Google profile info (first name, last name, email, profile picture)
   - Redirected to `/dashboard`

#### 1.2 User Login

1. User visits landing page or any protected page
2. Clicks "Sign In" or automatically redirected to `/auth/login`
3. User can choose between:
   - **Email Login**: Enters email and password
   - **Google OAuth**: Clicks "Continue with Google" button
4. **For Email Login:**
   - Supabase authenticates user
   - On success: redirected to `/dashboard`
   - On failure: error message displayed
5. **For Google OAuth:**
   - Redirected to Google consent screen
   - User authorizes access
   - Supabase handles OAuth flow
   - Redirected to `/dashboard`

#### 1.3 Password Reset

1. User clicks "Forgot Password" on login page
2. Enters email address
3. Supabase sends reset email
4. User clicks reset link
5. Redirected to password reset form
6. Enters new password
7. Password updated, redirected to login

### 2. Certification Catalog Flow

#### 2.1 Browse Certifications

1. User navigates to `/catalog` from left navigation bar
2. System displays all available products (individual certification bundles and multi-certification packages)
3. **Search bar** prominently displayed at the top for keyword searching
4. Each product shows:
   - Badge image (certification-specific badge icon)
   - Name only
   - Number of practice exams + total number of questions (e.g., "3 Practice Exams • 180 Questions")
   - Price ("Free" for free bundles, dollar amount for premium)
   - Enrollment status (if already enrolled)
   - **Two CTAs**:
     - "Enroll" (or "Enrolled" status if already enrolled)
     - "View Details"
5. User can filter by:
   - **Category**: All, Associates, Admins, Designers, Consultants, Architects, Marketers, Developers, Artificial Intelligence
   - **Type**: All, Individual Certifications, Bundle Packages
   - Price: Free, Premium
6. User can sort by: Most Recent, Most Popular, Price (Low to High), Price (High to Low)
7. User can search using search bar
8. User clicks "View Details" for product details or "Enroll" for direct enrollment

#### 2.2 Product Details (Individual Certification or Bundle Package)

1. User clicks "View Details" button on specific product
2. Redirected to `/catalog/[product-id]`
3. **For Individual Certification Bundles**, page displays:
   - Detailed certification information
   - Category (Associates, Admins, Designers, Consultants, Architects, Marketers, Developers, Artificial Intelligence)
   - User reviews and ratings
   - **If enrolled**: "Write a Review" section (1-5 star rating + comment field)
   - Enrollment button ("Enroll" or "Enrolled" status if already enrolled)
4. **For Multi-Certification Bundle Packages**, page displays:
   - List of all included certifications
   - Total question count across all certifications
   - Individual vs package pricing comparison
   - Savings amount prominently displayed
   - Purchase button with savings highlight ("Enroll" or "Enrolled" status if already enrolled)

#### 2.3 Free Bundle Enrollment

1. User clicks "Enroll" button
2. System checks authentication status
3. If not logged in: redirect to login with return URL
4. If logged in: create enrollment record
5. Set 12-month access period from enrollment date
6. Redirect to dashboard with success message
7. Bundle appears in "Practice Exams" section

#### 2.3b Premium Bundle Purchase (Individual Certification)

1. User clicks "Enroll" button on premium individual certification
2. System checks authentication status
3. If not logged in: redirect to login with return URL
4. **Redirected to Stripe Checkout** (hosted checkout page)
5. Stripe Checkout displays:
   - Certification details
   - Price
   - Coupon code input field
   - Payment form
6. User enters payment information and optional coupon code
7. Stripe processes payment and applies coupon discount automatically
8. On success: user redirected back to app, create enrollment record
9. Set 12-month access period from enrollment date
10. Redirect to dashboard with success message
11. Bundle appears in "Practice Exams" section

#### 2.4 Bundle Package Purchase

1. User clicks "Enroll" button on multi-certification bundle
2. System checks authentication status
3. If not logged in: redirect to login with return URL
4. **Redirected to Stripe Checkout** (hosted checkout page)
5. Stripe Checkout displays:
   - Package contents breakdown
   - Price with savings information
   - Coupon code input field
   - Payment form
6. User enters payment information and optional coupon code
7. Stripe processes payment and applies coupon discount automatically
8. On success: user redirected back to app, create enrollment records for ALL certifications in package
9. Set 12-month access period from enrollment date for each certification
10. Redirect to dashboard with success message
11. All certifications from package appear in "Practice Exams" section

### 3. Practice Exam Flow

#### 3.1 Exam Selection

1. User navigates to "Practice Exams" section from left navigation bar
2. System displays tables grouped by individual certification bundles
3. **For each certification bundle table**, displays:
   - Certification bundle name as table header
   - **For each practice exam (table rows)**, shows:
     - Practice exam name
     - Number of questions
     - Status (Not Started, In Progress, Completed)
     - Last score (%) - if previously attempted
     - Action buttons ("Start" for new exams, "Continue" for in-progress exams, "Restart" for completed exams)
4. User clicks "Start", "Continue", or "Restart" button to begin/resume practice exam

#### 3.2 Taking Practice Exam

1. User clicks "Start", "Continue", or "Restart" button
2. Redirected to `/exam/[exam-id]`
3. Pre-exam page displays:
   - Exam instructions
   - Time limit information
   - Question count
   - "Begin Exam" button
4. User clicks "Begin Exam"
5. Exam interface loads with:
   - Question display area
   - Answer options (multiple choice, multiple select, true/false)
   - Navigation buttons (Previous, Next, Flag)
   - Question palette sidebar
   - Timer display
   - Progress indicator
6. User answers questions and navigates through exam
7. System auto-saves progress every 30 seconds
8. User can flag questions for review
9. User clicks "Submit Exam" when complete
10. Confirmation dialog appears
11. User confirms submission
12. Redirected to results page

#### 3.3 Exam Results & Review

1. Results page displays:
   - Overall score percentage
   - Pass/Fail status (based on exam-specific passing threshold stored in database)
   - Time taken
   - **Performance breakdown by knowledge area:**
     - Each area shows: score percentage, questions attempted, area weighting
     - Color-coded performance (Strong: >80%, Good: 65-80%, Needs Improvement: <65%)
2. User can click "Review Answers" button
3. Redirected to review interface showing:
   - All questions with user's answers
   - Correct answers highlighted
   - Detailed explanations for each question
   - Questions organized by knowledge area
   - Area-specific performance insights
4. User can filter review by specific knowledge areas
5. User can return to dashboard or retake exam

### 4. User Dashboard Flow

#### 4.1 Dashboard Overview

1. User logs in and lands on `/dashboard`
2. If no certifications enrolled: display message with link to catalog
3. If certifications enrolled: display overview with:
   - **My Exams in Progress section:**
     - List of exams currently in progress
     - Shows certification name, exam name, progress percentage
     - "Continue Exam" button for each in-progress exam
   - **My Certifications section:**
     - Displays all enrolled certification bundles
     - Each certification shows:
       - Certification name and overall progress
       - Available practice exams with attempt history and latest scores
       - **Expandable Knowledge area performance summary:**
         - Click to expand/collapse detailed area breakdown
         - When expanded: Visual progress bars for each area
         - When expanded: Areas marked as "Strong", "Good", or "Needs Focus"

### 7. Community Flow

#### 7.1 Community Section

1. User navigates to "Community" from left navigation bar
2. Main content area displays:
   - "Join our Salesforce Certified Slack Community" heading
   - Brief description of the community benefits
   - "Join Slack Community" button
3. User clicks button and is redirected to external Slack invitation link
4. User joins Slack community outside of QuizForce app

### 8. Account Management Flow

#### 5.1 Profile Management

1. User clicks on profile (profile image + first name, last name) in top right header
2. Dropdown menu appears with options: My Account, Purchase History, Sign Out
3. User selects "My Account" and navigates to `/account`
4. Profile section displays:
   - Personal information (first name, last name, email)
   - Profile picture (from Google OAuth or default avatar)
   - Account creation date
   - Edit profile button
5. User can update first name, last name, email address, and profile picture
6. Password change section with current/new password fields (only for email-registered users)
7. Account deletion option (with confirmation)

#### 5.2 Purchase History

1. User clicks on profile in top right header
2. Selects "Purchase History" from dropdown menu and navigates to `/purchases`
3. Displays list of all purchases:
   - Purchase date
   - Certification bundle name
   - Amount paid
   - Access period (enrollment to expiration)
   - Download receipt button (only for paid purchases - pulls Stripe default receipt)
4. Each purchase shows current access status
5. Free certification enrollments do not display download receipt button

### 6. Administrative Flows

#### 6.1 Content Management

1. Admin users can access `/admin` dashboard
2. **Manage certification bundles:**
   - Create new individual certification bundles
   - Create new multi-certification bundle packages
   - Edit existing certification content and details
   - Set pricing and availability for both individual and package bundles
   - Manage category assignments for individual certifications
   - Assign individual certifications to multi-certification packages
   - **Package savings calculated automatically**: System compares package price vs sum of individual certification prices
3. **Manage practice exams:**
   - Create new practice exams within certification bundles
   - Edit exam details (name, time limits, passing thresholds)
   - Manage exam-to-certification assignments
4. **Manage knowledge areas:**
   - Create and edit knowledge areas for specific certifications
   - Set area weightings and descriptions
   - Each area belongs to only one certification (1:1 relationship)
5. **Manage questions and answers:**
   - Create new questions with multiple answer choices
   - Edit existing questions and explanations
   - Each question belongs to only one specific practice exam
   - Assign questions to specific knowledge areas within that exam
   - Set correct answers and detailed explanations
6. **User management:**
   - View user accounts
   - Manage enrollments
7. **Coupon Management:**
   - Coupons created and managed directly in Stripe Dashboard
   - View coupon usage through Stripe reporting

## Application Layout & Navigation

### Authenticated App Layout

- **Top Left**: QuizForce logo ("Q" followed by "f" in italic, both white in a colored circle)
- **Left Navigation Bar**: Dashboard, Catalog, Practice Exams, Community
- **Top Right**: Profile (profile image + first name, last name) with dropdown menu (My Account, Purchase History, Sign Out)
- **Mobile**: Hamburger menu for responsive design

## Landing Page Content Specifications

### Landing Page Header (Public)

- **Logo**: "Q" followed by "f" (in italic) both white in a colored circle
- **Navigation**: Sign In, Sign Up
- **Mobile**: Hamburger menu for responsive design

### Hero Section

- **Main Headline**: "Practice Smarter. Pass Sooner."
- **Subheading**: "Realistic practice exams that help you earn your Salesforce certifications with confidence."
- **CTAs**: Sign Up (primary), View Catalog (secondary)
- **Key Highlights**:
  - 2000+ Practice Questions
  - All Major Certifications
  - Real Exam Simulation
- **Hero Image**: Placeholder image of someone with all certification badges

### Why Choose QuizForce Section

- **Section Title**: "Why Choose QuizForce?"
- **Section Subtitle**: "Our platform combines realistic practice tests with intelligent learning features to give you the best chance of certification success."

#### Features:

1. **Real Practice Exams**
   - "Experience exam-like conditions with questions that mirror the actual Salesforce certification tests."

2. **Adaptive Learning**
   - "Our AI-powered system adapts to your learning style and focuses on your weak areas."

3. **Expert-Crafted Content**
   - "Questions written by certified Salesforce professionals with real-world experience."

4. **Detailed Explanations**
   - "Learn from mistakes with comprehensive explanations for every question and answer choice."

### Available Certifications Catalog

- **Section Title**: "Available Certifications Catalog"
- **Section Subtitle**: "Comprehensive practice tests for all major Salesforce certifications. Start with the fundamentals or jump to advanced topics."
- **Certification Cards**: Display popular certifications with:
  - Badge image (certification-specific badge icon)
  - Certification bundle name
  - Number of practice exams
  - Total number of questions
  - Enrollment button
- **Card Interaction**: On enrollment button click, non-authenticated users are redirected to signup flow

### Success Stories Section

- **Section Title**: "Success Stories from Certified Professionals"
- **Section Subtitle**: "Join thousands of certified professionals who achieved their Salesforce certifications with QuizForce."
- **Content**: User testimonials and Twitter/X cards
- **CTA**: "Join our Free SF Certified Slack Community"

### Final CTA Section

- **Title**: "Ready to Start Your Certification Journey?"
- **Subtitle**: "Join smart professionals who have achieved Salesforce certification success with QuizForce."
- **CTA Button**: "Get Started Free"

### Footer

- **Company Info**: "QuizForce - The leading Salesforce certification practice platform. Master your certifications with realistic practice tests and expert guidance."
- **Columns**:
  - **Certifications**: Administrator, Platform Developer I, Sales Cloud Consultant, Service Cloud Consultant, etc.
  - **Resources**: Study Guides, Practice Tests, Certification Roadmap, Community (placeholders)
  - **Company**: About Us, Contact, Privacy Policy, Terms of Service (placeholders)
  - **Community**: Slack Community, Blog, Success Stories (placeholders)

## Technical Requirements

### Database Schema

#### Core Tables

1. **users**: User accounts and profiles (first name, last name, email, profile picture URL)
2. **categories**: Certification categories (Associates, Admins, Designers, Consultants, Architects, Marketers, Developers, Artificial Intelligence)
3. **certifications**: Individual certification bundles with category association (unique names, e.g., Salesforce Administrator)
4. **packages**: Multi-certification bundle packages (e.g., Admin + Sales Cloud Bundle)
5. **package_certifications**: Many-to-many relationship between packages and certifications
6. **areas**: Knowledge areas/domains unique to each certification with weightings (e.g., "Data Cloud Setup: 12%" belongs only to Data Cloud Consultant)
7. **practice_exams**: Practice exams within each certification bundle (includes passing threshold per exam)
8. **questions**: Practice exam questions unique to each exam and linked to specific areas (1:1 relationship with exams)
9. **answers**: Answer choices unique to each question (1:1 relationship with questions)
10. **enrollments**: User enrollments in individual certifications (from individual or package purchases)
11. **exam_attempts**: User exam attempt records
12. **user_answers**: Individual question responses
13. **reviews**: User reviews for individual certifications only (1-5 stars + comments, only for enrolled users)
14. **coupon_codes**: Coupon codes with discount types, amounts, expiration dates, and usage limits
15. **payments**: Purchase transaction records (individual certifications or packages)

### API Endpoints

#### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

#### Certifications & Packages

- `GET /api/catalog` - List all products (certifications + packages) with filtering
- `GET /api/certifications/[id]` - Get individual certification details
- `GET /api/packages/[id]` - Get package details with included certifications
- `POST /api/certifications/[id]/enroll` - Enroll in individual certification
- `POST /api/packages/[id]/enroll` - Enroll in multi-certification package

#### Exams & Performance

- `GET /api/exams/[id]` - Get exam questions organized by areas
- `POST /api/exams/[id]/submit` - Submit exam answers with area mapping
- `GET /api/exams/[id]/results` - Get exam results with area performance breakdown
- `GET /api/user/performance/[certification-id]` - Get user's performance across all attempts by area
- `GET /api/certifications/[id]/areas` - Get knowledge areas and weightings for certification

#### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/enrollments` - Get user enrollments
- `GET /api/user/purchases` - Get purchase history

### Security Requirements

- **Authentication**: Supabase Auth with JWT tokens and Google OAuth integration
- **Authorization**: Role-based access control (user, admin)
- **Access Control**: Full app access requires authentication (Catalog, Practice Exams, Dashboard, Community)
- **Data Protection**: HTTPS encryption, secure password hashing
- **Privacy**: GDPR compliance, data retention policies
- **Payment Security**: PCI DSS compliance through Stripe

### Performance Requirements

- **Page Load Time**: < 2 seconds for all pages
- **Database Queries**: < 100ms average response time
- **Concurrent Users**: Support 1000+ simultaneous users
- **Uptime**: 99.9% availability target
- **Mobile Performance**: Optimized for mobile devices

## Success Metrics

All success metrics will be tracked using third-party analytics tools rather than implementing custom tracking within the application.

### User Engagement

- User registration rate
- Certification enrollment rate
- Exam completion rate
- User retention (30-day, 90-day)
- Average session duration

### Business Metrics

- Revenue per user
- Conversion rate (free to paid)
- Customer lifetime value
- Churn rate
- Net Promoter Score (NPS)

### Technical Metrics

- Page load speed
- Error rate
- API response times
- Database performance
- Mobile usage statistics

## Development Phases

### Phase 1: MVP Core (Weeks 1-4)

- User authentication system
- Basic certification catalog
- Simple practice exam functionality
- User dashboard
- Payment integration

### Phase 2: Enhanced Features (Weeks 5-8)

- Advanced exam interface
- Results and review system
- User profile management
- Admin dashboard
- Performance optimizations

### Phase 3: Polish & Launch (Weeks 9-12)

- UI/UX refinements
- Mobile optimization
- Security audit
- Performance testing
- Production deployment

## Conclusion

This PRD outlines a comprehensive yet focused approach to rebuilding QuizForce as a modern, scalable Salesforce certification practice platform. By leveraging modern technologies like Next.js 15, Supabase, and shadcn/ui, we can create a fast, reliable, and beautiful user experience while maintaining a simple, maintainable codebase.

The focus on core functionality, one-time purchase model, and 12-month access periods provides a clear business model while avoiding the complexity of subscription management. The detailed functional flows ensure all user journeys are well-defined and implementable.

Success will be measured through user engagement, business metrics, and technical performance, with a phased development approach ensuring steady progress toward a production-ready platform.
