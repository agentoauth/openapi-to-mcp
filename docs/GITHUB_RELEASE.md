# GitHub Release Instructions

This guide walks you through creating a GitHub release for openapi-to-mcp.

## Prerequisites

- Git repository is set up and synced with GitHub
- You have push access to the repository
- All changes are committed and tested

## Release Process

### Step 1: Update Version and Changelog

1. **Update version in `package.json`**:
   ```bash
   # Already done - version bumped to 1.1.0
   ```

2. **Update CHANGELOG.md**:
   ```bash
   # Already done - changelog created with v1.1.0 entry
   # Update the date: replace "2025-01-XX" with actual date
   ```

3. **Commit version bump**:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to 1.1.0"
   ```

### Step 2: Create a Git Tag

Create an annotated tag for the release:

```bash
# Create annotated tag
git tag -a v1.1.0 -m "Release v1.1.0: Transform UI improvements and input handling fixes"

# Verify tag was created
git tag -l

# Push tag to GitHub
git push origin v1.1.0
```

### Step 3: Push Changes to GitHub

```bash
# Push commits to main/master branch
git push origin main
# or
git push origin master
```

### Step 4: Create GitHub Release

#### Option A: Using GitHub Web Interface (Recommended)

1. **Go to your repository on GitHub**
   - Navigate to: `https://github.com/yourusername/openapi-to-mcp`

2. **Click "Releases"**
   - Click on "Releases" in the right sidebar (or go to `/releases`)

3. **Click "Draft a new release"**
   - If this is your first release, click "Create a new release"

4. **Fill in release details**:
   - **Tag version**: Select `v1.1.0` (or type it if it doesn't exist yet)
   - **Release title**: `v1.1.0 - Transform UI Improvements`
   - **Description**: Copy from CHANGELOG.md or use the template below

5. **Release Description Template**:
   ```markdown
   ## 🎉 Release v1.1.0

   This release includes significant improvements to the Transform UI and fixes for tool parameter input handling.

   ### ✨ New Features

   - **Enhanced Transform UI**: Tag/path grouping, search, filters, and config import/export
   - **Capabilities-based Deployment**: Centralized configuration for Cloudflare deployment
   - **Improved Input Handling**: Fixed decimal and boolean input issues

   ### 🐛 Bug Fixes

   - Fixed decimal point input when typing coordinates (e.g., latitude/longitude)
   - Fixed boolean input handling
   - Removed unnecessary debug statements

   ### 📝 Full Changelog

   See [CHANGELOG.md](../CHANGELOG.md) for complete details.

   ### 📦 Installation

   ```bash
   npm install -g openapi-to-mcp
   ```

   Or use the CLI directly:
   ```bash
   npx openapi-to-mcp generate <openapi-spec>
   ```
   ```

6. **Attach Release Assets (Optional)**:
   - If you have built binaries or distributions, attach them here
   - For npm packages, users will install via npm, so binaries aren't necessary

7. **Publish Release**:
   - Click "Publish release" button
   - The release will be live immediately

#### Option B: Using GitHub CLI

If you have `gh` CLI installed:

```bash
# Create release from tag
gh release create v1.1.0 \
  --title "v1.1.0 - Transform UI Improvements" \
  --notes-file CHANGELOG.md \
  --target main
```

### Step 5: Verify Release

1. **Check GitHub Releases page**:
   - Visit: `https://github.com/yourusername/openapi-to-mcp/releases`
   - Verify the release appears correctly

2. **Test the release**:
   - Users can now reference this specific version
   - Update any documentation that references version numbers

## Post-Release Tasks

### Update Documentation (if needed)

- Update README.md if it references specific versions
- Update any installation instructions
- Update example commands if API changed

### Announce Release (Optional)

- Post on social media (Twitter, LinkedIn, etc.)
- Update project website/blog
- Notify contributors and users

## Version Bump Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

## Quick Reference Commands

```bash
# Full release workflow
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0: Transform UI improvements"
git push origin main
git push origin v1.1.0

# Then create release on GitHub web interface or use gh CLI
gh release create v1.1.0 --title "v1.1.0" --notes-file CHANGELOG.md
```

## Troubleshooting

### Tag already exists
```bash
# Delete local tag
git tag -d v1.1.0

# Delete remote tag (if pushed)
git push origin --delete v1.1.0

# Recreate tag
git tag -a v1.1.0 -m "Release v1.1.0"
```

### Need to update release notes
- Edit the release on GitHub (releases page → edit release)
- Or delete and recreate the release

### Need to update version after release
- Create a new patch version (e.g., 1.1.1)
- Follow the same process


