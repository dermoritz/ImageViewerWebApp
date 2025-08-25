// Central State Management
class StateManager {
    constructor(imageLoader) {
        this.imageLoader = imageLoader;
        this.currentFilter = null;
        this.sortMode = false;
        this.filterManager = null;
        this.setupPopstateListener();
    }
    
    // Main state setter - handles filter, sort, and index
    async setState(filter, index = null, sort = null) {
        this.currentFilter = filter;
        if (sort !== null) this.sortMode = sort;
        
        if (filter) {
            const maxIndex = await this.imageLoader.fetchMaxIndex(filter);
            this.filterManager?.updateUI(filter, maxIndex, this.sortMode);
            index = index ?? (this.sortMode ? 0 : Math.floor(Math.random() * (maxIndex + 1)));
            await this.imageLoader.loadByIndex(index, true, filter);
        } else {
            this.filterManager?.updateUI('', null, this.sortMode);
            if (index !== null) {
                await this.imageLoader.loadByIndex(index, true);
            } else {
                await this.imageLoader.loadRandom(null);
            }
        }
    }
    
    // Navigation methods
    async getMaxIndex() {
        return this.currentFilter ? 
            await this.imageLoader.fetchMaxIndex(this.currentFilter) :
            await this.imageLoader.fetchMaxIndex();
    }
    
    async next() {
        if (!this.sortMode) return this.imageLoader.loadRandom(this.currentFilter);
        
        const maxIndex = await this.getMaxIndex();
        const nextIndex = this.imageLoader.currentIndex >= maxIndex ? 0 : this.imageLoader.currentIndex + 1;
        await this.imageLoader.loadByIndex(nextIndex, true, this.currentFilter);
    }
    
    async prev() {
        if (!this.sortMode) return this.imageLoader.loadRandom(this.currentFilter);
        
        const maxIndex = await this.getMaxIndex();
        const prevIndex = this.imageLoader.currentIndex <= 0 ? maxIndex : this.imageLoader.currentIndex - 1;
        await this.imageLoader.loadByIndex(prevIndex, true, this.currentFilter);
    }
    
    setSortMode(sort) {
        this.sortMode = sort;
        this.updateUrl(this.currentFilter, this.imageLoader.currentIndex);
    }
    
    // Update URL to reflect current state
    updateUrl(filter, index) {
        const baseHash = filter ? 
            `#filter/${encodeURIComponent(filter)}/${index}` : 
            `#images/${index}`;
        const newUrl = this.sortMode ? `${baseHash}?sort=true` : baseHash;
        if (window.location.hash !== newUrl) {
            history.pushState({ filter, imageIndex: index, sort: this.sortMode }, '', newUrl);
        }
    }
    
    goBack() {
        if (history.length > 1) {
            history.back();
        }
    }
    
    getCurrentIndexFromUrl() {
        const hash = window.location.hash;
        if (!hash?.startsWith('#')) return null;
        
        const [hashPart, queryPart] = hash.split('?');
        const sort = queryPart?.includes('sort=true') || false;
        
        // Try filter pattern: #filter/term/123
        const filterRegex = /^#filter\/([^/]+)\/(\d+)$/;
        const filterMatch = filterRegex.exec(hashPart);
        if (filterMatch) {
            return { 
                filter: decodeURIComponent(filterMatch[1]), 
                index: parseInt(filterMatch[2], 10), 
                sort 
            };
        }
        
        // Try normal pattern: #images/123
        const normalRegex = /^#images\/(\d+)$/;
        const normalMatch = normalRegex.exec(hashPart);
        if (normalMatch) {
            return { index: parseInt(normalMatch[1], 10), sort };
        }
        
        return null;
    }
    
    setupPopstateListener() {
        window.addEventListener('popstate', () => {
            const urlData = this.getCurrentIndexFromUrl();
            if (urlData?.index !== this.imageLoader.currentIndex) {
                this.setState(urlData.filter || null, urlData.index, urlData.sort);
            }
        });
    }
    
    setFilterManager(filterManager) {
        this.filterManager = filterManager;
    }
    
    async loadFromUrl() {
        const urlData = this.getCurrentIndexFromUrl();
        if (urlData) {
            await this.setState(urlData.filter || null, urlData.index, urlData.sort);
            return true;
        }
        return false;
    }
}
