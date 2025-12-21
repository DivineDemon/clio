# clio 🚀

clio is a sophisticated SaaS application that leverages Artificial Intelligence to automatically generate professional README.md files for GitHub repositories. It streamlines the documentation process, ensuring your projects are well-presented and easily understood by potential collaborators and users.


## Badges

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next-black?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TRPC](https://img.shields.io/badge/tRPC-4A90E2?style=flat&logo=trpc&logoColor=white)](https://trpc.io/)


## Table of Contents
- [clio 🚀](#clio-)
- [Badges](#badges)
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)


## Features
- **AI-Powered README Generation**: Utilizes Gemini to craft comprehensive and informative README files.
- **GitHub Integration**: Seamlessly connects with GitHub to access repository information and generate documentation.
- **Customization Options**: Allows users to fine-tune the generated README content and structure.
- **Repository Analysis**: Analyzes repository content, structure, and metadata to create accurate documentation.
- **Version Control**: Tracks changes and provides version history for generated READMEs.
- **User Dashboard**: An intuitive interface for managing repositories, generating READMEs, and viewing job statuses.
- **Stripe Integration**: Supports payment processing for premium features.


## Tech Stack
- **Language**: TypeScript
- **Framework**: Next.js
- **Database**: PostgreSQL (with Prisma ORM)
- **Styling**: Tailwind CSS, CSS Modules
- **Authentication**: NextAuth.js
- **API Layer**: tRPC
- **AI Integration**: Gemini for content generation.


## Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/clio.git
cd clio
```

2. **Install dependencies:**
   clio uses `pnpm` as its package manager.
```bash
pnpm install
```

3. **Set up environment variables:**
   Copy the `.env.example` file to `.env` and fill in your credentials.
```bash
cp .env.example .env
```
   You will need to configure:
- `DATABASE_URL`: Your PostgreSQL database connection string.
- `GITHUB_CLIENT_ID`: Your GitHub OAuth application Client ID.
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth application Client Secret.
- `NEXTAUTH_SECRET`: A secret for NextAuth.js.
- `STRIPE_SECRET_KEY`: Your Stripe secret key.
- `GEMINI_API_KEY`: Your Gemini API key for AI model access.

4. **Initialize the database:**
```bash
pnpm prisma migrate dev
```

5. **Run the development server:**
```bash
pnpm dev
```

Your clio application should now be running locally on `http://localhost:3000`.


## Usage

1. **Log in with your GitHub account.**
2. **Connect your GitHub repositories.**
3. **Select a repository and initiate README generation.**
4. **Review and customize the generated README content.**
5. **Save the generated README to your GitHub repository.**


## Configuration

The application's configuration is managed through environment variables. Please refer to the `.env.example` file for a comprehensive list of variables and their descriptions. Key variables include:
- `DATABASE_URL`: Connection string for your PostgreSQL database.
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: Credentials for your GitHub OAuth application.
- `NEXTAUTH_SECRET`: Secret used for NextAuth.js session management.
- `STRIPE_SECRET_KEY`: Your Stripe API secret key for payment processing.
- `GEMINI_API_KEY`: Your Gemini API key for accessing language models.


## API Documentation

`clio` exposes several API endpoints for managing repositories, generating READMEs, and handling webhooks. These are primarily managed via tRPC.


### Key API Routes
- `/api/auth/setup`: Endpoint for setting up authentication.
- `/api/github/install`: Handles GitHub app installation.
- `/api/github/sync-installation`: Synchronizes GitHub app installations.
- `/api/github/sync`: Initiates synchronization of repository data.
- `/api/github/webhook`: Receives GitHub webhook events.
- `/api/trpc/[trpc]`: tRPC endpoint for backend communication.
- `/api/webhooks/stripe`: Handles Stripe webhook events.

The specific tRPC procedures can be found within the `src/server/api/routers/` directory.


## Contributing

We welcome contributions to clio! Please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix (`git checkout -b feature/AmazingFeature`).
3.  **Make your changes** and ensure they are well-tested.
4.  **Commit your changes** (`git commit -m 'Add some AmazingFeature'`).
5.  **Push to the branch** (`git push origin feature/AmazingFeature`).
6.  **Open a Pull Request.**

Please ensure your code adheres to the project's coding style and includes relevant documentation.


## License

This project is licensed under the MIT License - see the [LICENSE](#license) file for details.
