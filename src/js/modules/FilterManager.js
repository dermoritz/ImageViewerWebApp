// UI Controller for Filter - Delegates state management to StateManager
class FilterManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        
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
        const filter = this.input.value.trim() || null;
        await this.stateManager.setState(filter);
    }
    
    // Update UI state (called by StateManager)
    updateUI(filter, maxIndex) {
        this.input.value = filter;
        if (maxIndex !== null) {
            this.countDisplay.textContent = `(${maxIndex})`;
            this.countDisplay.style.display = 'block';
        } else {
            this.countDisplay.style.display = 'none';
        }
    }
}