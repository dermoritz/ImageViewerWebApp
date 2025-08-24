// Minimal Filter Manager - Only UI state, delegates everything else
class FilterManager {
    constructor(imageLoader, stateManager) {
        this.imageLoader = imageLoader;
        this.stateManager = stateManager;
        this.currentFilter = null;
        
        this.input = document.getElementById('filterInput');
        this.btn = document.getElementById('filterBtn');
        this.box = document.getElementById('filterBox');
        this.countDisplay = document.getElementById('filterCount');
        
        // Set button to always show green checkmark
        this.btn.textContent = '✓';
        this.btn.className = 'active';
        
        this.input.addEventListener('keydown', e => e.key === 'Enter' && this.toggle());
        this.btn.addEventListener('click', () => this.toggle());
        
        // Add drag to handle only (DRY - reuse MetadataDisplay pattern)
        const dragHandle = this.box.querySelector('.drag-handle');
        dragHandle.addEventListener('mousedown', (e) => {
            let isDragging = true;
            const rect = this.box.getBoundingClientRect();
            const offset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            
            const handleMove = (e) => {
                if (!isDragging) return;
                this.box.style.left = (e.clientX - offset.x) + 'px';
                this.box.style.top = (e.clientY - offset.y) + 'px';
                this.box.style.right = 'auto';
            };
            
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', () => {
                isDragging = false;
                document.removeEventListener('mousemove', handleMove);
            }, { once: true });
        });
    }
    
    async toggle() {
        const filter = this.input.value.trim();
        filter ? await this.apply(filter) : await this.clear();
    }
    
    async apply(filter) {
        try {
            const maxIndex = await this.imageLoader.fetchMaxIndex(filter);
            this.updateCountDisplay(maxIndex);
            await this.imageLoader.loadRandom(filter);
            this.currentFilter = filter;
        } catch (error) {
            this.imageLoader.onImageError(`Filter failed: ${error.message}`);
        }
    }
    
    async clear() {
        this.currentFilter = null;
        this.input.value = '';
        this.countDisplay.style.display = 'none';
        await this.imageLoader.loadRandom();
    }
    
    async loadFromUrl(filter, index) {
        this.currentFilter = filter;
        this.input.value = filter;
        return this.imageLoader.loadByIndex(index, false, filter);
    }
    
    isActive() { return !!this.currentFilter; }
    navigateRandom() { return this.imageLoader.loadRandom(this.currentFilter); }
    
    updateCountDisplay(maxIndex) {
        this.countDisplay.textContent = `(${maxIndex})`;
        this.countDisplay.style.display = 'block';
    }
}