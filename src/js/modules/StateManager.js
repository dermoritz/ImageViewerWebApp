// State Management and Browser History
class StateManager {
    constructor(imageLoader) {
        this.imageLoader = imageLoader;
        this.setupPopstateListener();
    }
    
    // Update URL to reflect current image index
    updateUrl(filter, index) {
        const newUrl = filter ? `#images/${encodeURIComponent(filter)}/${index}` : `#images/${index}`;
        if (window.location.hash !== newUrl) {
            history.pushState({ filter, imageIndex: index }, '', newUrl);
        }
    }
    
    // Navigate back in history
    goBack() {
        if (history.length > 1) {
            history.back();
        }
    }
    
    // Get current index from URL hash
    getCurrentIndexFromUrl() {
        const hash = window.location.hash;
        const normal = /^#images\/(\d+)$/.exec(hash);
        const filtered = /^#images\/([^/]+)\/(\d+)$/.exec(hash);
        
        if (filtered) {
            return { filter: decodeURIComponent(filtered[1]), index: parseInt(filtered[2], 10) };
        }
        if (normal) {
            return { index: parseInt(normal[1], 10) };
        }
        return null;
    }
    
    // Handle browser back/forward navigation
    setupPopstateListener() {
        window.addEventListener('popstate', (event) => {
            const urlData = this.getCurrentIndexFromUrl();
            if (urlData?.filter && this.filterManager) {
                this.filterManager.loadFromUrl(urlData.filter, urlData.index);
            } else if (urlData?.index !== this.imageLoader.currentIndex) {
                this.imageLoader.loadByIndex(urlData.index, false);
            }
        });
    }
    
    setFilterManager(filterManager) {
        this.filterManager = filterManager;
    }
    
    // Load image from current URL on app start
    async loadFromUrl() {
        const urlData = this.getCurrentIndexFromUrl();
        if (urlData?.filter && this.filterManager) {
            return this.filterManager.loadFromUrl(urlData.filter, urlData.index);
        } else if (urlData?.index) {
            await this.imageLoader.loadByIndex(urlData.index, false);
            return true;
        }
        return false;
    }
}
