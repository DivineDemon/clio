# clio

![Clio Banner](https://img.shields.io/badge/Clio-AI%20README%20Generator-blueviolet)

`clio` is an innovative SaaS platform designed to streamline and automate the creation of high-quality `README.md` files for your GitHub repositories. Leveraging advanced AI capabilities, `clio` analyzes your codebase, identifies key components, and generates comprehensive, professional, and well-structured READMEs, saving developers valuable time and ensuring project documentation is always up-to-date and informative.


## 🚀 Features
- **AI-Powered Content Generation**: Intelligent analysis of repository contents to produce relevant and detailed `README.md` sections.
- **Seamless GitHub Integration**: Connects directly with your GitHub account to access repositories and commit generated READMEs.
- **Interactive Dashboard**: Manage your connected repositories, monitor README generation jobs, and review output.
- **Customizable Output**: Fine-tune generated READMEs to match your project's specific needs and branding.
- **Real-time Job Status**: Track the progress of your README generation tasks from initiation to completion.
- **Version Control**: Automatically handles updates and commits to your repositories.


## ⚙️ Technologies Used
- **Frontend**: Next.js (React), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, tRPC
- **Database**: Prisma (ORM), PostgreSQL
- **Authentication**: NextAuth.js
- **AI/LLM Integration**: TypeScript services for interacting with Language Models
- **GitHub Integration**: Octokit, GitHub App Webhooks
- **Package Manager**: pnpm
- **Linting/Formatting**: Biome


## 📛 Badges

| Badge                                                                               | Description                                    |
| :---------------------------------------------------------------------------------- | :--------------------------------------------- |
| ![GitHub last commit](https://img.shields.io/github/last-commit/DivineDemon/clio)    | Shows the date of the last commit.             |
| ![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/DivineDemon/clio/main.yml) | Placeholder for your CI/CD build status.       |
| ![GitHub top language](https://img.shields.io/github/languages/top/DivineDemon/clio) | Indicates the primary programming language.    |
| ![GitHub contributors](https://img.shields.io/github/contributors/DivineDemon/clio) | Shows the number of project contributors.      |
| ![GitHub license](https://img.shields.io/github/license/DivineDemon/clio)            | Displays the project's license (e.g., MIT).    |

**Note**: Replace `username/clio` with the actual GitHub repository path once available. For the build status, update `main.yml` to your CI/CD workflow file name.


## 📚 Table of Contents
- [clio](#clio)
- [🚀 Features](#-features)
- [⚙️ Technologies Used](#-technologies-used)
- [📛 Badges](#-badges)
- [📚 Table of Contents](#-table-of-contents)
- [🛠️ Installation](#%ef%b8%8f-installation)
- [Prerequisites](#prerequisites)
- [Clone the Repository](#clone-the-repository)
- [Install Dependencies](#install-dependencies)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [GitHub App Setup](#github-app-setup)
- [Run the Development Server](#run-the-development-server)
- [💡 Usage](#-usage)
- [Authentication](#authentication)
- [Install GitHub App](#install-github-app)
- [Generate a README](#generate-a-readme)
- [Monitoring Jobs](#monitoring-jobs)
- [API Endpoints](#api-endpoints)
- [tRPC API](#trpc-api)
- [Next.js API Routes](#nextjs-api-routes)
- [⚙️ Configuration](#%ef%b8%8f-configuration)
- [Environment Variables](#environment-variables-1)
- [Code Formatting & Linting](#code-formatting--linting)
- [UI Components](#ui-components)
- [🤝 Contributing](#-contributing)
- [Local Development Setup](#local-development-setup)
- [Submitting Changes](#submitting-changes)
- [📄 License](#-license)
- [❓ Support](#-support)


## 🛠️ Installation

Follow these steps to set up `clio` locally for development.


### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.x or later recommended)
- pnpm
- PostgreSQL database
- GitHub Account
- OpenAI (or equivalent LLM) API Key


### Clone the Repository

First, clone the `clio` repository to your local machine:

```bash
git clone https://github.com/your-username/clio.git
cd clio
```


### Install Dependencies

`clio` uses `pnpm` as its package manager. Install all required dependencies:

```bash
pnpm install
```


### Environment Variables

Copy the example environment file and fill in the necessary details.

```bash
cp .env.example .env
```

You will need to configure the following environment variables in your `.env` file:
- **Database:**
- `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgresql://user:password@host:port/database?schema=public`).
- **NextAuth.js (for user authentication):**
- `NEXTAUTH_SECRET`: A long, random string used to sign NextAuth.js session cookies. You can generate one using `openssl rand -base64 32`.
- `GITHUB_ID`: Your GitHub OAuth App Client ID.
- `GITHUB_SECRET`: Your GitHub OAuth App Client Secret.
- **GitHub App (for repository integration):**
- `GITHUB_APP_ID`: The ID of your GitHub App.
- `GITHUB_PRIVATE_KEY`: The private key of your GitHub App. This should be the *content* of the `.pem` file, encoded into a single line or read from `src/lib/github-private-key.pem`. For `.env`, it's recommended to store it as a base64 encoded string or directly read the file from `src/lib/github-private-key.pem` if possible, but for simplicity, directly pasting the key content (with newlines replaced) is often done.
- `GITHUB_WEBHOOK_SECRET`: A secret token used to secure your GitHub App webhooks.
- `GITHUB_APP_CLIENT_ID`: The Client ID of your GitHub App (used for authentication flow).
- `GITHUB_APP_CLIENT_SECRET`: The Client Secret of your GitHub App.
- **AI/LLM Service:**
- `OPENAI_API_KEY`: Your API key for the chosen LLM service (e.g., OpenAI).

Example `.env` structure:

```env

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clio?schema=public"


# NextAuth.js
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
GITHUB_ID="YOUR_GITHUB_OAUTH_CLIENT_ID"
GITHUB_SECRET="YOUR_GITHUB_OAUTH_CLIENT_SECRET"


# GitHub App Configuration
GITHUB_APP_ID="YOUR_GITHUB_APP_ID"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----" # Ensure newlines are correctly handled if not reading from file
GITHUB_WEBHOOK_SECRET="YOUR_GITHUB_WEBHOOK_SECRET"
GITHUB_APP_CLIENT_ID="YOUR_GITHUB_APP_CLIENT_ID_FOR_OAUTH_FLOW"
GITHUB_APP_CLIENT_SECRET="YOUR_GITHUB_APP_CLIENT_SECRET_FOR_OAUTH_FLOW"


# LLM Service
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"


# Next.js Public URL
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Or your deployed URL
```


### Database Setup

Run Prisma migrations to set up your database schema:

```bash
pnpm prisma migrate dev --name initial_clio_schema
pnpm prisma generate
```

This will apply the migrations defined in `prisma/migrations` and generate the Prisma client.


### GitHub App Setup

1.  **Create a GitHub App**: Go to your GitHub settings, then "Developer settings" > "GitHub Apps" > "New GitHub App".
2.  **Configure App Details**:
- **GitHub App name**: e.g., `Clio Dev`
- **Homepage URL**: `http://localhost:3000` (or your deployment URL)
- **User authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
- **Webhook URL**: `http://localhost:3000/api/github/webhook`
- **Webhook secret**: Generate a secure secret and save it in your `.env` as `GITHUB_WEBHOOK_SECRET`.
3.  **Permissions**:
- **Repository Permissions**:
- `Contents`: Read & write
- `Metadata`: Read-only
- **Organization Permissions**: (if you want to install on organizations)
- `Members`: Read-only
4.  **Subscribe to Events**:
- `Push`
- `Installation`
- `Installation repositories`
5.  **Generate Private Key**: Generate a new private key and download the `.pem` file. The *contents* of this file go into `GITHUB_PRIVATE_KEY` in your `.env`.
6.  **Get App ID & Client ID/Secret**: Note down your GitHub App ID, Client ID, and Client Secret from the App settings page and add them to your `.env` file.


### Run the Development Server

Once everything is configured, start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## 💡 Usage

Once `clio` is running, you can begin generating `README.md` files.


### Authentication

Navigate to the `clio` homepage. You will be prompted to log in with your GitHub account. `clio` uses NextAuth.js for secure authentication.


### Install GitHub App

After logging in, you'll be directed to the dashboard. To allow `clio` to access your repositories, you need to install the GitHub App you configured during setup. Click the "Install GitHub App" button and follow the prompts to grant `clio` access to the repositories you wish to document.


### Generate a README

1.  **Select Repositories**: From the dashboard, you will see a list of your accessible GitHub repositories.
2.  **Initiate Generation**: Select the repository for which you want to generate a README and initiate the generation process. `clio` will analyze the repository's code, file structure, and existing documentation.
3.  **Review and Customize**: After the AI generates the initial README, you will have an opportunity to review the content, suggest edits, and customize sections to fit your project's unique requirements.
4.  **Publish**: Once satisfied, publish the README directly to your GitHub repository. `clio` will create a pull request or directly commit the new `README.md` file.


### Monitoring Jobs

The "History" or "Jobs" section in the navigation allows you to view the status and details of all your past and ongoing README generation tasks. You can track progress, review outputs, and re-run jobs as needed.


## API Endpoints

`clio` exposes both tRPC procedures for internal frontend-backend communication and standard Next.js API routes for external interactions like GitHub webhooks.


### tRPC API

The tRPC API is located under `src/server/api/routers`. It defines the procedures used by the `clio` frontend to interact with the backend logic, including:
- **`github` router**: Procedures for managing GitHub installations, fetching repositories, triggering syncs, and initiating README generation jobs.
- **`readme` router**: Procedures for interacting with README generation jobs, viewing status, and retrieving results.

You can explore the definitions in `src/server/api/routers/github.ts` and `src/server/api/routers/readme.ts` for specific available procedures and their inputs/outputs.


### Next.js API Routes

These are standard HTTP API routes designed for specific tasks:
- **`src/app/api/auth/[...nextauth]/route.ts`**: Handles authentication callbacks and sessions via NextAuth.js.
- **`src/app/api/auth/setup/route.ts`**: Likely handles initial setup or configuration related to authentication.
- **`src/app/api/github/install/route.ts`**: Manages the installation process of the GitHub App into user accounts/organizations.
- **`src/app/api/github/sync-installation/route.ts`**: Synchronizes repository data after a GitHub App installation or update.
- **`src/app/api/github/sync/route.ts`**: Triggers a synchronization of a specific repository's data.
- **`src/app/api/github/webhook/route.ts`**: The primary endpoint for receiving and processing GitHub App webhook events (e.g., `push`, `installation`, `installation_repositories`).


## ⚙️ Configuration

Beyond environment variables, `clio` uses several configuration files for various tools.


### Code Formatting & Linting

`clio` uses [Biome](https://biomejs.dev/) for robust code formatting and linting.
- **`biome.json`**: Configures Biome rules for TypeScript, JSON, and Markdown files, ensuring consistent code style and quality across the project.


### UI Components

`clio` leverages [shadcn/ui](https://ui.shadcn.com/) for its component library.
- **`components.json`**: This file is used by the `shadcn/ui` CLI to configure component imports and styling.


## 🤝 Contributing

We welcome contributions to `clio`! If you're interested in improving the platform, please follow these guidelines.


### Local Development Setup

Ensure you have followed the [Installation](#installation) steps completely.

1.  **Fork the repository**: Fork `clio` to your GitHub account.
2.  **Create a new branch**:
    ```bash
git checkout -b feature/your-feature-name
```
3.  **Make your changes**: Implement your feature or bug fix. Ensure your code adheres to the project's coding style (enforced by Biome).
4.  **Run tests (if any)**:
    ```bash

# Placeholder for test command, if applicable
    # pnpm test
```
5.  **Format and lint**: Before committing, ensure your code is properly formatted and linted:
    ```bash
pnpm biome format --write ./src
    pnpm biome lint --apply ./src
```


### Submitting Changes

1.  **Commit your changes**: Write clear and descriptive commit messages.
    ```bash
git commit -m "feat: Add new awesome feature"
```
2.  **Push to your fork**:
    ```bash
git push origin feature/your-feature-name
```
3.  **Create a Pull Request**: Open a pull request from your forked repository to the `main` branch of the `clio` repository. Provide a detailed description of your changes.


## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

```
MIT License

Copyright (c) 2023 Your Name or Organization

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```


## ❓ Support

If you encounter any issues or have questions, please feel free to:
- **Open an issue** on the GitHub repository.
- **Start a discussion** on the GitHub repository for broader questions or ideas.

We're here to help!
