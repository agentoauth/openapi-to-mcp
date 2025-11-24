# Git Guide

This guide covers Git commands and workflows for working with the `openapi-to-mcp` project.

## Table of Contents

- [Initial Setup](#initial-setup)
- [Basic Git Commands](#basic-git-commands)
- [Branching Workflow](#branching-workflow)
- [Making Changes](#making-changes)
- [Syncing with Remote](#syncing-with-remote)
- [Resolving Conflicts](#resolving-conflicts)
- [Undoing Changes](#undoing-changes)
- [Useful Git Aliases](#useful-git-aliases)

## Initial Setup

### First Time Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/openapi-to-mcp.git
cd openapi-to-mcp

# Configure your identity (if not already set globally)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Set up upstream remote (if contributing to someone else's repo)
git remote add upstream https://github.com/originalowner/openapi-to-mcp.git

# Verify remotes
git remote -v
```

### Check Current Status

```bash
# See current branch and status
git status

# See commit history
git log --oneline

# See all branches
git branch -a
```

## Basic Git Commands

### Checking Status

```bash
# See what files have changed
git status

# See detailed changes
git diff

# See staged changes
git diff --staged

# See changes for a specific file
git diff path/to/file.ts
```

### Staging Changes

```bash
# Stage all changes
git add .

# Stage specific file
git add path/to/file.ts

# Stage multiple files
git add file1.ts file2.ts

# Stage all files in a directory
git add packages/generator/src/

# Interactive staging (choose what to stage)
git add -p
```

### Committing Changes

```bash
# Commit with message
git commit -m "feat: Add support for PUT operations"

# Commit with detailed message
git commit -m "feat: Add support for PUT operations

- Added PUT method to operation extractor
- Updated templates to handle PUT requests
- Added tests for PUT operations"

# Amend last commit (change message or add files)
git commit --amend -m "New commit message"

# Amend and add more files to last commit
git add forgotten-file.ts
git commit --amend --no-edit
```

### Viewing History

```bash
# View commit history
git log

# One-line format
git log --oneline

# With file changes
git log --stat

# Graph view
git log --oneline --graph --all

# Search commit messages
git log --grep="feat"

# See changes in a commit
git show <commit-hash>
```

## Branching Workflow

### Creating and Switching Branches

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Or using newer syntax
git switch -c feature/new-feature

# Switch to existing branch
git checkout main
# or
git switch main

# List all branches
git branch

# List remote branches
git branch -r

# Delete local branch
git branch -d feature/old-feature

# Force delete (if not merged)
git branch -D feature/old-feature
```

### Branch Naming Conventions

- `feature/description`: New features
- `fix/description`: Bug fixes
- `docs/description`: Documentation changes
- `refactor/description`: Code refactoring
- `test/description`: Test additions
- `chore/description`: Maintenance tasks

Examples:
```bash
git checkout -b feature/put-method-support
git checkout -b fix/schema-resolution-bug
git checkout -b docs/update-quickstart
```

## Making Changes

### Typical Workflow

```bash
# 1. Make sure you're on main and up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make your changes
# ... edit files ...

# 4. Stage changes
git add .

# 5. Commit
git commit -m "feat: Add new feature"

# 6. Push to your fork
git push origin feature/my-feature

# 7. Open Pull Request on GitHub
```

### Committing Best Practices

1. **Make small, focused commits**
   ```bash
   # Good: Separate commits for different changes
   git add file1.ts
   git commit -m "feat: Add operation extractor"
   
   git add file2.ts
   git commit -m "test: Add tests for extractor"
   ```

2. **Write clear commit messages**
   - Use conventional commits format
   - Start with type: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
   - Keep first line under 50 characters
   - Add details in body if needed

3. **Don't commit generated files**
   - Check `.gitignore` is working
   - Don't commit `node_modules/`, `dist/`, `scratch/`

## Syncing with Remote

### Fetching and Pulling

```bash
# Fetch latest changes (doesn't merge)
git fetch origin

# Fetch from upstream
git fetch upstream

# Pull latest changes and merge
git pull origin main

# Pull with rebase (cleaner history)
git pull --rebase origin main
```

### Pushing Changes

```bash
# Push current branch
git push origin feature/my-feature

# Push and set upstream (first time)
git push -u origin feature/my-feature

# Force push (use with caution!)
git push --force-with-lease origin feature/my-feature
```

### Updating Your Fork

```bash
# Method 1: Merge
git checkout main
git fetch upstream
git merge upstream/main
git push origin main

# Method 2: Rebase (cleaner history)
git checkout main
git fetch upstream
git rebase upstream/main
git push origin main
```

## Resolving Conflicts

### When Conflicts Occur

```bash
# Try to pull/merge
git pull origin main

# If conflicts occur, Git will mark them
# Edit files to resolve conflicts
# Look for conflict markers:
# <<<<<<< HEAD
# your changes
# =======
# their changes
# >>>>>>> branch-name

# After resolving, stage the files
git add conflicted-file.ts

# Complete the merge
git commit
```

### Using Merge Tool

```bash
# Open merge tool
git mergetool

# Configure merge tool (VS Code example)
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'
```

### Aborting a Merge

```bash
# If you want to cancel the merge
git merge --abort
```

## Undoing Changes

### Unstaged Changes

```bash
# Discard changes to a file
git checkout -- file.ts

# Discard all unstaged changes
git checkout -- .

# Or using newer syntax
git restore file.ts
git restore .
```

### Staged Changes

```bash
# Unstage a file (keep changes)
git reset HEAD file.ts

# Or using newer syntax
git restore --staged file.ts

# Unstage all files
git reset HEAD
```

### Commits

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert a commit (creates new commit)
git revert <commit-hash>
```

### Pushed Commits

```bash
# If you haven't pushed yet, you can reset
git reset --soft HEAD~1

# If already pushed, use revert (safer)
git revert <commit-hash>
git push origin main
```

## Useful Git Aliases

Add these to your `~/.gitconfig`:

```bash
# Short status
git config --global alias.st status

# One-line log
git config --global alias.lg "log --oneline --graph --all"

# Last commit
git config --global alias.last "log -1 HEAD"

# Unstage
git config --global alias.unstage "reset HEAD --"

# See what changed
git config --global alias.changes "diff --name-status"

# Quick commit
git config --global alias.ci commit

# Quick checkout
git config --global alias.co checkout

# Quick branch
git config --global alias.br branch
```

After adding aliases, you can use:
```bash
git st          # instead of git status
git lg          # instead of git log --oneline --graph --all
git co main     # instead of git checkout main
```

## Common Workflows

### Starting a New Feature

```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Make changes and commit
git add .
git commit -m "feat: Add new feature"

# 4. Push to remote
git push -u origin feature/new-feature
```

### Updating Feature Branch

```bash
# If main has new commits, update your branch
git checkout feature/my-feature
git fetch upstream
git rebase upstream/main

# Or merge instead of rebase
git merge upstream/main
```

### Squashing Commits

```bash
# Interactive rebase (last 3 commits)
git rebase -i HEAD~3

# In the editor, change 'pick' to 'squash' for commits to combine
# Save and close, then edit the commit message
```

### Stashing Changes

```bash
# Save current changes temporarily
git stash

# List stashes
git stash list

# Apply last stash
git stash apply

# Apply and remove from stash
git stash pop

# Drop a stash
git stash drop
```

## Troubleshooting

### "Your branch is ahead of origin"

```bash
# Push your commits
git push origin branch-name
```

### "Your branch is behind origin"

```bash
# Pull latest changes
git pull origin branch-name
```

### "Divergent branches"

```bash
# Pull with rebase
git pull --rebase origin branch-name

# Or merge
git pull origin branch-name
```

### Accidentally committed to main

```bash
# Create a branch from current state
git branch feature/my-changes

# Reset main to remote
git checkout main
git reset --hard origin/main

# Switch back to your branch
git checkout feature/my-changes
```

### Remove file from Git but keep locally

```bash
# Remove from Git tracking
git rm --cached file.ts

# Commit the removal
git commit -m "chore: Remove file from tracking"
```

## Best Practices

1. **Always pull before starting work**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create branches for features**
   - Don't work directly on `main`
   - Use descriptive branch names

3. **Commit often**
   - Small, focused commits
   - Clear commit messages

4. **Test before committing**
   ```bash
   npm run build
   npm run type-check
   ```

5. **Don't force push to shared branches**
   - Use `--force-with-lease` if you must
   - Never force push to `main`

6. **Keep commits clean**
   - Don't commit debug code
   - Don't commit commented-out code
   - Don't commit `console.log` statements

7. **Review before pushing**
   ```bash
   git log origin/main..HEAD  # See your commits
   git diff origin/main       # See your changes
   ```

## Getting Help

```bash
# Get help for any Git command
git help <command>

# Examples
git help commit
git help rebase
git help merge
```

## Additional Resources

- [Official Git Documentation](https://git-scm.com/doc)
- [GitHub Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)


