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
    
    async fetchMaxIndex(filter) {
        const url = Utils.buildApiUrl(this.config.apiBaseUrl, 'images/maxIndex', filter);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        // Both endpoints return plain text according to API docs
        const data = await response.text();
        return parseInt(data, 10);
    }

    async loadRandom(filter) {
        if (this.maxIndex === null) {
            const initialized = await this.initialize();
            if (!initialized) return;
        }
        
        const maxIndex = await this.fetchMaxIndex(filter);
        const randomIndex = Math.floor(Math.random() * (maxIndex + 1));
        await this.loadByIndex(randomIndex, true, filter);
    }
    
    async loadByIndex(index, updateUrl = true, filter = null) {
        this.showLoading();
        this.hideError();

        try {
            const url = Utils.buildApiUrl(this.config.apiBaseUrl, 'images', filter, index);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Extract metadata from headers
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = Utils.parseContentDisposition(contentDisposition);
            this.currentMetadata = filter ? { filename, filter, index } : { filename };

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
                filter ? 
                    this.stateManager.updateUrl(filter, index) :
                    this.stateManager.updateUrl(null, index);
            }

        } catch (error) {
            this.onImageError(error.message);
        }
    }
    
    onImageError(message = 'Failed to load image') {
        Utils.toggleElement(this.elements.loading, false);
        Utils.toggleElement(this.elements.error, true, message);
    }

    showLoading() {
        Utils.toggleElement(this.elements.loading, true);
    }

    hideLoading() {
        Utils.toggleElement(this.elements.loading, false);
    }

    showError(message) {
        Utils.toggleElement(this.elements.error, true, message);
    }

    hideError() {
        Utils.toggleElement(this.elements.error, false);
    }
}
