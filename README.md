# Khaddorosik Git Workflow & Repository Management Guide

## Repository Structure

```text
main
development
testing

feature/*
hotfix/*
```

### Branch Purpose

| Branch      | Purpose                 |
| ----------- | ----------------------- |
| main        | Production-ready code   |
| testing     | QA/UAT testing          |
| development | Integration branch      |
| feature/*   | New feature development |
| hotfix/*    | Production bug fixes    |

---

# Rules

## DO NOT

* Push directly to main
* Push directly to testing
* Force push to shared branches
* Commit secrets, passwords, API keys

## ALWAYS

* Pull latest development branch before starting work
* Create a feature branch
* Create Pull Request
* Wait for review before merge

---

# Initial Setup

Clone repository:

```bash
git clone https://github.com/Adarsha24/Khaddorosik.git
cd Khaddorosik
```

Check branches:

```bash
git branch -a
```

---

# Daily Workflow

Update local development branch:

```bash
git checkout development
git pull origin development
```

Create new feature branch:

```bash
git checkout -b feature/feature-name
```

Examples:

```bash
git checkout -b feature/frontend-login
git checkout -b feature/payment-module
git checkout -b feature/inventory-screen
```

Push feature branch:

```bash
git push -u origin feature/feature-name
```

---

# Commit Workflow

Check status:

```bash
git status
```

Add files:

```bash
git add .
```

Commit:

```bash
git commit -m "Implemented inventory API integration"
```

Push:

```bash
git push
```

---

# Pull Latest Changes

Before starting work:

```bash
git checkout development
git pull origin development
```

Update your feature branch:

```bash
git checkout feature/feature-name
git merge development
```

---

# Create Pull Request

Target:

```text
feature/* -> development
```

Never create PR directly to main.

---

# Release Workflow

Developer Branch
↓

```text
feature/*
```

↓

```text
development
```

↓

```text
testing
```

↓

```text
main
```

---

# Maintainer Workflow

Review Pull Request.

Verify:

* Code quality
* Build success
* No sensitive data
* Feature works correctly

Merge into development.

---

# Testing Release

Merge:

```text
development -> testing
```

Deploy to QA server.

QA validates functionality.

---

# Production Release

Merge:

```text
testing -> main
```

Deploy production.

---

# Hotfix Workflow

Create:

```bash
git checkout main
git checkout -b hotfix/issue-name
```

Example:

```bash
git checkout -b hotfix/payment-crash
```

Fix issue.

Push:

```bash
git push -u origin hotfix/payment-crash
```

Create PR:

```text
hotfix/payment-crash -> main
```

---

# Useful Commands

Current branch:

```bash
git branch
```

View remotes:

```bash
git remote -v
```

Fetch updates:

```bash
git fetch
```

Pull updates:

```bash
git pull
```

Push updates:

```bash
git push
```

View commit history:

```bash
git log --oneline
```

View changed files:

```bash
git status
```

---

# Branch Naming Convention

Frontend:

```text
feature/frontend-login
feature/frontend-dashboard
feature/frontend-billing
```

Backend:

```text
feature/backend-auth
feature/backend-orders
feature/backend-payment
```

Bug Fixes:

```text
bugfix/login-issue
bugfix/payment-error
```

Hotfixes:

```text
hotfix/production-crash
```

---

# CI/CD Policy

Every Pull Request must pass:

* Build
* Lint
* Unit Tests
* Security Scan

No failed pipeline may be merged.

---

# Repository Ownership

Repository Maintainer:

* Reviews PRs
* Approves merges
* Manages releases
* Manages branch protection rules

Developers:

* Work only on feature branches
* Submit Pull Requests
* Resolve review comments
* Keep branches updated
