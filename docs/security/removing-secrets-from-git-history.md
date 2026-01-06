# Removing Secrets from Git History

When sensitive information (API keys, passwords, tokens) is accidentally committed to Git, it remains in the repository history even after deletion. This guide explains how to completely remove secrets using BFG Repo-Cleaner.

## Prerequisites

### Install BFG Repo-Cleaner

```bash
# macOS (using Homebrew)
brew install bfg

# Or download JAR file directly
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
alias bfg='java -jar bfg-1.14.0.jar'
```

## Step-by-Step Process

### 1. Identify the Secret in History

First, verify where the secret appears:

```bash
# Search for the secret in commit history
git log -S "your-secret-value" --oneline

# View detailed changes containing the secret
git log -p -S "your-secret-value"
```

### 2. Create a Backup

Always backup your repository before rewriting history:

```bash
# Clone a fresh mirror copy
git clone --mirror https://github.com/madrus/tournado.git tournado-backup.git
```

### 3. Prepare Replacement File

Create a file listing all secrets to remove:

```bash
# Create replacements.txt
echo "your-secret-value==>REMOVED" > replacements.txt

# For multiple secrets
cat > replacements.txt << EOF
secret-api-key-1==>REMOVED
password123==>REMOVED
sk-proj-abc123==>REMOVED
EOF
```

### 4. Run BFG to Clean History

```bash
# Clone a fresh mirror for cleaning
git clone --mirror https://github.com/madrus/tournado.git tournado-clean.git
cd tournado-clean.git

# Remove secrets from all commits
bfg --replace-text ../replacements.txt .

# Alternative: Remove entire files
# bfg --delete-files .env .
# bfg --delete-files "*.key" .
```

### 5. Clean Repository

```bash
# Remove old references and optimize
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 6. Verify Removal

```bash
# This should return nothing
git log -S "your-secret-value"

# Double-check file contents in history
git log -p | grep "your-secret-value"
```

### 7. Force Push Changes

⚠️ **Warning**: This rewrites repository history!

```bash
# Push rewritten history
git push --force-with-lease --all
git push --force-with-lease --tags
```

### 8. Clean Local Repositories

All team members must delete and re-clone:

```bash
# Remove old repository
rm -rf tournado

# Clone fresh copy
git clone https://github.com/madrus/tournado.git
```

## Important Actions After Cleanup

1. **Rotate the compromised secrets immediately**
   - Generate new API keys
   - Change passwords
   - Update tokens in production

2. **Update secrets in CI/CD**
   - GitHub Actions secrets
   - Fly.io secrets
   - Any other deployment environments

3. **Notify team members**
   - Inform about history rewrite
   - Share instructions for re-cloning

4. **Add to .gitignore**

   ```bash
   echo ".env*" >> .gitignore
   echo "*.key" >> .gitignore
   echo "*.pem" >> .gitignore
   ```

## Prevention Tips

- Use `.gitignore` for sensitive files
- Store secrets in environment variables
- Use secret scanning tools in CI
- Enable GitHub secret scanning alerts
- Review commits before pushing

## Quick Reference

```bash
# Complete workflow for removing a leaked Firebase key
echo "sk-proj-abc123==>REMOVED" > replacements.txt
git clone --mirror https://github.com/madrus/tournado.git clean.git
cd clean.git
bfg --replace-text ../replacements.txt .
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force-with-lease --all
```

## Resources

- [BFG Repo-Cleaner Documentation](https://rtyley.github.io/bfg-repo-cleaner/)
- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Git Filter-Repo (alternative)](https://github.com/newren/git-filter-repo)

#security #git #secrets #bfg #documentation
