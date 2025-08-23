// Main Image Viewer Application
class ImageViewer {
    constructor() {
        this.config = {
            apiBaseUrl: window.location.origin
        };
        
        this.elements = {
            imageContainer: document.getElementById('imageContainer'),
            image: document.getElementById('image'),
            loading: document.getElementById('loading'),
            error: document.getElementById('error')
        };
    }
    
    async init() {
        this.imageLoader = new ImageLoader(this.config, this.elements);
        this.zoomPan = new ZoomPan(this.elements);
        this.stateManager = new StateManager(this.imageLoader);
        this.eventHandler = new EventHandler(this.elements, this.zoomPan, this.imageLoader, this.stateManager);
        
        // Connect state manager to image loader
        this.imageLoader.setStateManager(this.stateManager);
        
        this.eventHandler.setupEventListeners();
        
        // Try to load from URL first, otherwise load random image
        const loadedFromUrl = await this.stateManager.loadFromUrl();
        if (!loadedFromUrl) {
            await this.imageLoader.loadRandomImage();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const imageViewer = new ImageViewer();
    await imageViewer.init();
    window.imageViewer = imageViewer;
});
