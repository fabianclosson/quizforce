# QuizForce Database Schema

This directory contains database migrations and comprehensive documentation for the QuizForce Salesforce certification practice platform.

## Quick Start

1. **Create your Supabase project** (if not already done):
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Create a new project
   - Note your project URL and API keys

2. **Set up environment variables** in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

3. **Run the migrations in order**:
   ```sql
   -- Copy and paste each migration file into Supabase SQL Editor
   001_user_management_schema.sql      -- User accounts and preferences
   002_certification_structure_schema.sql  -- Certifications and packages
   003_exam_content_schema.sql         -- Exams, questions, and progress tracking
   004_payment_processing_schema.sql   -- Payments and coupons
   005_review_schema.sql               -- User reviews
   ```

## Database Schema Overview

### Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   auth.users    │    │  certification_ │    │   payments      │
│                 │    │   categories    │    │                 │
│ - id (PK)       │    │                 │    │ - id (PK)       │
│ - email         │    │ - id (PK)       │    │ - user_id (FK)  │
│ - created_at    │    │ - name          │    │ - product_id    │
└─────────────────┘    │ - slug          │    │ - amount_cents  │
         │              │ - description   │    │ - status        │
         │              └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       │
┌─────────────────┐    ┌─────────────────┐              │
│    profiles     │    │ certifications  │              │
│                 │    │                 │              │
│ - id (PK/FK)    │    │ - id (PK)       │              │
│ - first_name    │    │ - name          │              │
│ - last_name     │    │ - category_id   │              │
│ - avatar_url    │    │ - price_cents   │              │
│ - role          │    │ - exam_count    │              │
└─────────────────┘    └─────────────────┘              │
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │  enrollments    │              │
         │              │                 │              │
         │              │ - id (PK)       │◄─────────────┘
         │              │ - user_id (FK)  │
         │              │ - cert_id (FK)  │
         │              │ - enrolled_at   │
         │              │ - expires_at    │
         │              └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │ practice_exams  │
         │              │                 │
         │              │ - id (PK)       │
         │              │ - cert_id (FK)  │
         │              │ - name          │
         │              │ - question_count│
         │              │ - time_limit    │
         │              └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │  exam_attempts  │
         │              │                 │
         │              │ - id (PK)       │
         │              │ - user_id (FK)  │◄─────────────
         │              │ - exam_id (FK)  │
         │              │ - score_%       │
         │              │ - status        │
         │              └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │  user_answers   │
         │              │                 │
         │              │ - id (PK)       │
         │              │ - attempt_id    │
         │              │ - question_id   │
         │              │ - answer_id     │
         │              │ - is_correct    │
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐
│    reviews      │
│                 │
│ - id (PK)       │
│ - user_id (FK)  │
│ - cert_id (FK)  │
│ - rating (1-5)  │
│ - review_text   │
└─────────────────┘
```

## Table Documentation

### 1. User Management Tables

#### `profiles`

Extends Supabase auth.users with application-specific user data.

- **Purpose**: Store user profile information and role management
- **Key Fields**: first_name, last_name, avatar_url, role
- **Security**: RLS policies ensure users access only their own data

#### `user_preferences`

User settings and customization options.

- **Purpose**: Store user preferences for UI and study settings
- **Key Fields**: theme, study_goal_hours, email_notifications
- **Features**: Auto-created when user signs up

#### `user_sessions`

Session tracking for analytics and security.

- **Purpose**: Track user login sessions and activity
- **Key Fields**: started_at, last_activity_at, device_info
- **Use Cases**: Security monitoring, analytics

#### `audit_logs`

Comprehensive audit trail for actions and security.

- **Purpose**: Track important user actions for security and debugging
- **Key Fields**: action, resource_type, details, ip_address
- **Security**: Admin-only access, automatic logging

### 2. Certification Structure Tables

#### `certification_categories`

Organization of certifications by Salesforce tracks.

- **Purpose**: Group certifications (Associates, Admins, Developers, etc.)
- **Key Fields**: name, slug, description, color
- **Count**: 8 categories as specified in PRD

#### `certifications`

Individual certification practice bundles.

- **Purpose**: Core product - individual certification offerings
- **Key Fields**: name, price_cents, exam_count, total_questions
- **Pricing**: 0 = free, >0 = premium pricing in cents

#### `certification_packages`

Multi-certification bundles with discounts.

- **Purpose**: Package deals combining multiple certifications
- **Key Fields**: name, price_cents, discount_percentage
- **Business Logic**: Savings vs individual purchases

#### `package_certifications`

Junction table linking packages to individual certifications.

- **Purpose**: Many-to-many relationship between packages and certifications
- **Key Fields**: package_id, certification_id, sort_order

### 3. Exam Content Tables

#### `knowledge_areas`

Exam domains with weightings for each certification.

- **Purpose**: Define exam topics with percentage weightings
- **Key Fields**: name, weight_percentage, certification_id
- **Example**: "Data Management: 21%" for Administrator exam

#### `practice_exams`

Practice exam instances within certifications.

- **Purpose**: Individual exams within certification bundles
- **Key Fields**: name, question_count, time_limit_minutes, passing_threshold
- **Features**: Multiple exams per certification

#### `questions`

Practice exam questions linked to knowledge areas.

- **Purpose**: Core exam content with difficulty levels
- **Key Fields**: question_text, difficulty_level, knowledge_area_id
- **Types**: Multiple choice questions only (as per PRD)

#### `answers`

Answer choices for questions with correct answer tracking.

- **Purpose**: Multiple choice options for questions
- **Key Fields**: answer_text, is_correct, answer_letter (A-E)
- **Constraints**: Exactly one correct answer per question

#### `question_explanations`

Detailed explanations for learning (separate table for performance).

- **Purpose**: Educational content explaining answers
- **Key Fields**: explanation_text, question_id
- **Use Case**: Post-exam review and learning

### 4. Progress Tracking Tables

#### `enrollments`

User access to certification bundles (12-month access).

- **Purpose**: Track which certifications users have access to
- **Key Fields**: user_id, certification_id, enrolled_at, expires_at
- **Access Control**: 12-month access period from enrollment
- **Sources**: Direct purchase or package enrollment

#### `exam_attempts`

User exam attempts with scoring and timing.

- **Purpose**: Track individual exam sessions
- **Key Fields**: score_percentage, correct_answers, time_spent, status
- **States**: in_progress, completed, abandoned
- **Features**: Retake support, pass/fail determination

#### `user_answers`

Individual question responses with correctness tracking.

- **Purpose**: Detailed answer tracking for review and analytics
- **Key Fields**: answer_id, is_correct, time_spent_seconds
- **Features**: Auto-calculated correctness, time tracking

### 5. Payment Processing Tables

#### `payments`

Purchase transaction records with Stripe integration.

- **Purpose**: Track all purchase transactions
- **Key Fields**: stripe_payment_intent_id, amount_cents, status
- **Integration**: Full Stripe webhook support
- **Products**: Both individual certifications and packages

#### `coupon_codes`

Discount codes with usage limits and expiration.

- **Purpose**: Marketing and promotional discounts
- **Key Fields**: code, discount_type, discount_value, max_uses
- **Types**: Percentage or fixed amount discounts
- **Features**: Usage tracking, expiration dates

### 6. Review System Tables

#### `reviews`

User reviews for individual certifications (1-5 stars + comments).

- **Purpose**: User feedback and ratings for certifications
- **Key Fields**: rating (1-5), review_text, user_id, certification_id
- **Constraints**: One review per user per certification
- **Access**: Only enrolled users can create reviews

## Security Features

### Row Level Security (RLS)

All tables implement comprehensive RLS policies:

- **User Data**: Users can only access their own records
- **Admin Access**: Admin users have elevated permissions
- **Public Data**: Catalog information is publicly readable
- **Enrollment Checks**: Reviews and progress require active enrollment

### Data Protection

- **Cascade Deletes**: Proper foreign key relationships
- **Unique Constraints**: Prevent duplicate records
- **Check Constraints**: Data validation at database level
- **Audit Logging**: Comprehensive action tracking

## Performance Optimizations

### Indexes

Strategic indexes for common query patterns:

- **User Lookups**: Fast access to user data
- **Catalog Queries**: Efficient certification browsing
- **Progress Tracking**: Quick exam attempt retrieval
- **Review Display**: Fast review loading for certifications

### Query Optimization

- **Composite Indexes**: Multi-column query support
- **Partial Indexes**: Space-efficient filtered indexes
- **Foreign Key Indexes**: Fast join performance

## TypeScript Integration

Complete type definitions in `src/types/database.ts`:

```typescript
// Example usage
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Certification = Database["public"]["Tables"]["certifications"]["Row"];
type ExamAttempt = Database["public"]["Tables"]["exam_attempts"]["Row"];
```

## Helper Functions

Database includes utility functions:

- `get_certification_average_rating(cert_id)` - Calculate average rating
- `get_certification_review_count(cert_id)` - Count reviews
- `validate_coupon_code(code)` - Real-time coupon validation
- `set_enrollment_expiration()` - Auto-set 12-month access

## Migration Order

**Critical**: Run migrations in this exact order:

1. `001_user_management_schema.sql` - Foundation tables and functions
2. `002_certification_structure_schema.sql` - Certification catalog
3. `003_exam_content_schema.sql` - Exam system and progress tracking
4. `004_payment_processing_schema.sql` - Payment and coupon system
5. `005_review_schema.sql` - Review system

## Testing the Schema

After running all migrations:

1. **Verify table creation**:

   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' ORDER BY table_name;
   ```

2. **Check RLS policies**:

   ```sql
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE schemaname = 'public' AND rowsecurity = true;
   ```

3. **Test user signup flow**:
   - Create user via Supabase Auth
   - Verify automatic profile creation
   - Check default preferences creation

4. **Test enrollment flow**:
   - Create certification and exam records
   - Test enrollment creation
   - Verify 12-month expiration

## Common Queries

### User Dashboard Data

```sql
-- Get user's active enrollments with certification details
SELECT e.*, c.name, c.exam_count
FROM enrollments e
JOIN certifications c ON e.certification_id = c.id
WHERE e.user_id = $1 AND e.expires_at > now();
```

### Certification Catalog

```sql
-- Get certifications with ratings and category info
SELECT c.*, cat.name as category_name,
       get_certification_average_rating(c.id) as avg_rating,
       get_certification_review_count(c.id) as review_count
FROM certifications c
JOIN certification_categories cat ON c.category_id = cat.id
WHERE c.is_active = true;
```

### Exam Progress

```sql
-- Get user's exam attempts for a certification
SELECT ea.*, pe.name as exam_name
FROM exam_attempts ea
JOIN practice_exams pe ON ea.practice_exam_id = pe.id
WHERE ea.user_id = $1 AND pe.certification_id = $2
ORDER BY ea.started_at DESC;
```

## Troubleshooting

### Common Issues

- **Migration Order**: Always run in sequence 001 → 002 → 003 → 004 → 005
- **RLS Errors**: Ensure user is authenticated when accessing protected data
- **Function Dependencies**: User management functions must exist before later migrations
- **Index Errors**: Check for `now()` function usage in index predicates (not allowed)

### Useful Debugging Queries

```sql
-- Check all policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies WHERE schemaname = 'public';

-- Verify triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Check constraints
SELECT table_name, constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public';
```

## Next Steps

After completing the database schema:

1. Implement Supabase client configuration
2. Create database helper functions
3. Build authentication system
4. Develop certification catalog
5. Implement exam engine
6. Add payment processing
7. Create admin dashboard

---

_This schema supports the complete QuizForce platform as specified in the PRD, with focus on simplicity, security, and performance._
