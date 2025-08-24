// Metadata Display Component
class MetadataDisplay {
    constructor(elements) {
        this.elements = elements;
        this.isVisible = false;
        this.currentMetadata = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
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
        // Shared document event listeners (DRY principle)
        document.addEventListener('mousemove', (e) => {
            this.handleDrag(e);
            this.handleResize(e);
        });
        document.addEventListener('mouseup', () => {
            this.stopDrag();
            this.stopResize();
        });
        
        // Dragging functionality - only on the drag handle
        this.dragHandle.addEventListener('mousedown', (e) => this.startDrag(e));
        
        // Resizing functionality - on the right border
        this.resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
        
        // Prevent text selection and drag only on interactive elements (DRY principle)
        [this.dragHandle, this.resizeHandle].forEach(element => {
            element.addEventListener('selectstart', (e) => e.preventDefault());
            element.addEventListener('dragstart', (e) => e.preventDefault());
        });
    }
    
    startDrag(e) {
        this.isDragging = true;
        const rect = this.metadataBox.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        this.dragHandle.style.cursor = 'grabbing';
        e.preventDefault();
    }
    
    handleDrag(e) {
        if (!this.isDragging) return;
        
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - this.metadataBox.offsetWidth;
        const maxY = window.innerHeight - this.metadataBox.offsetHeight;
        
        const clampedX = Math.max(0, Math.min(x, maxX));
        const clampedY = Math.max(0, Math.min(y, maxY));
        
        this.metadataBox.style.left = `${clampedX}px`;
        this.metadataBox.style.top = `${clampedY}px`;
    }
    
    stopDrag() {
        this.isDragging = false;
        this.dragHandle.style.cursor = '';
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
        
        // Set minimum and maximum width
        const minWidth = 200;
        const maxWidth = window.innerWidth * 0.8;
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
    
    // Extract filename from Content-Disposition header
    parseContentDisposition(headerValue) {
        if (!headerValue) return null;
        
        // Parse "inline; filename="example.jpg""
        const regex = /filename="([^"]+)"/;
        const match = regex.exec(headerValue);
        return match ? match[1] : null;
    }
}
