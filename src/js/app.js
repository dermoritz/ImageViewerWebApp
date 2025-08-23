// Minimal Image Viewer
class ImageViewer {
    constructor() {
        this.config = {
            apiBaseUrl: window.location.origin,
            randomEndpoint: '/api/images/random'
        };
        
        this.imageContainer = document.getElementById('imageContainer');
        this.image = document.getElementById('image');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        
        this.panzoom = null;
        this.isZoomed = false;
        this.pointerPosition = { x: null, y: null };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadRandomImage();
    }
    
    setupEventListeners() {
        this.image.addEventListener('load', () => this.onImageLoad());
        this.image.addEventListener('error', () => this.onImageError());
        
        this.image.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: false });
        this.image.addEventListener('pointerup', (e) => this.onPointerUp(e), { passive: false });
        this.image.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
        
        this.image.addEventListener('dragstart', (e) => e.preventDefault());
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    }
    
    onImageLoad() {
        this.hideLoading();
        this.hideError();
        this.setupPanzoom();
    }
    
    setupPanzoom() {
        if (this.panzoom) this.panzoom.destroy();
        
        const zoomFactor = this.calculateZoomFactorToFit();
        const start = this.calculateXYstart(zoomFactor);
        
        this.panzoom = Panzoom(this.imageContainer, {
            startScale: zoomFactor,
            minScale: 0.01,
            startX: start.x,
            startY: start.y,
            animate: false,
            noBind: true
        });
    }
    
    calculateZoomFactorToFit() {
        const factor = 1;
        const imageWidth = this.image.naturalWidth;
        const imageHeight = this.image.naturalHeight;
        const containerWidth = this.imageContainer.clientWidth;
        const containerHeight = this.imageContainer.clientHeight;
        const widthFactor = containerWidth / imageWidth;
        const heightFactor = containerHeight / imageHeight;
        
        return Math.min(factor, widthFactor, heightFactor);
    }
    
    calculateXYstart(zoomFactor) {
        const result = { x: 0, y: 0 };
        result.x = -(this.image.naturalWidth - this.image.naturalWidth * zoomFactor) / 2;
        result.y = -(this.image.naturalHeight - this.image.naturalHeight * zoomFactor) / 2;
        return result;
    }
    
    onPointerDown(event) {
        this.isZoomed = true;
        this.pointerPosition = { x: event.x, y: event.y };
        this.imageContainer.style.cursor = 'none';
        this.zoomToPoint(event);
    }
    
    onPointerUp(event) {
        this.panzoom.reset({ animate: false });
        this.isZoomed = false;
        this.imageContainer.style.cursor = 'default';
    }
    
    onPointerMove(event) {
        this.pan(event);
    }
    
    zoomToPoint(event) {
        const point = { clientX: event.clientX, clientY: event.clientY };
        this.panzoom.zoomToPoint(1.0, point, { animate: false });
    }
    
    pan(event) {
        if (this.isZoomed) {
            const currentPan = this.panzoom.getPan();
            this.panzoom.pan(
                currentPan.x - (this.pointerPosition.x - event.x),
                currentPan.y - (this.pointerPosition.y - event.y),
                { force: true }
            );
        }
        this.pointerPosition.x = event.x;
        this.pointerPosition.y = event.y;
    }
    
    async loadRandomImage() {
        this.showLoading();
        this.hideError();
        
        try {
            const url = `${this.config.apiBaseUrl}${this.config.randomEndpoint}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            this.image.src = imageUrl;
            
        } catch (error) {
            this.onImageError(error.message);
        }
    }
    
    onImageError(message = 'Failed to load image') {
        this.hideLoading();
        this.showError(message);
    }
    
    onKeyDown(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            this.loadRandomImage();
        }
    }
    
    showLoading() {
        this.loading.style.display = 'block';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
    }
    
    showError(message) {
        this.error.textContent = message;
        this.error.style.display = 'block';
    }
    
    hideError() {
        this.error.style.display = 'none';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.imageViewer = new ImageViewer();
});
