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
        this.metadataDisplay = new MetadataDisplay(this.elements);
        this.filterManager = new FilterManager(this.stateManager);
        this.eventHandler = new EventHandler(this);
        
        // Connect dependencies
        this.imageLoader.setStateManager(this.stateManager);
        this.imageLoader.setMetadataDisplay(this.metadataDisplay);
        this.stateManager.setFilterManager(this.filterManager);
        
        this.eventHandler.setupEventListeners();
        
        // Try to load from URL first, otherwise load random image
        const loadedFromUrl = await this.stateManager.loadFromUrl();
        if (!loadedFromUrl) {
            await this.imageLoader.loadRandom();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const imageViewer = new ImageViewer();
    await imageViewer.init();
    window.imageViewer = imageViewer;
});
