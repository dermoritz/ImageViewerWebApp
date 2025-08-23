class EventHandler {
    constructor(elements, zoomPan, imageLoader, stateManager, metadataDisplay) {
        this.elements = elements;
        this.zoomPan = zoomPan;
        this.imageLoader = imageLoader;
        this.stateManager = stateManager;
        this.metadataDisplay = metadataDisplay;
        this.pointerPosition = { x: null, y: null };
    }

    setupEventListeners() {
        this.elements.image.addEventListener('load', () => this.onImageLoad());
        this.elements.image.addEventListener('error', () => this.imageLoader.onImageError());
        
        this.elements.image.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: false });
        this.elements.image.addEventListener('pointerup', (e) => this.onPointerUp(e), { passive: false });
        this.elements.image.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
        
        this.elements.image.addEventListener('dragstart', (e) => e.preventDefault());
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    onImageLoad() {
        this.imageLoader.hideLoading();
        this.imageLoader.hideError();
        this.zoomPan.setupPanzoom();
    }

    onPointerDown(event) {
        this.pointerPosition = { x: event.x, y: event.y };
        this.elements.imageContainer.style.cursor = 'none';
        this.zoomPan.zoomToPoint(event);
    }

    onPointerUp(event) {
        this.zoomPan.resetZoom();
        this.elements.imageContainer.style.cursor = 'default';
    }

    onPointerMove(event) {
        this.zoomPan.pan(event, this.pointerPosition);
        this.pointerPosition.x = event.x;
        this.pointerPosition.y = event.y;
    }

    onKeyDown(event) {
        if (event.code === 'Space' || event.code === 'KeyS') {
            event.preventDefault();
            this.imageLoader.loadRandomImage();
        } else if (event.code === 'KeyW') {
            event.preventDefault();
            this.stateManager.goBack();
        } else if (event.code === 'KeyQ') {
            event.preventDefault();
            this.metadataDisplay.toggle();
        }
    }
}
