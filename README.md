# Blueprint, built at UofTHacks13
# 3D Model Room Importer Extension


## Setup

1. Install dependencies:
```bash
npm install
```

```bash
npm run build
```

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Development

```bash
npm run dev
```


## Structure

- `manifest.json` - Extension manifest file (Manifest V3)
- `src/App.jsx` - Main React component with the button
- `src/App.css` - Styling for the popup
- `vite.config.js` - Vite build configuration
