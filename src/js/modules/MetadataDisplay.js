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
        
        // Create drag handle (title bar)
        this.dragHandle = document.createElement('div');
        this.dragHandle.className = 'metadata-drag-handle';
        this.dragHandle.innerHTML = '⋮⋮ Image Info';
        
        // Create filename display
        this.filenameDisplay = document.createElement('div');
        this.filenameDisplay.className = 'metadata-filename';
        this.filenameDisplay.textContent = 'No filename available';
        
        // Create resize handle
        this.resizeHandle = document.createElement('div');
        this.resizeHandle.className = 'metadata-resize-handle';
        this.resizeHandle.innerHTML = '⋯';
        
        this.metadataBox.appendChild(this.dragHandle);
        this.metadataBox.appendChild(this.filenameDisplay);
        this.metadataBox.appendChild(this.resizeHandle);
        document.body.appendChild(this.metadataBox);
    }
    
    setupInteractions() {
        // Dragging functionality
        this.dragHandle.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        
        // Resizing functionality
        this.resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        
        // Prevent text selection during drag/resize
        this.dragHandle.addEventListener('selectstart', (e) => e.preventDefault());
        this.resizeHandle.addEventListener('selectstart', (e) => e.preventDefault());
    }
    
    startDrag(e) {
        this.isDragging = true;
        const rect = this.metadataBox.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        this.metadataBox.style.cursor = 'grabbing';
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
        this.metadataBox.style.cursor = '';
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
