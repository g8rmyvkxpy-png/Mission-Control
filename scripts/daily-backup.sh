#!/bin/bash

# Daily Backup Script for Mission Control
# Backs up SQLite database and commits to GitHub

echo "=== Mission Control Daily Backup ==="
echo "Date: $(date)"

# Config
MC_DIR="/home/deva/Mission-Control"
GITHUB_REPO="g8rmyvkxpy-png/Mission-Control"
GIT_MSG="Daily backup $(date '+%Y-%m-%d %H:%M')"

# Check if there are changes to commit
cd "$MC_DIR"

# Check git status
if [[ -d ".git" ]]; then
    echo "Checking for changes..."
    
    # Add all changes
    git add -A
    
    # Check if there are changes
    if git diff --cached --quiet; then
        echo "No changes to commit"
    else
        echo "Pulling latest changes..."
        git pull origin master --allow-unrelated-histories || true
        
        echo "Committing changes..."
        git commit -m "$GIT_MSG"
        
        # Push to GitHub
        echo "Pushing to GitHub..."
        git push origin master
        
        if [ $? -eq 0 ]; then
            echo "✅ Backup completed successfully!"
        else
            echo "❌ Push failed"
            exit 1
        fi
    fi
else
    echo "❌ Not a git repository"
    exit 1
fi

echo "=== Backup Complete ==="
