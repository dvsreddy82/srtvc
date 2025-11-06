# Sri Raveendranath Thakur Veterinary Clinic Website

A modern, responsive static website for Sri Raveendranath Thakur Veterinary Clinic and Medical Shop located in Koralur, Bangalore.

## Features

- 🎨 Modern and responsive design
- 📱 Mobile-friendly interface
- 🗺️ Google Maps integration
- ⭐ Reviews section
- 🏥 Services showcase
- 📞 Contact information
- 🚀 Fast loading and optimized

## Project Structure

```
clinicwebsites/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── script.js           # JavaScript for interactivity
├── .nojekyll          # GitHub Pages configuration
├── deploy.sh          # Deployment script
└── README.md          # This file
```

## Local Development

To view the website locally:

1. Clone this repository
2. Open `index.html` in your web browser
3. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

## Deployment to GitHub Pages

### Automatic Deployment (Recommended)

1. Make sure you have a GitHub repository set up
2. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Manual Deployment

1. Push your code to the `main` branch of your GitHub repository
2. Go to your repository settings on GitHub
3. Navigate to "Pages" in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"
7. Your site will be available at `https://[username].github.io/[repository-name]`

## Customization

- Update clinic information in `index.html`
- Modify colors and styling in `styles.css`
- Add or remove services in the services section
- Update Google Maps embed URL with the correct embed link from Google Maps

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

© 2025 Sri Raveendranath Thakur Veterinary Clinic. All rights reserved.

