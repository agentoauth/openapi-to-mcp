# GitHub Setup and Workflow

This guide covers setting up the project on GitHub, contributing workflow, and best practices.

## Initial GitHub Setup

### 1. Create a New Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right, select "New repository"
3. Fill in repository details:
   - **Name**: `openapi-to-mcp`
   - **Description**: "Generate Model Context Protocol (MCP) servers from OpenAPI specifications"
   - **Visibility**: Public (for open source)
   - **Initialize**: Don't initialize with README (we already have one)
4. Click "Create repository"

### 2. Push Your Code

```bash
# If you haven't initialized git yet
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: OpenAPI to MCP code generator"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/openapi-to-mcp.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Set Up Repository Settings

1. **Go to Settings** → **General**
   - Enable "Issues"
   - Enable "Discussions" (optional)
   - Enable "Projects" (optional)

2. **Go to Settings** → **Actions** → **General**
   - Enable "Allow all actions and reusable workflows"
   - Set "Workflow permissions" to "Read and write permissions"

3. **Go to Settings** → **Branches**
   - Add branch protection rule for `main`:
     - Require pull request reviews
     - Require status checks to pass
     - Require branches to be up to date

4. **Go to Settings** → **Secrets and variables** → **Actions**
   - Add any required secrets for CI/CD (if needed)

## Contributing Workflow

### For Contributors (Forking)

1. **Fork the Repository**
   - Click "Fork" button on GitHub
   - Choose your account/organization

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/openapi-to-mcp.git
   cd openapi-to-mcp
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/openapi-to-mcp.git
   ```

4. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make Changes and Commit**
   ```bash
   # Make your changes
   git add .
   git commit -m "feat: Add new feature"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select "compare across forks"
   - Choose your fork and branch
   - Fill out the PR description

### For Maintainers

1. **Review Pull Requests**
   - Check code quality
   - Run tests locally
   - Request changes if needed

2. **Merge Pull Requests**
   - Use "Squash and merge" or "Create a merge commit"
   - Delete the branch after merging

3. **Release Process**
   ```bash
   # Update version in package.json
   # Create a tag
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   
   # GitHub will create a release automatically
   # Or create one manually in Releases section
   ```

## GitHub Actions CI/CD

The project includes a CI workflow (`.github/workflows/ci.yml`) that runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### CI Checks

The workflow runs:
1. **Type Check**: Verifies TypeScript compiles without errors
2. **Lint**: Checks code style (when configured)
3. **Format Check**: Verifies code formatting (when configured)
4. **Build**: Compiles the project

### Viewing CI Results

- Go to the "Actions" tab on GitHub
- Click on a workflow run to see details
- Check individual job logs for errors

## Issue Management

### Creating Issues

1. **Bug Reports**
   - Use the "Bug report" template
   - Include steps to reproduce
   - Provide environment details

2. **Feature Requests**
   - Use the "Feature request" template
   - Describe the use case
   - Propose implementation approach

3. **Questions**
   - Use the "Question" label
   - Provide context
   - Link to relevant documentation

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `question`: Further information is requested
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed

## Pull Request Template

When opening a PR, include:

- **Description**: What changes were made and why
- **Type**: Bug fix, feature, documentation, etc.
- **Testing**: How the changes were tested
- **Checklist**: 
  - [ ] Code follows project style guidelines
  - [ ] Self-review completed
  - [ ] Comments added for complex code
  - [ ] Documentation updated
  - [ ] No new warnings generated
  - [ ] Tests pass locally

## Release Process

### Creating a Release

1. **Update Version**
   ```bash
   # Update version in package.json
   npm version patch  # or minor, major
   ```

2. **Create Release Notes**
   - Document new features
   - List bug fixes
   - Note breaking changes

3. **Create GitHub Release**
   - Go to "Releases" → "Draft a new release"
   - Choose tag (or create new)
   - Add release notes
   - Attach any assets
   - Publish release

### Semantic Versioning

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Best Practices

1. **Commit Messages**
   - Use clear, descriptive messages
   - Follow conventional commits format
   - Reference issues when applicable

2. **Branch Naming**
   - `feature/description`: New features
   - `fix/description`: Bug fixes
   - `docs/description`: Documentation changes
   - `refactor/description`: Code refactoring

3. **Pull Requests**
   - Keep PRs focused and small
   - Update documentation
   - Add tests when possible
   - Respond to feedback promptly

4. **Code Review**
   - Be constructive and respectful
   - Explain reasoning for suggestions
   - Approve when satisfied
   - Request changes when needed

## Troubleshooting

### CI Failing

- Check the Actions tab for error details
- Run checks locally: `npm run type-check`, `npm run build`
- Fix errors and push again

### Merge Conflicts

```bash
# Fetch latest from upstream
git fetch upstream

# Rebase your branch
git checkout feature/your-feature-name
git rebase upstream/main

# Resolve conflicts, then:
git add .
git rebase --continue

# Force push (safe for feature branches)
git push origin feature/your-feature-name --force-with-lease
```

### Updating Fork

```bash
# Fetch from upstream
git fetch upstream

# Merge into your main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```


