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
        
        const startDrag = (e) => {
            e.preventDefault();
            const startX = e.clientX, startY = e.clientY;
            const cs = window.getComputedStyle(element);
            const baseLeft = parseFloat(cs.left) || 0;
            const baseTop = parseFloat(cs.top) || 0;
            element.style.transition = 'none';
            element.style.right = 'auto';

            const move = (e) => {
                element.style.left = (baseLeft + (e.clientX - startX)) + 'px';
                element.style.top = (baseTop + (e.clientY - startY)) + 'px';
            };

            const up = () => {
                document.removeEventListener('mousemove', move);
                element.style.transition = '';
            };

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up, { once: true });
        };
        
        // Event listeners
        handle.addEventListener('mousedown', startDrag);
        
        // Prevent text selection and dragging
        handle.addEventListener('selectstart', (e) => e.preventDefault());
        handle.addEventListener('dragstart', (e) => e.preventDefault());
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
