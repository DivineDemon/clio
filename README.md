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
- **LLM Backend**: Open WebUI serving DeepSeek-R1
- **Email**: SendGrid/SES/Mailgun for notifications

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

#### 4.2 Authentication UI
- [ ] Design and implement sign-in page
- [ ] Create user dashboard layout
- [ ] Build GitHub App installation flow
- [ ] Add user profile and settings pages

#### 4.3 Repository Management UI
- [ ] Create repository selection interface
- [ ] Build installation status indicators
- [ ] Implement repository access validation UI
- [ ] Add repository browsing and selection

#### 4.4 Job Management Interface
- [ ] Design job creation form
- [ ] Build job status tracking interface
- [ ] Create job history and results viewer
- [ ] Implement download and copy functionality

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
```bash
# Database
DATABASE_URL="postgresql://..."

# GitHub App
GITHUB_APP_ID="123456"
GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Email Service
EMAIL_API_KEY="your_email_api_key"
EMAIL_FROM="noreply@clio.dev"

# LLM Backend
LLM_API_URL="http://localhost:8080"
LLM_API_KEY="your_llm_api_key"
```

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