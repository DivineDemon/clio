# Clio — The Muse of History

> *"Clio — the Muse of History, telling the story of your code"*

Clio is a web service that reads any GitHub repository (public, private, or organization), analyzes its structure and code, and produces a beautifully structured, comprehensive `README.md`. Users can request generations, view, download, and track history of generated READMEs.

## 🎯 Vision & Features

- **Universal Repository Support**: Works with public, private, and organization GitHub repositories
- **GitHub Authentication**: Secure authentication via GitHub OAuth and GitHub App
- **Asynchronous Processing**: Generate READMEs in the background with email notifications
- **No Repository Modification**: Only generates, views, downloads, and tracks history - never pushes to repos
- **Comprehensive Analysis**: Deep code structure analysis using self-hosted LLM backend

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, tRPC
- **Database**: Prisma + Neon PostgreSQL
- **Authentication**: NextAuth.js with GitHub OAuth
- **GitHub Integration**: GitHub App + Octokit
- **LLM Backend**: Google Gemini 2.5 (Flash & Pro) via Vercel AI SDK
- **Email**: EmailJS for notifications

## 📄 Application Pages & Structure

### **Public Pages**
- **`/`** - Landing Page
- **`/auth/signin`** - Login Page
- **`/auth/signup`** - Register Page  
- **`/auth/forgot-password`** - Forgot Password
- **`/help`** - Help & Documentation
- **`/terms`** - Terms of Service
- **`/privacy`** - Privacy Policy
- **`/cookies`** - Cookie Policy
- **`/dpa`** - Data Processing Agreement

### **Protected Pages (Require Authentication)**
- **`/dashboard`** - Main Dashboard
- **`/repositories`** - Repository Selection
- **`/generate`** - Generate README Form
- **`/jobs/[id]`** - Job Status & Results
- **`/history`** - Job History
- **`/settings`** - Account Settings

### **API Routes**
- **`/api/auth/[...nextauth]`** - NextAuth.js endpoints
- **`/api/trpc/[trpc]`** - tRPC API routes
- **`/api/github/install`** - GitHub App installation
- **`/api/github/webhook`** - GitHub webhooks
- **`/api/jobs`** - Job management
- **`/api/email`** - Email notifications

## 🚀 Development Roadmap

### Phase 1: Authentication & GitHub Integration Setup
**Duration**: 1-2 weeks

#### 1.1 NextAuth.js Configuration
- [ ] Install and configure NextAuth.js with GitHub provider
- [ ] Set up environment variables for GitHub OAuth
- [ ] Create authentication pages (sign-in, callback)
- [ ] Implement session management and user context

#### 1.2 GitHub App Setup
- [ ] Create GitHub App in GitHub Developer Settings
- [ ] Configure app permissions (Repository Contents: Read, Metadata: Read)
- [ ] Set up webhook endpoints for installation events
- [ ] Create installation flow and redirect URLs

#### 1.3 Octokit Integration
- [ ] Install and configure @octokit/rest and @octokit/auth-app
- [ ] Implement installation token generation
- [ ] Create repository access validation functions
- [ ] Set up error handling for GitHub API calls

### Phase 2: Database Schema & Models
**Duration**: 1 week

#### 2.1 Prisma Schema Design
- [ ] Design User model with GitHub integration
- [ ] Create Installation model for GitHub App installations
- [ ] Design GenerationJob model for async processing
- [ ] Create ReadmeHistory model for version tracking
- [ ] Add proper indexes and relationships

#### 2.2 Database Migration
- [ ] Generate and run initial migration
- [ ] Set up database seeding for development
- [ ] Configure Neon PostgreSQL connection
- [ ] Test database operations

### Phase 3: GitHub App Configuration & API Integration
**Duration**: 1-2 weeks

#### 3.1 Repository Access Layer
- [ ] Implement repository installation checking
- [ ] Create repository tree fetching functionality
- [ ] Implement file content retrieval
- [ ] Add repository metadata extraction

#### 3.2 API Routes Development
- [ ] Create `/api/auth` endpoints
- [ ] Implement `/api/check-installation` endpoint
- [ ] Create `/api/install-url` endpoint
- [ ] Build `/api/generate-readme` endpoint
- [ ] Add job status and result endpoints

#### 3.3 Error Handling & Edge Cases
- [ ] Handle repository access denied scenarios
- [ ] Implement rate limiting and retry logic
- [ ] Add support for large repositories
- [ ] Create fallback mechanisms for OAuth

### Phase 4: Core UI Components & Dashboard
**Duration**: 2-3 weeks

#### 4.1 Design System Setup
- [ ] Install and configure shadcn/ui components
- [ ] Set up Tailwind CSS with custom theme
- [ ] Create reusable component library
- [ ] Implement responsive design patterns

#### 4.2 Page Structure & Routing
- [ ] Set up Next.js App Router page structure
- [ ] Implement protected route middleware
- [ ] Create layout components and navigation
- [ ] Add error boundaries and loading states

#### 4.3 Landing Page (`/`)
**Content Requirements:**
- Hero section with Clio branding and tagline
- Feature highlights (GitHub integration, async processing, no repo modification)
- How it works (3-step process: Connect → Generate → Download)
- Pricing information (free tier + premium features)
- Call-to-action buttons (Get Started, View Examples)
- Footer with links, social media, and legal pages

#### 4.4 Authentication Pages
**Login Page (`/auth/signin`)**
- GitHub OAuth sign-in button
- "Remember me" checkbox
- Link to register page
- Link to forgot password
- Terms of service and privacy policy links
- Demo mode option for testing

**Register Page (`/auth/signup`)**
- GitHub OAuth sign-up button
- Email collection (optional for notifications)
- Terms of service acceptance checkbox
- Privacy policy acknowledgment
- Link to login page
- Account type selection (Personal/Organization)

**Forgot Password Page (`/auth/forgot-password`)**
- Email input field
- Send reset link button
- Back to login link
- Password reset instructions
- Security notice about GitHub OAuth

#### 4.5 Dashboard (`/dashboard`)
**Content Requirements:**
- Welcome message with user's GitHub username/avatar
- GitHub App installation status card
- Quick actions section:
  - "Generate New README" button
  - "Browse Repositories" button
  - "View History" button
- Recent activity feed (last 5 generation jobs)
- Repository access status overview
- Quick stats (total READMEs generated, success rate)
- Navigation sidebar with main sections

#### 4.6 Account Settings (`/settings`)
**Content Requirements:**
- Profile section:
  - GitHub profile information (read-only)
  - Display name customization
  - Avatar display
- Notification preferences:
  - Email notifications toggle
  - Job completion notifications
  - Weekly digest option
- GitHub App management:
  - Installation status per organization
  - Reinstall/update app buttons
  - Permission overview
- Account actions:
  - Export data option
  - Delete account button
  - Sign out button
- Billing section (for future premium features)

#### 4.7 Repository Management UI
- [ ] Create repository selection interface (`/repositories`)
- [ ] Build installation status indicators
- [ ] Implement repository access validation UI
- [ ] Add repository browsing and search functionality
- [ ] Create repository details modal/page

#### 4.8 Additional Pages

**Repository Selection (`/repositories`)**
- List of accessible repositories (personal + organizations)
- Search and filter functionality
- Installation status indicators
- Repository metadata (language, stars, last updated)
- "Generate README" action buttons

**Generate README (`/generate`)**
- Repository selection dropdown/search
- Generation options:
  - Template selection (Standard, Minimal, Comprehensive)
  - Include/exclude sections toggle
  - Custom instructions textarea
- Preview of selected repository structure
- Generate button with progress indicator

**Job Status (`/jobs/[id]`)**
- Real-time job progress updates
- Repository information and commit SHA
- Generation options used
- Progress bar and status messages
- Cancel job option (if still running)
- Download result button (when complete)
- Error details (if failed)

**Job History (`/history`)**
- Paginated list of all generation jobs
- Filter by status, date, repository
- Search functionality
- Job details modal
- Bulk actions (download, delete)
- Export history option

**Help & Documentation (`/help`)**
- Getting started guide
- GitHub App installation instructions
- FAQ section
- Troubleshooting guide
- Contact support form
- API documentation (for future)

**Legal Pages**
- Terms of Service (`/terms`)
- Privacy Policy (`/privacy`)
- Cookie Policy (`/cookies`)
- Data Processing Agreement (`/dpa`)

#### 4.9 Job Management Interface
- [ ] Design job creation form (`/generate`)
- [ ] Build job status tracking interface (`/jobs/[id]`)
- [ ] Create job history and results viewer (`/history`)
- [ ] Implement download and copy functionality
- [ ] Add job comparison and diff features

### Phase 5: README Generation Pipeline
**Duration**: 2-3 weeks

#### 5.1 LLM Integration
- [ ] Set up Open WebUI backend connection
- [ ] Implement DeepSeek-R1 model integration
- [ ] Create prompt engineering for README generation
- [ ] Add model response parsing and validation

#### 5.2 Code Analysis Engine
- [ ] Implement repository structure analysis
- [ ] Create code file type detection
- [ ] Build dependency and technology detection
- [ ] Add code quality and complexity metrics

#### 5.3 README Template System
- [ ] Design comprehensive README template
- [ ] Implement dynamic section generation
- [ ] Create markdown formatting and styling
- [ ] Add customizable template options

#### 5.4 Asynchronous Processing
- [ ] Set up job queue system (Redis/Bull)
- [ ] Implement background job processing
- [ ] Add progress tracking and status updates
- [ ] Create job retry and error handling

### Phase 6: Email Notifications & Job Management
**Duration**: 1-2 weeks

#### 6.1 Email Service Integration
- [ ] Set up email service provider (SendGrid/SES)
- [ ] Create email templates for notifications
- [ ] Implement job completion notifications
- [ ] Add email preferences and settings

#### 6.2 Advanced Job Features
- [ ] Implement job scheduling and queuing
- [ ] Add job priority and resource management
- [ ] Create job analytics and reporting
- [ ] Build job cleanup and archival

#### 6.3 User Experience Enhancements
- [ ] Add real-time job status updates
- [ ] Implement job progress indicators
- [ ] Create job comparison and diff features
- [ ] Add bulk operations and batch processing

### Phase 7: Production Deployment & Monitoring
**Duration**: 1-2 weeks

#### 7.1 Production Environment Setup
- [ ] Configure production database (Neon)
- [ ] Set up production GitHub App
- [ ] Configure environment variables and secrets
- [ ] Implement security best practices

#### 7.2 Deployment Pipeline
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure automated testing
- [ ] Implement database migrations
- [ ] Set up staging environment

#### 7.3 Monitoring & Analytics
- [ ] Implement application monitoring (Sentry)
- [ ] Add performance metrics and logging
- [ ] Set up error tracking and alerting
- [ ] Create user analytics and usage tracking

#### 7.4 Documentation & Launch
- [ ] Create comprehensive documentation
- [ ] Write API documentation
- [ ] Create user guides and tutorials
- [ ] Prepare launch and marketing materials

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database (Neon recommended)
- GitHub App credentials
- Email service provider account

### Environment Variables

Create a `.env.local` file in your project root by copying `.env.example`:

```bash
cp .env.example .env.local
```

Then fill in your actual values. Here's what you need to set up:

#### **Required for Development**

1. **Database (Neon PostgreSQL)**:
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string to `DATABASE_URL`

2. **GitHub OAuth App**:
   - Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
   - Create new OAuth App
   - Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID → `AUTH_GITHUB_ID`
   - Copy Client Secret → `AUTH_GITHUB_SECRET`

3. **GitHub App** (for repository access):
   - Go to [GitHub Settings > Developer settings > GitHub Apps](https://github.com/settings/apps/new)
   - Create new GitHub App with these permissions:
     - Repository: Contents (Read), Metadata (Read)
     - Account: Email addresses (Read)
   - Set webhook URL: `http://localhost:3000/api/github/webhook`
   - Copy App ID → `GITHUB_APP_ID`
   - Download private key → `GITHUB_PRIVATE_KEY`
   - Generate webhook secret → `GITHUB_WEBHOOK_SECRET`

4. **Email Service** (EmailJS):
   - Sign up at [emailjs.com](https://emailjs.com)
   - Create an email service (Gmail, Outlook, etc.)
   - Create email templates for notifications
   - Copy Service ID → `EMAILJS_SERVICE_ID`
   - Copy Template ID → `EMAILJS_TEMPLATE_ID`
   - Copy Public Key → `EMAILJS_PUBLIC_KEY`
   - Set sender email → `EMAIL_FROM`

5. **Google Gemini API**:
   - Get API key from [Google AI Studio](https://aistudio.google.com/)
   - Set API key → `GEMINI_API_KEY`
   - Choose model → `GEMINI_MODEL` (default: gemini-2.5-flash)

#### **Environment Variables Overview**
```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth.js
AUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (NextAuth.js Provider)
AUTH_GITHUB_ID="your-github-oauth-client-id"
AUTH_GITHUB_SECRET="your-github-oauth-client-secret"

# GitHub App (Repository Access)
GITHUB_APP_ID="123456"
GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
GITHUB_WEBHOOK_SECRET="your-webhook-secret"

# Email Service (EmailJS)
EMAILJS_SERVICE_ID="your-service-id"
EMAILJS_TEMPLATE_ID="your-template-id"
EMAILJS_PUBLIC_KEY="your-public-key"
EMAIL_FROM="noreply@yourdomain.com"

# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"

# Development (Optional)
NODE_ENV="development"
SKIP_ENV_VALIDATION="false"
DEBUG="clio:*"
```

#### **Redis (Optional - Only for Production Job Queue)**
Redis is only needed if you want to implement a proper job queue system for production. For development and small-scale usage, you can:

- **Skip Redis**: Use simple database-based job processing
- **Add Redis later**: When you need horizontal scaling and advanced job management

**When you need Redis:**
- Multiple server instances
- Advanced job scheduling and retry logic
- Job priority management
- Real-time job progress updates
- High-volume README generation

**For now, you can skip Redis and use:**
- Database-based job processing
- Simple async/await patterns
- File-based job status tracking

### Getting Started
```bash
# Install dependencies
pnpm install

# Set up database
pnpm db:push

# Start development server
pnpm dev
```

## 📋 Current Status

- ✅ Project initialized with T3 Stack
- ✅ Basic Next.js setup with TypeScript
- ✅ Prisma configured with PostgreSQL
- ✅ Tailwind CSS and styling setup
- 🔄 Development roadmap created
- ⏳ Phase 1: Authentication setup (Next)

## 🤝 Contributing

This project is in active development. Please refer to the development roadmap above for current priorities and upcoming features.

## 📄 License

[Add your license here]

---

*Built with ❤️ using the T3 Stack*