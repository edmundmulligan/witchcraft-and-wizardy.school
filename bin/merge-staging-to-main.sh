#!/bin/bash
#
# merge-staging-to-main.sh
# Merges staging branch into main, automatically resolving package-lock.json conflicts
# by accepting the staging version.
#
# Usage: bash bin/merge-staging-to-main.sh

set -e

echo "🔄 Merging staging to main..."

# Clean up any untracked files in node_modules to avoid merge conflicts
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning untracked files in node_modules..."
    git clean -fd node_modules/ || true
fi

# Fetch latest changes
git fetch origin

# Checkout main and ensure it's up to date
git checkout main

# Clean again after checkout in case main has different untracked files
if [ -d "node_modules" ]; then
    git clean -fd node_modules/ || true
fi

git pull origin main

# Attempt merge
if git merge origin/staging --no-edit; then
    echo "✅ Merge completed successfully with no conflicts"
else
    echo "⚠️  Merge conflicts detected, resolving package-lock.json..."
    
    # Check if package-lock.json has conflict
    if git diff --name-only --diff-filter=U | grep -q "package-lock.json"; then
        echo "📦 Accepting staging version of package-lock.json..."
        git checkout --theirs package-lock.json
        git add package-lock.json
        
        # Check if there are other conflicts
        if git diff --name-only --diff-filter=U | grep -v "package-lock.json" > /dev/null; then
            echo "❌ Other conflicts exist besides package-lock.json"
            echo "Please resolve them manually:"
            git diff --name-only --diff-filter=U | grep -v "package-lock.json"
            exit 1
        fi
        
        # Complete the merge
        git commit --no-edit
        echo "✅ Merge completed with automatic package-lock.json resolution"
    else
        echo "❌ Conflicts exist but not in package-lock.json"
        echo "Please resolve them manually:"
        git diff --name-only --diff-filter=U
        exit 1
    fi
fi

echo ""
echo "✅ Staging has been merged into main"
echo ""
echo "🔧 Reinstalling dependencies to ensure consistency..."
npm install
echo ""
echo "✅ Dependencies updated successfully"
echo ""
echo "Next steps:"
echo "  1. Review the merge: git log --oneline -5"
echo "  2. Test locally if needed"
echo "  3. Push to GitHub: git push origin main"
