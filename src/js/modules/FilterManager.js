// UI Controller for Filter - Delegates state management to StateManager
class FilterManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        
        this.input = document.getElementById('filterInput');
        this.btn = document.getElementById('filterBtn');
        this.box = document.getElementById('filterBox');
        this.countDisplay = document.getElementById('filterCount');
        this.sortCheckbox = document.getElementById('sortCheckbox');
        
        // Start collapsed
        this.box.classList.add('hidden');
        
        // Set button to always show green checkmark
        this.btn.textContent = '✓';
        this.btn.className = 'active';
        
        this.input.addEventListener('keydown', e => e.key === 'Enter' && this.toggle());
        this.btn.addEventListener('click', () => this.toggle());
        this.sortCheckbox.addEventListener('change', () => this.onSortChange());
        
        // Make the box draggable using the drag handle
        const dragHandle = this.box.querySelector('.drag-handle');
        Utils.makeDraggable(this.box, dragHandle);
        
        // Add click event to drag handle for toggling visibility
        dragHandle.addEventListener('click', () => {
            this.box.classList.toggle('hidden');
        });
    }
    
    async toggle() {
        const filter = this.input.value.trim() || null;
        await this.stateManager.setState(filter);
    }
    
    async onSortChange() {
        this.stateManager.setSortMode(this.sortCheckbox.checked);
    }
    
    // Update UI state (called by StateManager)
    updateUI(filter, maxIndex, sortMode) {
        this.input.value = filter;
        this.sortCheckbox.checked = sortMode;
        if (maxIndex !== null) {
            this.countDisplay.textContent = `(${maxIndex})`;
            Utils.toggleElement(this.countDisplay, true);
        } else {
            Utils.toggleElement(this.countDisplay, false);
        }
    }
}