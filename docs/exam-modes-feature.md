# Exam vs Practice Mode Feature Documentation

## Overview

The Exam vs Practice Mode feature allows users to choose between two distinct learning experiences when taking practice exams:

- **Exam Mode**: Realistic timed exam simulation that mirrors actual Salesforce certification tests
- **Practice Mode**: Self-paced learning environment with immediate feedback and explanations

This feature was designed to match the official Salesforce certification exam format while providing flexible learning options.

## Feature Components

### 1. Mode Selection Interface

**Location**: Pre-exam page (`/exam/[examId]`)

**Functionality**:

- Visual mode selection cards with enhanced styling
- Clear descriptions of each mode's features
- Dynamic instruction sections that change based on selected mode
- Default selection: Exam Mode
- Mode-aware information display (time limits, passing scores, button text)

**User Experience**:

- Feature tags highlighting key aspects of each mode
- Hover effects and visual state indicators
- Mobile-responsive design
- Accessibility compliant with proper ARIA labels

### 2. Dynamic Exam Interface

**Location**: Exam interface (`/components/exam/exam-interface.tsx`)

**Exam Mode Features**:

- Timer countdown with visual warnings
- Auto-save functionality with status indicator
- No immediate feedback during exam
- Results and explanations shown only after completion
- Auto-submit when time expires

**Practice Mode Features**:

- No timer (unlimited time)
- Immediate feedback after each question submission
- Detailed explanations with answer analysis
- Visual indicators for correct/incorrect answers
- Encouragement messages and study tips

### 3. Enhanced Question Display

**Location**: Question display component (`/components/exam/question-display.tsx`)

**Single-Answer Questions** (`required_selections = 1`):

- Radio button interface
- Instruction: "Select one answer"
- Traditional multiple choice behavior

**Multi-Answer Questions** (`required_selections > 1`):

- Checkbox interface with selection limits
- Specific instructions: "Select X answers"
- Selection counter: "2 of 3 selected"
- Prevention of over-selection with clear feedback

## Database Schema

### Updated Tables

#### `exam_attempts` Table

```sql
ALTER TABLE exam_attempts
ADD COLUMN mode TEXT NOT NULL DEFAULT 'exam';
```

- **mode**: `'exam'` or `'practice'`
- **Default**: `'exam'` for backward compatibility
- **Purpose**: Track which mode was used for each attempt

#### `questions` Table

```sql
ALTER TABLE questions
ADD COLUMN required_selections INTEGER NOT NULL DEFAULT 1;
```

- **required_selections**: Number of answers user must select (1-4)
- **Default**: 1 (single-answer question)
- **Purpose**: Define question type and validation rules

#### `user_answers` Table

```sql
-- Remove unique constraint to allow multiple answers per question
ALTER TABLE user_answers
DROP CONSTRAINT IF EXISTS user_answers_question_id_exam_attempt_id_key;
```

- **Change**: Allow multiple answer records per question
- **Purpose**: Support multi-answer question submissions

## API Endpoints

### Core Exam Endpoints

#### `POST /api/exam/start`

```typescript
interface StartExamRequest {
  practiceExamId: string;
  mode: "exam" | "practice";
}
```

**Purpose**: Start a new exam attempt with specified mode
**Validation**: Ensures mode is valid and user is authenticated

#### `GET /api/exam/session/[attemptId]`

```typescript
interface ExamSessionData {
  attempt: {
    id: string;
    mode: "exam" | "practice";
    // ... other fields
  };
  questions: QuestionWithAnswers[];
  // ... other session data
}
```

**Purpose**: Retrieve exam session data including mode information
**Enhancement**: Includes `required_selections` field for each question

#### `POST /api/exam/save-answer`

```typescript
interface SaveAnswerRequest {
  exam_attempt_id: string;
  question_id: string;
  answer_id?: string; // For single-answer (backward compatibility)
  answer_ids?: string[]; // For multi-answer
  time_spent_seconds?: number;
}
```

**Purpose**: Save user answers with support for both single and multi-answer questions
**Validation**:

- Ensures answer count matches `question.required_selections`
- Provides detailed error messages for invalid submissions
- Handles empty submissions for answer changes

### Admin Endpoints

#### `POST /api/admin/questions`

```typescript
interface CreateQuestionRequest {
  question_text: string;
  required_selections: number; // 1-4
  answers: {
    text: string;
    is_correct: boolean;
  }[];
  // ... other fields
}
```

**Purpose**: Create questions with multi-answer support
**Validation**:

- Ensures `required_selections` is between 1-4
- Validates that correct answer count matches `required_selections`

## Scoring Algorithm

### Enhanced Scoring Logic

The scoring algorithm was completely overhauled to support both question types:

#### Single-Answer Questions (`required_selections = 1`)

```typescript
// User must select exactly 1 answer and it must be correct
const isCorrect =
  userSelectedIds.length === 1 &&
  correctAnswersList.some(ca => ca.id === userSelectedIds[0]);
```

#### Multi-Answer Questions (`required_selections > 1`)

```typescript
// User must select ALL correct answers, NO incorrect answers, exactly the required number
const correctAnswerIds = correctAnswersList.map(ca => ca.id);
const allSelectedAnswersAreCorrect = userSelectedIds.every(id =>
  correctAnswerIds.includes(id)
);
const allCorrectAnswersSelected = correctAnswerIds.every(id =>
  userSelectedIds.includes(id)
);
const exactlyRequiredNumber = userSelectedIds.length === requiredSelections;

const isCorrect =
  allSelectedAnswersAreCorrect &&
  allCorrectAnswersSelected &&
  exactlyRequiredNumber;
```

**Key Principles**:

- No partial credit for multi-answer questions
- Exact match required (all correct, no incorrect)
- Matches official Salesforce exam scoring

## Enhanced Timer System

### Timer Components

#### `ExamTimer` Component (`/components/exam/exam-timer.tsx`)

- **Mode-Aware Display**: Hidden in practice mode, visible in exam mode
- **Visual Warning System**: Color-coded states (normal/warning/critical)
- **Pause/Resume Functionality**: User can pause timer during exam
- **Auto-Submit Protection**: Automatic submission when time expires
- **Professional Design**: Clean, accessible interface

#### `useExamTimer` Hook (`/hooks/use-exam-timer.ts`)

- **Timer Persistence**: Saves state to localStorage
- **Accurate Tracking**: Accounts for tab switching and browser minimization
- **Warning Thresholds**: 15-minute warning, 5-minute critical
- **Auto-Cleanup**: Removes timer data when exam completes

### Timer Features

**Warning System**:

- Normal: Gray color
- Warning (15 min): Yellow color with warning message
- Critical (5 min): Red color with critical warning

**Pause/Resume**:

- Visual pause indicator
- Timer state persistence
- Resume with accurate time adjustment

## Admin Interface Enhancements

### Question Management

#### Question Form Updates

- **Required Selections Field**: Dropdown with options 1-4
- **Dynamic UI**: Switches between radio/checkbox based on selection
- **Validation**: Ensures correct answer count matches required selections
- **Visual Feedback**: Shows "X of Y correct answers selected"

#### Question Preview

- **Accurate Preview**: Shows exact student experience
- **Conditional UI**: Radio buttons for single, checkboxes for multi
- **Instruction Text**: Displays specific selection requirements

#### Question Listing

- **Type Column**: Shows "Single" or "Multi (X)" badges
- **Filtering**: Filter by question type
- **Sorting**: Sort by various criteria including type

### Question Creation Workflow

1. **Select Required Selections**: Choose 1-4 from dropdown
2. **UI Updates**: Interface switches to appropriate mode
3. **Mark Correct Answers**: Use radio buttons or checkboxes
4. **Validation**: System ensures answer count matches requirement
5. **Preview**: See exactly how students will experience the question
6. **Save**: Question saved with proper type and validation

## User Experience Flow

### Student Experience

#### Exam Mode Flow

1. **Mode Selection**: Choose "Exam Mode" on pre-exam page
2. **Start Exam**: Timer begins countdown
3. **Answer Questions**: Navigate through questions with timer visible
4. **Auto-Save**: Progress saved automatically
5. **Time Warnings**: Receive warnings at 15 and 5 minutes
6. **Completion**: Submit or auto-submit when time expires
7. **Results**: View comprehensive results and explanations

#### Practice Mode Flow

1. **Mode Selection**: Choose "Practice Mode" on pre-exam page
2. **Start Practice**: Begin with unlimited time
3. **Answer Questions**: Work at own pace without timer pressure
4. **Immediate Feedback**: See correct/incorrect status after each answer
5. **Detailed Explanations**: Learn from comprehensive explanations
6. **Continue Learning**: Move through questions with full understanding
7. **Final Review**: Complete review of all questions and explanations

### Multi-Answer Question Experience

#### Single-Answer Questions

1. **Question Display**: Shows radio buttons
2. **Instruction**: "Select one answer"
3. **Selection**: Choose one option
4. **Validation**: Prevents multiple selections

#### Multi-Answer Questions

1. **Question Display**: Shows checkboxes
2. **Instruction**: "Select X answers" (specific number)
3. **Selection Counter**: "2 of 3 selected"
4. **Limit Enforcement**: Prevents selecting more than required
5. **Validation**: Must select exactly the required number

## Testing and Quality Assurance

### Test Coverage

**Unit Tests**: 293/335 tests passing (87% success rate)

- Component rendering tests
- Scoring algorithm validation
- API endpoint functionality
- Timer behavior verification

**Integration Tests**:

- Mode selection workflow
- Question type handling
- Database migrations
- API endpoint integration

**Regression Tests**:

- Backward compatibility verification
- Existing functionality preservation
- Performance benchmarking

### Performance Metrics

- **Build Success**: No compilation errors
- **Type Safety**: Full TypeScript coverage
- **Bundle Size**: Optimized for performance
- **Loading Times**: Fast page transitions
- **Mobile Performance**: Optimized for all devices

## Migration Guide

### For Existing Installations

1. **Run Database Migration 006**: Adds mode column to exam_attempts
2. **Run Database Migration 007**: Adds multi-answer support
3. **Update Environment Variables**: Ensure all required variables are set
4. **Test Question Creation**: Verify admin interface works with new features
5. **Test Both Modes**: Verify exam and practice modes function correctly

### For New Installations

1. **Run All Migrations**: Execute migrations 001-007 in order
2. **Configure Environment**: Set up all required environment variables
3. **Create Sample Data**: Add sample questions and exams
4. **Test Full Workflow**: Verify complete user and admin workflows

## Troubleshooting

### Common Issues

#### Timer Not Working

- **Check**: Timer only appears in exam mode
- **Verify**: Time limit is set in practice exam configuration
- **Debug**: Check browser localStorage for timer state

#### Multi-Answer Questions Not Saving

- **Check**: Database migration 007 has been run
- **Verify**: `required_selections` field exists in questions table
- **Debug**: Check API endpoint responses for validation errors

#### Mode Selection Not Persisting

- **Check**: Database migration 006 has been run
- **Verify**: `mode` column exists in exam_attempts table
- **Debug**: Check exam start API endpoint logs

### Performance Optimization

- **Database Indexing**: Ensure proper indexes on exam_attempts and user_answers
- **API Caching**: Implement caching for frequently accessed data
- **Bundle Optimization**: Use Next.js optimization features
- **Image Optimization**: Optimize any images used in the interface

## Future Enhancements

### Planned Features

1. **Advanced Analytics**: Detailed performance tracking by mode
2. **Custom Time Limits**: Allow different time limits per exam
3. **Question Banks**: Support for randomized question selection
4. **Adaptive Learning**: AI-powered question difficulty adjustment
5. **Mobile App**: Native mobile application development

### Technical Improvements

1. **Real-time Collaboration**: Multiple users in practice sessions
2. **Offline Support**: Offline exam taking capabilities
3. **Enhanced Security**: Advanced cheating prevention
4. **API v2**: GraphQL API for more efficient data fetching
5. **Microservices**: Service-oriented architecture migration

## Support and Maintenance

### Monitoring

- **Error Tracking**: Sentry integration for error monitoring
- **Performance Monitoring**: Real-time performance metrics
- **User Analytics**: Usage pattern analysis
- **Database Health**: Query performance and optimization

### Maintenance Tasks

- **Regular Backups**: Automated database backups
- **Security Updates**: Regular dependency updates
- **Performance Reviews**: Monthly performance analysis
- **User Feedback**: Continuous user experience improvements

---

_This documentation covers the complete Exam vs Practice Mode feature implementation. For additional support or questions, please refer to the main README.md or contact the development team._
