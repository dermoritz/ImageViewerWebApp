// Metadata Display Component
class MetadataDisplay {
    constructor(elements) {
        this.elements = elements;
        this.isVisible = false;
        this.currentMetadata = null;
        this.createMetadataBox();
    }
    
    createMetadataBox() {
        // Create metadata container
        this.metadataBox = document.createElement('div');
        this.metadataBox.id = 'metadataBox';
        this.metadataBox.className = 'metadata-box hidden';
        
        // Create filename display
        this.filenameDisplay = document.createElement('div');
        this.filenameDisplay.className = 'metadata-filename';
        this.filenameDisplay.textContent = 'No filename available';
        
        this.metadataBox.appendChild(this.filenameDisplay);
        document.body.appendChild(this.metadataBox);
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
