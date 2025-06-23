# CI/CD Pipeline and Slack Notifications

This document describes the CI/CD pipeline for this project, including all GitHub Actions workflows and how Slack notifications are integrated.

## Overview of CI/CD Workflows

The project uses several GitHub Actions workflows, each with a specific purpose in the CI/CD process:

### 1. ci.yml (Continuous Integration)

- **Purpose:** Runs on every push and pull request to any branch.
- **Jobs:**
   - **lint:** Runs ESLint to check code style and quality.
   - **typecheck:** Runs TypeScript type checking.
   - **vitest:** Runs unit and coverage tests with Vitest.
   - **e2e-tests:** Triggers Playwright end-to-end tests via the reusable workflow.
- **Key Features:**
   - Uses pnpm for dependency management and caching.
   - Ensures code quality and correctness before merging or deploying.

### 2. deploy.yml (Deployment)

- **Purpose:** Deploys the application to Fly.io after a successful CI run.
- **Trigger:** Runs when the CI workflow completes successfully.
- **Jobs:**
   - **deploy_staging:** Deploys to the staging environment if the branch is `dev`.
   - **deploy_production:** Deploys to production if the branch is `main`.
- **Key Features:**
   - Uses Fly.io CLI for deployment.
   - Reads app name from `fly.toml`.
   - Supports rolling deployments and concurrency control.

### 3. playwright.yml (Manual Playwright Tests)

- **Purpose:** Allows manual triggering of Playwright end-to-end tests.
- **Trigger:** Can be started manually from the GitHub Actions UI.
- **Jobs:**
   - **e2e-tests:** Runs the reusable Playwright workflow with user-specified environment.
- **Key Features:**
   - Supports testing against different environments (local, staging).

### 4. playwright-reusable.yml (Reusable Playwright Tests)

- **Purpose:** Defines a reusable workflow for running Playwright end-to-end tests.
- **Trigger:** Called by other workflows (like ci.yml or playwright.yml).
- **Jobs:**
   - **playwright:** Runs Playwright tests, builds the app, sets up the database, and uploads test reports.
- **Key Features:**
   - Handles environment setup, database migration, and artifact upload.
   - Can be parameterized for different environments and artifact suffixes.

### 5. slack.yml (Slack Notifications)

- **Purpose:** Sends notifications to Slack about workflow results (successes, failures, etc.).
- **Trigger:** Runs on every push to `main` and `dev` branches.
- **Jobs:**
   - **slack-notifications:** Posts a message to a Slack channel using an incoming webhook.
- **Key Features:**
   - Notifies the team about build results, including links to commits and workflow runs.

---

## Slack Notification Workflow

This project uses a GitHub Actions workflow to send notifications to Slack about CI/CD events such as build results, workflow successes, and failures.

### How it works

- The workflow is defined in `.github/workflows/slack.yml`.
- It triggers on every push to the `main` and `dev` branches.
- After each workflow run, a message is sent to a designated Slack channel using an incoming webhook.
- The message includes:
   - The build result (success or failure)
   - The branch name
   - The GitHub actor who triggered the workflow
   - The commit message
   - Direct links to the commit and the workflow run

### Example Slack Message

```
*GitHub Action build result*: success on branch dev by alice
https://github.com/your-org/your-repo/commit/abc123

GitHub Action build result: success on branch `dev`
Triggered by: alice
Commit message: Update dependencies
View Commit | View Workflow Run
```

### How to Configure Slack Notifications

1. **Create a Slack Incoming Webhook**
   - Go to your Slack workspace settings and add a new [Incoming Webhook](https://api.slack.com/messaging/webhooks).
   - Choose the channel where you want to receive notifications.
   - Copy the generated webhook URL.
2. **Add the webhook to GitHub**
   - Go to your repository's **Settings > Secrets and variables > Actions**.
   - Add a new secret named `SLACK_WEBHOOK_URL` and paste the webhook URL.
3. **(Optional) Customize the workflow**
   - Edit `.github/workflows/slack.yml` to change the message format or notification conditions as needed.

### Notes

- Only the webhook method is used for notifications (no bot user required).
- If you need more advanced Slack features (threads, message updates, etc.), you can add a bot user and update the workflow accordingly.
