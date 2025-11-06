#!/bin/bash

# Deployment script for GitHub Pages
# This script helps deploy the static website to GitHub Pages

set -e  # Exit on error

echo "🚀 Starting deployment to GitHub Pages..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository not initialized. Initializing...${NC}"
    git init
fi

# Check if remote origin exists
if ! git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}⚠️  No remote origin found.${NC}"
    echo -e "${BLUE}Please add your GitHub repository as remote origin:${NC}"
    echo -e "${BLUE}git remote add origin https://github.com/USERNAME/REPOSITORY.git${NC}"
    echo ""
    read -p "Do you want to add the remote now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your GitHub repository URL: " repo_url
        git remote add origin "$repo_url"
    else
        echo -e "${YELLOW}Exiting. Please add remote and run again.${NC}"
        exit 1
    fi
fi

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# Check if we're on main/master branch
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo -e "${YELLOW}⚠️  You're not on main/master branch. Current branch: $CURRENT_BRANCH${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Add all files
echo -e "${BLUE}📦 Staging files...${NC}"
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit.${NC}"
else
    # Commit changes
    echo -e "${BLUE}💾 Committing changes...${NC}"
    read -p "Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Deploy website to GitHub Pages - $(date +'%Y-%m-%d %H:%M:%S')"
    fi
    git commit -m "$commit_msg"
fi

# Push to GitHub
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin "$CURRENT_BRANCH"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "${BLUE}1. Go to your GitHub repository settings${NC}"
echo -e "${BLUE}2. Navigate to 'Pages' in the left sidebar${NC}"
echo -e "${BLUE}3. Under 'Source', select 'Deploy from a branch'${NC}"
echo -e "${BLUE}4. Choose '$CURRENT_BRANCH' branch and '/ (root)' folder${NC}"
echo -e "${BLUE}5. Click 'Save'${NC}"
echo ""
echo -e "${GREEN}Your site will be available at:${NC}"
echo -e "${GREEN}https://[username].github.io/[repository-name]${NC}"
echo ""
echo -e "${YELLOW}Note: It may take a few minutes for the site to be live.${NC}"

