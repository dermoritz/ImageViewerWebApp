class EventHandler {
    constructor(app) {
        this.elements = app.elements;
        this.zoomPan = app.zoomPan;
        this.imageLoader = app.imageLoader;
        this.stateManager = app.stateManager;
        this.metadataDisplay = app.metadataDisplay;
        this.filterManager = app.filterManager;
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
        if (event.target.tagName === 'INPUT') return; // Skip if typing in filter
        
        if (event.code === 'Space' || event.code === 'KeyS') {
            event.preventDefault();
            this.stateManager.next();
        } else if (event.code === 'ArrowRight' || event.code === 'ArrowDown') {
            event.preventDefault();
            this.stateManager.next();
        } else if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') {
            event.preventDefault();
            this.stateManager.prev();
        } else if (event.code === 'KeyW') {
            event.preventDefault();
            this.stateManager.goBack();
        } else if (event.code === 'KeyQ') {
            event.preventDefault();
            this.metadataDisplay.toggle();
        }
    }
}
