// Shared utility functions
class Utils {
    // Constants
    static VIEWPORT_BOUNDS = {
        MIN_METADATA_WIDTH: 200,
        MAX_METADATA_WIDTH_RATIO: 0.8
    };
    
    // Extract filename from Content-Disposition header
    static parseContentDisposition(headerValue) {
        if (!headerValue) return null;
        
        // Parse "inline; filename="example.jpg""
        const regex = /filename="([^"]+)"/;
        const match = regex.exec(headerValue);
        return match ? match[1] : null;
    }
    
    // Generic element visibility toggle
    static toggleElement(element, show, text = null) {
        if (show) {
            element.style.display = 'block';
            if (text !== null) element.textContent = text;
        } else {
            element.style.display = 'none';
        }
    }
    
    // Reusable drag handler for draggable elements
    static makeDraggable(element, dragHandle = null) {
        const handle = dragHandle || element;
        let isDragging = false;
        let offset = { x: 0, y: 0 };
        
        const startDrag = (e) => {
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            handle.style.cursor = 'grabbing';
            e.preventDefault();
        };
        
        const handleMove = (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - offset.x;
            const y = e.clientY - offset.y;
            
            // Keep within viewport bounds
            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight;
            
            const clampedX = Math.max(0, Math.min(x, maxX));
            const clampedY = Math.max(0, Math.min(y, maxY));
            
            element.style.left = `${clampedX}px`;
            element.style.top = `${clampedY}px`;
            element.style.right = 'auto'; // Override any right positioning
        };
        
        const stopDrag = () => {
            isDragging = false;
            handle.style.cursor = '';
        };
        
        // Event listeners
        handle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', stopDrag);
        
        // Prevent text selection and dragging
        handle.addEventListener('selectstart', (e) => e.preventDefault());
        handle.addEventListener('dragstart', (e) => e.preventDefault());
        
        return { startDrag, handleMove, stopDrag }; // Return for cleanup if needed
    }
    
    // Build API URLs consistently
    static buildApiUrl(baseUrl, endpoint, filter = null, index = null) {
        if (filter) {
            const encodedFilter = encodeURIComponent(filter);
            if (endpoint === 'images/maxIndex') {
                return `${baseUrl}/api/filter/${encodedFilter}/maxIndex`;
            }
            return index !== null ? 
                `${baseUrl}/api/filter/${encodedFilter}/${endpoint}/${index}` :
                `${baseUrl}/api/filter/${encodedFilter}/${endpoint}`;
        }
        
        return index !== null ? 
            `${baseUrl}/api/${endpoint}/${index}` :
            `${baseUrl}/api/${endpoint}`;
    }
}
