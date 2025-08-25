// Metadata Display Component
class MetadataDisplay {
    constructor(elements) {
        this.elements = elements;
        this.isVisible = false;
        this.currentMetadata = null;
        this.isResizing = false;
        this.createMetadataBox();
        this.setupInteractions();
    }
    
    createMetadataBox() {
        // Create metadata container
        this.metadataBox = document.createElement('div');
        this.metadataBox.id = 'metadataBox';
        this.metadataBox.className = 'metadata-box hidden';
        
        // Create content wrapper for flexbox layout
        this.contentWrapper = document.createElement('div');
        this.contentWrapper.className = 'metadata-content-wrapper';
        
        // Create all child elements
        const elements = [
            { el: 'dragHandle', class: 'metadata-drag-handle', content: '\u24D8' },
            { el: 'filenameDisplay', class: 'metadata-filename', content: 'No filename available' },
            { el: 'resizeHandle', class: 'metadata-resize-handle', content: '' }
        ];
        
        elements.forEach(({ el, class: className, content }) => {
            this[el] = document.createElement('div');
            this[el].className = className;
            if (content) this[el].textContent = content;
            this.contentWrapper.appendChild(this[el]);
        });
        
        this.metadataBox.appendChild(this.contentWrapper);
        document.body.appendChild(this.metadataBox);
    }
    
    setupInteractions() {
        // Make the metadata box draggable using the drag handle
        Utils.makeDraggable(this.metadataBox, this.dragHandle);
        
        // Resizing functionality - on the right border
        this.resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
        
        // Shared document event listeners for resizing
        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        
        // Prevent text selection and drag on resize handle
        this.resizeHandle.addEventListener('selectstart', (e) => e.preventDefault());
        this.resizeHandle.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    startResize(e) {
        this.isResizing = true;
        this.startWidth = this.metadataBox.offsetWidth;
        this.startX = e.clientX;
        this.resizeHandle.style.cursor = 'ew-resize';
        e.preventDefault();
        e.stopPropagation();
    }
    
    handleResize(e) {
        if (!this.isResizing) return;
        
        const deltaX = e.clientX - this.startX;
        const newWidth = this.startWidth + deltaX;
        
        // Set minimum and maximum width using constants
        const minWidth = Utils.VIEWPORT_BOUNDS.MIN_METADATA_WIDTH;
        const maxWidth = window.innerWidth * Utils.VIEWPORT_BOUNDS.MAX_METADATA_WIDTH_RATIO;
        const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        
        this.metadataBox.style.width = `${clampedWidth}px`;
    }
    
    stopResize() {
        this.isResizing = false;
        this.resizeHandle.style.cursor = '';
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.show();
        } else {
            this.hide();
        }
    }
    
    show() {
        this.metadataBox.classList.remove('hidden');
        this.metadataBox.classList.add('visible');
        this.isVisible = true;
    }
    
    hide() {
        this.metadataBox.classList.remove('visible');
        this.metadataBox.classList.add('hidden');
        this.isVisible = false;
    }
    
    updateMetadata(metadata) {
        this.currentMetadata = metadata;
        if (metadata?.filename) {
            this.filenameDisplay.textContent = metadata.filename;
        } else {
            this.filenameDisplay.textContent = 'No filename available';
        }
    }
}
