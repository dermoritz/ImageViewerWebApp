# Image Viewer

A minimalistic web-based image viewer with zoom and pan functionality.

## Features

- Full-screen image display
- Click to zoom to 100% at cursor position
- Pan while zoomed (drag to move)
- Auto-fit images to screen
- Random image loading from API

## Setup

1. **Download Panzoom Library**:
   - Go to [Panzoom Releases](https://github.com/timmywil/panzoom/releases)
   - Download the latest `panzoom.min.js`
   - Replace the placeholder file in `src/js/panzoom.min.js`

2. **Configure API URL**:
   - Default: `http://localhost:8080`
   - Change in `app.js` if needed:
     ```javascript
     window.imageViewer.setApiBaseUrl('http://your-api-url:port');
     ```

3. **Serve the files**:
   - For development: Use any local web server
   - For production: Deploy `src/` folder to Apache

## API Requirements

The application expects the following endpoint:
- `GET /api/images/random` - Returns a random image (binary)

## Controls

- **Click**: Zoom to 100% at cursor position
- **Release**: Reset zoom to fit screen
- **Space**: Load new random image
- **Escape**: Reset zoom if zoomed

## Files Structure

```
src/
├── index.html          # Main HTML file
├── css/
│   └── app.css         # Styles
└── js/
    ├── app.js          # Main application logic
    └── panzoom.min.js  # Panzoom library (download separately)
```

## Development

To test locally:
1. Start your Rust image service on port 8080
2. Serve the `src/` folder with any web server
3. Open `index.html` in browser

Example with Python:
```bash
cd src
python -m http.server 3000
```

Then open: http://localhost:3000
