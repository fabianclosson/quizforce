# Database Migration Guide

## Overview

This guide covers all database migrations required for the QuizForce application, with special focus on the recent Exam vs Practice Mode and Multi-Answer Question features.

## Migration Files

All migration files are located in the `database/migrations/` directory and should be executed in sequential order.

### Required Migrations

1. **001_initial_schema.sql** - Basic table structure
2. **002_auth_setup.sql** - Authentication and user management
3. **003_practice_exams.sql** - Exam and question management
4. **004_user_answers.sql** - Answer tracking system
5. **005_knowledge_areas.sql** - Categorization system
6. **006_exam_mode_support.sql** - Exam mode functionality
7. **007_multi_answer_support.sql** - Multi-answer question support
8. **008_storage_setup.sql** - Avatar upload storage configuration

## Migration 006: Exam Mode Support

### Purpose

Adds support for tracking whether an exam attempt is in "exam" or "practice" mode.

### Changes

```sql
-- Add mode column to exam_attempts table
ALTER TABLE exam_attempts
ADD COLUMN mode TEXT NOT NULL DEFAULT 'exam';

-- Add comment for documentation
COMMENT ON COLUMN exam_attempts.mode IS 'Exam mode: exam (timed) or practice (self-paced)';
```

### Validation Query

```sql
-- Verify the column was added correctly
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exam_attempts' AND column_name = 'mode';
```

**Expected Result:**
| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| mode | text | NO | 'exam'::text |

### Rollback (if needed)

```sql
ALTER TABLE exam_attempts DROP COLUMN IF EXISTS mode;
```

## Migration 007: Multi-Answer Support

### Purpose

Adds support for questions that require multiple correct answers (Salesforce exam format).

### Changes

#### 1. Add required_selections column to questions table

```sql
-- Add required_selections field to track how many answers should be selected
ALTER TABLE questions
ADD COLUMN required_selections INTEGER NOT NULL DEFAULT 1;

-- Add constraint to ensure valid range (1-4 answers)
ALTER TABLE questions
ADD CONSTRAINT questions_required_selections_check
CHECK (required_selections >= 1 AND required_selections <= 4);

-- Add comment for documentation
COMMENT ON COLUMN questions.required_selections IS 'Number of answers the user must select (1=single choice, 2-4=multi choice)';
```

#### 2. Remove unique constraint from user_answers table

```sql
-- Remove unique constraint to allow multiple answers per question
ALTER TABLE user_answers
DROP CONSTRAINT IF EXISTS user_answers_question_id_exam_attempt_id_key;

-- Add new composite index for performance
CREATE INDEX IF NOT EXISTS idx_user_answers_question_attempt
ON user_answers(question_id, exam_attempt_id);
```

#### 3. Add performance indexes

```sql
-- Index for efficient question type queries
CREATE INDEX IF NOT EXISTS idx_questions_required_selections
ON questions(required_selections);

-- Index for efficient user answer queries by attempt
CREATE INDEX IF NOT EXISTS idx_user_answers_exam_attempt
ON user_answers(exam_attempt_id);
```

### Validation Queries

#### Check required_selections column

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'questions' AND column_name = 'required_selections';
```

**Expected Result:**
| column_name | data_type | is_nullable | column_default |
|---------------------|-----------|-------------|----------------|
| required_selections | integer | NO | 1 |

#### Check constraint was added

```sql
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'questions_required_selections_check';
```

**Expected Result:**
| constraint_name | check_clause |
|-------------------------------------|-----------------------------------------------------------------|
| questions_required_selections_check | ((required_selections >= 1) AND (required_selections <= 4)) |

#### Check unique constraint was removed

```sql
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'user_answers'
AND constraint_name = 'user_answers_question_id_exam_attempt_id_key';
```

**Expected Result:** No rows (constraint should be removed)

#### Check indexes were created

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('questions', 'user_answers')
AND indexname IN ('idx_questions_required_selections', 'idx_user_answers_question_attempt', 'idx_user_answers_exam_attempt');
```

### Rollback (if needed)

```sql
-- Remove added column and constraints
ALTER TABLE questions DROP COLUMN IF EXISTS required_selections;

-- Recreate unique constraint on user_answers
ALTER TABLE user_answers
ADD CONSTRAINT user_answers_question_id_exam_attempt_id_key
UNIQUE (question_id, exam_attempt_id);

-- Drop indexes
DROP INDEX IF EXISTS idx_questions_required_selections;
DROP INDEX IF EXISTS idx_user_answers_question_attempt;
DROP INDEX IF EXISTS idx_user_answers_exam_attempt;
```

## Migration 008: Storage Setup

**Purpose**: Configure Supabase Storage for user avatar uploads
**Tables Created**: Creates `avatars` storage bucket and policies
**Key Features**:

- User avatar upload functionality
- Secure file access policies
- Public read access for profile pictures

**Critical Configuration**:

1. Creates `avatars` storage bucket (public access)
2. Sets up security policies for user-specific uploads
3. Allows users to upload/update/delete only their own avatars
4. Enables public read access for displaying profile pictures

### Manual Storage Setup (If Migration Fails)

If you encounter issues with automatic storage setup, follow these steps in your Supabase Dashboard:

#### Step 1: Create Storage Bucket

1. Go to **Storage** in your Supabase Dashboard
2. Click **Create bucket**
3. Configure:
   - **Name**: `avatars`
   - **Public**: ✅ Yes (Enable)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`

#### Step 2: Set Up Storage Policies

Navigate to **Storage > Policies** and create these policies for the `avatars` bucket:

**Policy 1: Upload Permission**

```sql
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 2: Update Permission**

```sql
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 3: Delete Permission**

```sql
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Policy 4: Public Read Access**

```sql
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

#### Step 3: Test Avatar Upload

1. Sign in to your QuizForce application
2. Go to **Account Settings**
3. Click **Edit Profile**
4. Try uploading a profile picture
5. Verify the image appears correctly

### Troubleshooting Storage Issues

**Common Error**: "Storage not configured"

- **Solution**: Run migration 008 or follow manual setup steps above

**Common Error**: "Upload permissions not configured"

- **Solution**: Verify all 4 storage policies are created correctly

**Common Error**: "File too large"

- **Solution**: Ensure image is under 5MB, or adjust bucket settings

**Common Error**: "Invalid file type"

- **Solution**: Use JPG, PNG, or GIF format only

## Complete Migration Execution

### For New Installations

Execute all migrations in order:

```sql
-- Run each migration file in sequence
\i database/migrations/001_initial_schema.sql
\i database/migrations/002_auth_setup.sql
\i database/migrations/003_practice_exams.sql
\i database/migrations/004_user_answers.sql
\i database/migrations/005_knowledge_areas.sql
\i database/migrations/006_exam_mode_support.sql
\i database/migrations/007_multi_answer_support.sql
\i database/migrations/008_storage_setup.sql
```

### For Existing Installations

If you already have the basic schema (migrations 001-005), only run the new ones:

```sql
-- Only run the new feature migrations
\i database/migrations/006_exam_mode_support.sql
\i database/migrations/007_multi_answer_support.sql
\i database/migrations/008_storage_setup.sql
```

### Using Supabase Dashboard

1. **Open Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Create New Query**
4. **Copy and paste migration content**
5. **Execute the query**
6. **Verify results with validation queries**

## Data Migration

### Updating Existing Questions

After running migration 007, all existing questions will have `required_selections = 1` (single-answer). If you need to convert any existing questions to multi-answer:

```sql
-- Example: Convert a question to require 2 answers
UPDATE questions
SET required_selections = 2
WHERE id = 'your-question-id';

-- Verify the question has exactly 2 correct answers
SELECT q.question_text, q.required_selections,
       COUNT(a.id) as correct_answer_count
FROM questions q
JOIN answers a ON q.id = a.question_id AND a.is_correct = true
WHERE q.id = 'your-question-id'
GROUP BY q.id, q.question_text, q.required_selections;
```

### Updating Existing Exam Attempts

All existing exam attempts will have `mode = 'exam'`. If you need to update any to practice mode:

```sql
-- Example: Convert an attempt to practice mode
UPDATE exam_attempts
SET mode = 'practice'
WHERE id = 'your-attempt-id';
```

## Post-Migration Verification

### Complete System Check

Run this comprehensive check after all migrations:

```sql
-- Check all required tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'practice_exams', 'questions', 'answers',
    'exam_attempts', 'user_answers', 'knowledge_areas'
);

-- Check all required columns exist
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    (table_name = 'exam_attempts' AND column_name = 'mode') OR
    (table_name = 'questions' AND column_name = 'required_selections')
);

-- Check sample data structure
SELECT
    q.id,
    q.question_text,
    q.required_selections,
    COUNT(a.id) FILTER (WHERE a.is_correct = true) as correct_answers,
    COUNT(a.id) as total_answers
FROM questions q
LEFT JOIN answers a ON q.id = a.question_id
GROUP BY q.id, q.question_text, q.required_selections
LIMIT 5;
```

### Test Multi-Answer Functionality

```sql
-- Test inserting multiple user answers for same question
INSERT INTO user_answers (exam_attempt_id, question_id, answer_id, created_at)
VALUES
    ('test-attempt-1', 'test-question-1', 'answer-1', NOW()),
    ('test-attempt-1', 'test-question-1', 'answer-2', NOW());

-- Verify multiple answers were saved
SELECT exam_attempt_id, question_id, COUNT(*) as answer_count
FROM user_answers
WHERE exam_attempt_id = 'test-attempt-1' AND question_id = 'test-question-1'
GROUP BY exam_attempt_id, question_id;

-- Clean up test data
DELETE FROM user_answers
WHERE exam_attempt_id = 'test-attempt-1';
```

## Troubleshooting

### Common Issues

#### Migration 006 Issues

**Error: Column already exists**

```sql
-- Check if column already exists
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exam_attempts' AND column_name = 'mode'
);
```

**Solution**: Skip migration 006 if column already exists.

#### Migration 007 Issues

**Error: Constraint already exists**

```sql
-- Check if constraint exists
SELECT constraint_name
FROM information_schema.check_constraints
WHERE constraint_name = 'questions_required_selections_check';
```

**Solution**: Use `IF NOT EXISTS` or check before adding.

**Error: Cannot drop unique constraint (doesn't exist)**

```sql
-- Check if constraint exists before dropping
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'user_answers'
AND constraint_name = 'user_answers_question_id_exam_attempt_id_key';
```

**Solution**: Use `IF EXISTS` when dropping constraints.

### Performance Issues

#### Slow Queries After Migration

If queries become slow after migration 007:

```sql
-- Rebuild statistics
ANALYZE questions;
ANALYZE user_answers;

-- Check index usage
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM user_answers
WHERE exam_attempt_id = 'some-id';
```

#### Large User_Answers Table

For large existing installations:

```sql
-- Check table size
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE tablename = 'user_answers';

-- Consider adding more specific indexes if needed
CREATE INDEX CONCURRENTLY idx_user_answers_created_at
ON user_answers(created_at);
```

## Backup and Recovery

### Before Migration

Always backup your database before running migrations:

```bash
# Using pg_dump (if you have direct access)
pg_dump -h your-host -U your-user -d your-database > backup_before_migration.sql

# Using Supabase CLI
supabase db dump -f backup_before_migration.sql
```

### Recovery

If you need to restore:

```bash
# Restore from backup
psql -h your-host -U your-user -d your-database < backup_before_migration.sql
```

### Point-in-Time Recovery

For Supabase users, you can use point-in-time recovery through the dashboard if needed.

## Migration Checklist

- [ ] **Backup database** before starting
- [ ] **Run migration 006** (exam mode support)
- [ ] **Verify migration 006** with validation queries
- [ ] **Run migration 007** (multi-answer support)
- [ ] **Verify migration 007** with validation queries
- [ ] **Test question creation** in admin interface
- [ ] **Test exam/practice mode** selection
- [ ] **Test multi-answer questions** functionality
- [ ] **Verify existing data** still works correctly
- [ ] **Update application code** if needed
- [ ] **Deploy to production** with new features

---

_This migration guide ensures a smooth transition to the new Exam vs Practice Mode and Multi-Answer Question features. Always test in a development environment first._
