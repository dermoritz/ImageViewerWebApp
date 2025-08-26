class EventHandler {
    constructor(app) {
        this.elements = app.elements;
        this.zoomPan = app.zoomPan;
        this.imageLoader = app.imageLoader;
        this.stateManager = app.stateManager;
        this.metadataDisplay = app.metadataDisplay;
        this.filterManager = app.filterManager;
        this.pointerPosition = { x: null, y: null };
        this.lastTapTime = 0;
        this.touchStart = null;
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
        const now = Date.now();
        const isTouch = event.pointerType === 'touch';
        const shouldZoom = !isTouch || (now - this.lastTapTime < 300);
        
        if (shouldZoom) {
            this.pointerPosition = { x: event.x, y: event.y };
            this.elements.imageContainer.style.cursor = 'none';
            this.zoomPan.zoomToPoint(event);
        }
        
        if (isTouch) {
            this.touchStart = { x: event.x, y: event.y };
        }
        this.lastTapTime = now;
    }

    onPointerUp(event) {
        const wasZooming = this.pointerPosition.x !== null;
        this.zoomPan.resetZoom();
        this.elements.imageContainer.style.cursor = 'default';
        this.pointerPosition = { x: null, y: null }; // Reset position
        
        // Check for swipe only if we weren't zooming/panning
        if (this.touchStart && event.pointerType === 'touch' && !wasZooming) {
            const deltaX = event.x - this.touchStart.x;
            if (Math.abs(deltaX) > 50) { // Swipe threshold
                if (deltaX > 0) this.stateManager.goBack(); // Swipe right → goBack (W key)
                else this.stateManager.next(); // Swipe left → next (S key)
            }
        }
        this.touchStart = null;
    }

    onPointerMove(event) {
        if (this.pointerPosition.x !== null) {
            this.zoomPan.pan(event, this.pointerPosition);
            this.pointerPosition.x = event.x;
            this.pointerPosition.y = event.y;
        }
    }

    onKeyDown(event) {
        if (event.target.tagName === 'INPUT') return; // Skip if typing in filter
        
        if (event.code === 'Space' || event.code === 'KeyS' || 
            event.code === 'ArrowRight' || event.code === 'ArrowDown') {
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
