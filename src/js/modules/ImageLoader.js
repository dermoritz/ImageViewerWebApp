class ImageLoader {
    constructor(config, elements) {
        this.config = config;
        this.elements = elements;
        this.maxIndex = null;
        this.currentIndex = null;
        this.stateManager = null; // Will be set by main app
        this.metadataDisplay = null; // Will be set by main app
        this.currentMetadata = null;
    }
    
    // Set the state manager reference
    setStateManager(stateManager) {
        this.stateManager = stateManager;
    }
    
    // Set the metadata display reference
    setMetadataDisplay(metadataDisplay) {
        this.metadataDisplay = metadataDisplay;
    }

    async initialize() {
        try {
            this.maxIndex = await this.fetchMaxIndex();
            console.log(`Loaded maxIndex: ${this.maxIndex}`);
            return true;
        } catch (error) {
            this.onImageError(`Failed to initialize: ${error.message}`);
            return false;
        }
    }
    
    async fetchMaxIndex() {
        const url = `${this.config.apiBaseUrl}/api/images/maxIndex`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data.maxIndex || data; // Handle both {maxIndex: n} and plain number responses
    }

    async loadRandomImage() {
        if (this.maxIndex === null) {
            const initialized = await this.initialize();
            if (!initialized) return;
        }
        
        const randomIndex = Math.floor(Math.random() * (this.maxIndex + 1));
        await this.loadImageByIndex(randomIndex);
    }
    
    async loadImageByIndex(index, updateUrl = true) {
        this.showLoading();
        this.hideError();

        try {
            const url = `${this.config.apiBaseUrl}/api/images/${index}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Extract metadata from headers
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = this.parseContentDisposition(contentDisposition);
            this.currentMetadata = { filename };

            const blob = await response.blob();
            this.currentIndex = index;
            const imageUrl = URL.createObjectURL(blob);
            this.elements.image.src = imageUrl;
            
            // Update metadata display if available
            if (this.metadataDisplay) {
                this.metadataDisplay.updateMetadata(this.currentMetadata);
            }
            
            // Update URL state if requested
            if (updateUrl && this.stateManager) {
                this.stateManager.updateUrl(index);
            }

        } catch (error) {
            this.onImageError(error.message);
        }
    }
    
    // Extract filename from Content-Disposition header
    parseContentDisposition(headerValue) {
        if (!headerValue) return null;
        
        // Parse "inline; filename="example.jpg""
        const regex = /filename="([^"]+)"/;
        const match = regex.exec(headerValue);
        return match ? match[1] : null;
    }

    onImageError(message = 'Failed to load image') {
        this.hideLoading();
        this.showError(message);
    }

    showLoading() {
        this.elements.loading.style.display = 'block';
    }

    hideLoading() {
        this.elements.loading.style.display = 'none';
    }

    showError(message) {
        this.elements.error.textContent = message;
        this.elements.error.style.display = 'block';
    }

    hideError() {
        this.elements.error.style.display = 'none';
    }
}
