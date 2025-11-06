# Deployment Guide

This guide will help you deploy the Sri Raveendranath Thakur Veterinary Clinic website to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your local machine
- This repository cloned or initialized

## Method 1: Using the Deployment Script (Recommended)

1. **Make sure the script is executable:**
   ```bash
   chmod +x deploy.sh
   ```

2. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

3. **Follow the prompts:**
   - If you haven't set up a remote repository, the script will guide you
   - Enter a commit message when prompted (or press Enter for default)

4. **Configure GitHub Pages:**
   - Go to your GitHub repository
   - Click on "Settings"
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose "main" (or "master") branch
   - Select "/ (root)" folder
   - Click "Save"

5. **Wait for deployment:**
   - GitHub Pages will build and deploy your site
   - This usually takes 1-2 minutes
   - Your site will be available at: `https://[username].github.io/[repository-name]`

## Method 2: Using GitHub Actions (Automatic)

If you've pushed the code to GitHub, the GitHub Actions workflow will automatically deploy your site when you push to the main branch.

1. **Enable GitHub Pages in repository settings:**
   - Go to Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Push your code:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **The workflow will automatically:**
   - Build and deploy your site
   - Make it available at your GitHub Pages URL

## Method 3: Manual Deployment

1. **Initialize Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Add your GitHub repository as remote:**
   ```bash
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   ```

3. **Push to GitHub:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

## Updating Google Maps Embed

To get the correct Google Maps embed URL:

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for "Sri Raveendranath Thakur veterinary Clinic and Medical shop"
3. Click on "Share" button
4. Select "Embed a map"
5. Copy the iframe code
6. Replace the iframe src in `index.html` (around line 187)

## Troubleshooting

### Site not loading
- Wait a few minutes after enabling GitHub Pages
- Check the repository Settings → Pages for any error messages
- Verify that `index.html` is in the root directory

### Changes not appearing
- Clear your browser cache
- Check if the changes were pushed to GitHub
- Verify the GitHub Actions workflow completed successfully

### Map not displaying
- Ensure the Google Maps embed URL is correct
- Check browser console for any iframe errors
- Verify the coordinates are correct (12.988058, 77.788123)

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file in the root directory with your domain name
2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings to use your custom domain

## Support

For issues or questions, please check:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

