# 3D Model Room Importer Extension

A simple Chrome extension built with Manifest V3 and React that allows you to create and import 3D models to your room.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Development

To work on the extension with hot reload:
```bash
npm run dev
```

Then rebuild and reload the extension in Chrome when you make changes.

## Structure

- `manifest.json` - Extension manifest file (Manifest V3)
- `src/App.jsx` - Main React component with the button
- `src/App.css` - Styling for the popup
- `vite.config.js` - Vite build configuration
