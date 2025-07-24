# QuizForce - Salesforce Certification Practice Platform

QuizForce is a comprehensive Salesforce certification practice platform that provides realistic practice exams to help professionals pass their Salesforce certifications. Built with Next.js 15, React 19, TypeScript, and Supabase.

## 🚀 Key Features

### 📚 **Exam Modes**

- **Exam Mode**: Timed, realistic exam simulation with results shown at completion
- **Practice Mode**: Self-paced learning with immediate feedback and explanations

### 📝 **Question Types**

- **Single Answer Questions**: Traditional multiple choice (select one correct answer)
- **Multi-Answer Questions**: Salesforce-style questions requiring multiple correct selections
- **Realistic Format**: Matches official Salesforce certification exam structure

### 🎯 **Core Functionality**

- Comprehensive practice exams for all major Salesforce certifications
- One-time purchase model (no subscriptions)
- 12-month access period from enrollment
- Mobile-first responsive design
- Real-time progress tracking and analytics

### 🛠️ **Admin Features**

- Complete question management system
- Support for creating both single and multi-answer questions
- Question categorization and difficulty levels
- Comprehensive reporting and analytics

## 🏗️ Technology Stack

### Frontend

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** icons

### Backend

- **Next.js API Routes** for server-side logic
- **Supabase** for database and authentication
- **PostgreSQL** database
- **Stripe** for payment processing

### Infrastructure

- **Vercel** deployment and hosting
- **Supabase** database hosting
- **Sentry** error tracking and monitoring

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (for payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd quizforce
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Stripe Configuration
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Sentry Configuration (optional)
   SENTRY_DSN=your_sentry_dsn
   ```

4. **Set up the database**

   ```bash
   # Navigate to database directory
   cd database

   # Run migrations in order (001 through 007)
   # Execute each migration file in Supabase SQL Editor
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Migrations

The application includes several database migrations that must be run in order:

1. **001_initial_schema.sql** - Basic table structure
2. **002_auth_setup.sql** - Authentication and user management
3. **003_practice_exams.sql** - Exam and question management
4. **004_user_answers.sql** - Answer tracking system
5. **005_knowledge_areas.sql** - Categorization system
6. **006_exam_mode_support.sql** - Adds exam mode functionality
7. **007_multi_answer_support.sql** - Multi-answer question support

## 🎮 Using the Platform

### For Students

1. **Sign up or sign in** to your account
2. **Browse the catalog** to find certifications
3. **Choose your mode**:
   - **Exam Mode**: Realistic timed practice with final results
   - **Practice Mode**: Self-paced learning with immediate feedback
4. **Take practice exams** and track your progress
5. **Review results** and identify areas for improvement

### For Administrators

1. **Access the admin panel** at `/admin`
2. **Create questions** with support for:
   - Single correct answer (radio buttons)
   - Multiple correct answers (checkboxes with required selection count)
3. **Manage practice exams** and question categorization
4. **Monitor user progress** and system analytics

## 🔥 New Features (Latest Release)

### Exam vs Practice Mode Selection

- **Mode Selection UI**: Clear interface for choosing between exam and practice modes
- **Dynamic Experience**: Timer and feedback adjust based on selected mode
- **Database Tracking**: Mode preference stored and tracked per exam attempt

### Multi-Answer Question Support

- **Question Types**: Support for questions requiring multiple correct selections
- **Salesforce Format**: Exactly matches official certification exam format
- **Smart Validation**: Prevents incorrect submissions and provides clear feedback
- **Admin Tools**: Complete interface for creating and managing multi-answer questions

### Enhanced User Experience

- **Improved Timer**: Visual warnings, pause/resume functionality, auto-submit protection
- **Better Feedback**: Immediate explanations in practice mode with detailed analysis
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support

## 🧪 Testing

```bash
# Run the test suite
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Check code coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run start
```

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to your hosting provider
# Upload the .next folder and other required files
```

## 📚 API Documentation

### Core Endpoints

- **GET /api/practice-exams** - List available practice exams
- **POST /api/exam/start** - Start a new exam attempt
- **GET /api/exam/session/[attemptId]** - Get exam session data
- **POST /api/exam/save-answer** - Save user answers (supports both single and multi-answer)
- **POST /api/exam/submit** - Submit completed exam for scoring

### Admin Endpoints

- **GET /api/admin/questions** - List all questions
- **POST /api/admin/questions** - Create new questions (supports required_selections field)
- **PUT /api/admin/questions/[id]** - Update existing questions
- **DELETE /api/admin/questions/[id]** - Delete questions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔒 Security

- All API endpoints include authentication validation
- User data is encrypted in transit and at rest
- Input validation prevents SQL injection and XSS attacks
- Secure payment processing via Stripe

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🆘 Support

For support and questions:

- Check the documentation in the `/docs` folder
- Review the API documentation above
- Check existing GitHub issues
- Contact the development team

## 🔄 Recent Updates

- **v2.1.0**: Added Exam vs Practice Mode selection
- **v2.0.0**: Multi-answer question support with Salesforce-compliant format
- **v1.5.0**: Enhanced timer functionality with pause/resume
- **v1.4.0**: Improved admin interface for question management
- **v1.3.0**: Mobile responsive design improvements
# Force Vercel redeploy
# Trigger redeploy after env vars
# Manual deployment trigger Wed Jul 23 22:00:52 EDT 2025
# Force redeploy with new Supabase credentials Thu Jul 24 13:51:23 EDT 2025
# Redeploy with Vercel Supabase integration Thu Jul 24 14:12:18 EDT 2025
