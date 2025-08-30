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
        this.globalTouchStart = null;
    }

    setupEventListeners() {
        this.elements.image.addEventListener('load', () => this.onImageLoad());
        this.elements.image.addEventListener('error', () => this.imageLoader.onImageError());
        
        this.elements.image.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: false });
        this.elements.image.addEventListener('pointerup', (e) => this.onPointerUp(e), { passive: false });
        this.elements.image.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
        
        this.elements.image.addEventListener('dragstart', (e) => e.preventDefault());
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        // Global touch events for vertical swipes (separate from pointer events)
        document.body.addEventListener('touchstart', (e) => this.onGlobalTouchStart(e), { passive: false });
        document.body.addEventListener('touchend', (e) => this.onGlobalTouchEnd(e), { passive: false });
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
        
        this.lastTapTime = now;
    }

    onPointerUp(event) {
        this.zoomPan.resetZoom();
        this.elements.imageContainer.style.cursor = 'default';
        this.pointerPosition = { x: null, y: null };
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
        } else if (event.code === 'Escape') {
            event.preventDefault();
            this.stateManager.toggleImageVisibility();
        }
    }

    onGlobalTouchStart(event) {
        // Only track single finger touches to avoid conflicts with zoom gestures
        if (event.touches.length === 1) {
            this.globalTouchStart = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY,
                time: Date.now()
            };
        }
    }

    onGlobalTouchEnd(event) {
        if (!this.globalTouchStart || event.changedTouches.length !== 1) return;
        
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.globalTouchStart.x;
        const deltaY = touch.clientY - this.globalTouchStart.y;
        const deltaTime = Date.now() - this.globalTouchStart.time;
        
        this.globalTouchStart = null;
        
        // Only process quick swipes to avoid conflicts with zoom/pan
        if (deltaTime < 500 && (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50)) {
            // Vertical swipes take priority (hide/unhide)
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                const isSwipeDown = deltaY > 0;
                const shouldToggle = (isSwipeDown && !this.stateManager.isImageHidden) || 
                                   (!isSwipeDown && this.stateManager.isImageHidden);
                
                if (shouldToggle) {
                    this.stateManager.toggleImageVisibility();
                    event.preventDefault();
                }
            }
            // Horizontal swipes (navigation)
            else {
                if (deltaX > 0) this.stateManager.goBack(); // Swipe right → goBack
                else this.stateManager.next(); // Swipe left → next
                event.preventDefault();
            }
        }
    }
}
