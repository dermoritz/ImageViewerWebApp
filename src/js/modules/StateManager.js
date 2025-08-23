// State Management and Browser History
class StateManager {
    constructor(imageLoader) {
        this.imageLoader = imageLoader;
        this.setupPopstateListener();
    }
    
    // Update URL to reflect current image index
    updateUrl(index) {
        const newUrl = `#images/${index}`;
        if (window.location.hash !== newUrl) {
            history.pushState({ imageIndex: index }, '', newUrl);
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
        const regex = /^#images\/(\d+)$/;
        const match = regex.exec(hash);
        return match ? parseInt(match[1], 10) : null;
    }
    
    // Handle browser back/forward navigation
    setupPopstateListener() {
        window.addEventListener('popstate', (event) => {
            const index = this.getCurrentIndexFromUrl();
            if (index !== null && index !== this.imageLoader.currentIndex) {
                this.imageLoader.loadImageByIndex(index, false); // false = don't update URL again
            }
        });
    }
    
    // Load image from current URL on app start
    async loadFromUrl() {
        const index = this.getCurrentIndexFromUrl();
        if (index !== null) {
            await this.imageLoader.loadImageByIndex(index, false);
            return true;
        }
        return false;
    }
}
