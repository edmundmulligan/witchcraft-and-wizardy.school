# Witchcraft and Wizardry School

## Initial Setup

### Git Configuration

After cloning the repository, configure the automatic merge resolution for `package-lock.json`:

```bash
git config merge.npm-merge-driver.name "Automatically accept incoming package-lock.json"
git config merge.npm-merge-driver.driver "cp %B %A"
```

This ensures that when merging branches (e.g., staging → main), conflicts in `package-lock.json` are automatically resolved by accepting the incoming version from the source branch.

### Install Dependencies

```bash
npm install
```

## Development Workflow

### Branch Strategy

- **development** → **staging** → **main**

### Testing Strategy

#### Pull Request Tests

- **development → staging**: Abbreviated tests (validate-code, audit-colour-usage, check-file-comments, check-links, check-reading-age)
- **staging → main**: Full test suite (abbreviated + browser-tests, axe, pa11y, lighthouse, wave)

#### Nightly Tests

Full test suite runs automatically at 02:00 UTC on the staging branch if changes were detected in the last 24 hours.

### Running Tests Locally

```bash
# Run all tests for an application
npm run tests web
npm run tests api
npm run tests stats
npm run tests sound

# Run tests with exclusions
npm run tests web -- -x lessons
```

### Merging Staging to Main

When promoting code from staging to main, use the automated merge script to handle `package-lock.json` conflicts:

```bash
bash bin/merge-staging-to-main.sh
```

This script:
- Fetches latest changes from both branches
- Merges staging into main
- Automatically resolves `package-lock.json` conflicts by accepting the staging version
- Instructs you to push if successful

**Manual resolution** (if needed):

```bash
git checkout main
git pull origin main
git merge origin/staging

# If package-lock.json conflict occurs:
git checkout --theirs package-lock.json
git add package-lock.json
git commit --no-edit

# Push the merge
git push origin main
```

## Deployment

### Applications

- **web**: Main website → `/var/www/web.witchcraft-and-wizardry.school`
- **api**: API server → `/var/www/api.witchcraft-and-wizardry.school`
- **stats**: Statistics → `/var/www/stats.witchcraft-and-wizardry.school`
- **sound**: Sound files → `/var/www/sound.witchcraft-and-wizardry.school`

### GitHub Pages

GitHub Pages deploys automatically from the **staging** branch as a pre-production test environment.

### Production Deployment

Deployment to production servers happens automatically when code is pushed to the **main** branch.

## Repository Structure

- `web/` - Main website application
- `api/` - Express.js API server
- `stats/` - Statistics application
- `sound/` - Sound assets
- `bin/` - Build and test scripts
- `.github/workflows/` - CI/CD workflows
- `artwork/` - Source graphics and generated images
- `tests/` - Test configuration and fixtures

## Secrets Configuration

The following secrets must be configured in GitHub repository settings:

- `SERVER_SSH_KEY` - SSH private key for deployment server
- `SERVER_USERNAME` - SSH username for deployment
- `SERVER_FINGERPRINT` - (Optional) SSH host fingerprint for security
- `WAVE_API_KEY` - API key for WAVE accessibility tests
- `NGROK_AUTHTOKEN` - Ngrok auth token for accessibility tests
