// Central State Management - Single source of truth for filter state
class StateManager {
    constructor(imageLoader) {
        this.imageLoader = imageLoader;
        this.currentFilter = null;
        this.filterManager = null;
        this.setupPopstateListener();
    }
    
    // Central method to set state - handles both filter and normal mode
    async setState(filter, index = null) {
        this.currentFilter = filter;
        
        if (filter) {
            const maxIndex = await this.imageLoader.fetchMaxIndex(filter);
            this.filterManager?.updateUI(filter, maxIndex);
            index = index ?? Math.floor(Math.random() * (maxIndex + 1));
            await this.imageLoader.loadByIndex(index, true, filter);
        } else {
            this.filterManager?.updateUI('', null);
            if (index !== null) {
                await this.imageLoader.loadByIndex(index, true);
            } else {
                await this.imageLoader.loadRandom();
            }
        }
    }
    
    // Update URL to reflect current image index
    updateUrl(filter, index) {
        const newUrl = filter ? `#filter/${encodeURIComponent(filter)}/${index}` : `#images/${index}`;
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
        const filtered = /^#filter\/([^/]+)\/(\d+)$/.exec(hash);
        
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
            if (urlData && urlData.index !== this.imageLoader.currentIndex) {
                this.setState(urlData.filter || null, urlData.index);
            }
        });
    }
    
    setFilterManager(filterManager) {
        this.filterManager = filterManager;
    }
    
    // Load image from current URL on app start
    async loadFromUrl() {
        const urlData = this.getCurrentIndexFromUrl();
        if (urlData) {
            await this.setState(urlData.filter || null, urlData.index);
            return true;
        }
        return false;
    }
    
    // Public API for components
    isFiltered() { return !!this.currentFilter; }
    getCurrentFilter() { return this.currentFilter; }
    async navigateRandom() { 
        return this.setState(this.currentFilter);
    }
}
