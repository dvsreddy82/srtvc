#!/bin/bash

# Script to create a private GitHub repository
# Usage: ./create-github-repo.sh YOUR_GITHUB_TOKEN

REPO_NAME="PET-MANAGEMENT"
GITHUB_TOKEN=$1

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GitHub token required"
    echo "Usage: ./create-github-repo.sh YOUR_GITHUB_TOKEN"
    echo ""
    echo "To create a token:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select 'repo' scope"
    echo "4. Copy the token and use it with this script"
    exit 1
fi

# Get GitHub username from API
USERNAME=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login":"[^"]*' | cut -d'"' -f4)

if [ -z "$USERNAME" ]; then
    echo "Error: Failed to authenticate with GitHub. Please check your token."
    exit 1
fi

echo "Creating private repository '$REPO_NAME' for user '$USERNAME'..."

# Create the repository
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":true,\"auto_init\":false}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo "✓ Repository created successfully!"
    echo ""
    
    # Extract SSH URL (preferred) or HTTPS URL
    SSH_URL=$(echo "$BODY" | grep -o '"ssh_url":"[^"]*' | cut -d'"' -f4)
    HTTPS_URL=$(echo "$BODY" | grep -o '"clone_url":"[^"]*' | cut -d'"' -f4)
    
    echo "Remote URL (SSH): $SSH_URL"
    echo "Remote URL (HTTPS): $HTTPS_URL"
    echo ""
    
    # Add remote and push
    if [ -d ".git" ]; then
        echo "Adding remote origin..."
        git remote add origin "$HTTPS_URL" 2>/dev/null || git remote set-url origin "$HTTPS_URL"
        echo "✓ Remote 'origin' configured"
        echo ""
        echo "Next steps:"
        echo "1. git add ."
        echo "2. git commit -m 'Initial commit'"
        echo "3. git branch -M main"
        echo "4. git push -u origin main"
    fi
else
    echo "Error: Failed to create repository"
    echo "HTTP Status: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

