# Quick Git Commit Instructions

## Fix Git Ownership Issue (if needed)

If you see "dubious ownership" error, run:

```bash
git config --global --add safe.directory /Users/prithvi/projects/openapi-to-mcp
```

## Commit Current Changes

### Step 1: Check what changed

```bash
git status
```

### Step 2: Review the changes (optional)

```bash
# See all changes
git diff

# See changes for specific files
git diff benchmarks/benchmarks.json
git diff README.md
```

### Step 3: Stage the changes

```bash
# Stage all changes
git add .

# Or stage specific files
git add benchmarks/benchmarks.json
git add README.md
git add package.json
git add scripts/run-benchmarks.ts
git add .github/workflows/bench.yml
git add docs/GITHUB_RELEASE.md
git add CHANGELOG.md
```

### Step 4: Commit with a descriptive message

```bash
git commit -m "feat: Add benchmarking system and update version to 1.1.0

- Add benchmark runner script with 9 curated OpenAPI specs
- Add GitHub Actions workflow for automated benchmarking
- Add Curated Benchmarks section to README
- Fix tool parameter input handling (decimal numbers, booleans)
- Add transform UI improvements (grouping, search, filters)
- Add capabilities-based deployment configuration
- Update version to 1.1.0
- Add CHANGELOG.md and release documentation"
```

### Step 5: Push to GitHub

```bash
# Push to main/master branch
git push origin main
# or
git push origin master

# If pushing a new branch
git push -u origin your-branch-name
```

## Create Release Tag (for v1.1.0)

After pushing commits:

```bash
# Create annotated tag
git tag -a v1.1.0 -m "Release v1.1.0: Transform UI improvements and benchmarking system"

# Push tag to GitHub
git push origin v1.1.0
```

Then create the release on GitHub (see `docs/GITHUB_RELEASE.md` for details).

## Quick Reference

```bash
# Full workflow
git add .
git commit -m "Your commit message"
git push origin main
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

## Common Commands

```bash
# See what files changed
git status

# See detailed changes
git diff

# Undo changes to a file (before staging)
git checkout -- filename

# Unstage a file (after git add)
git reset HEAD filename

# Amend last commit message
git commit --amend -m "New message"

# See commit history
git log --oneline -10
```

For more detailed Git workflows, see [`docs/GIT_GUIDE.md`](./GIT_GUIDE.md).

