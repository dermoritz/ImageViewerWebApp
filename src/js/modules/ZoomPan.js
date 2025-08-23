class ZoomPan {
    constructor(elements) {
        this.elements = elements;
        this.panzoom = null;
        this.isZoomed = false;
    }

    setupPanzoom() {
        if (this.panzoom) this.panzoom.destroy();

        const zoomFactor = this.calculateZoomFactorToFit();
        const start = this.calculateXYstart(zoomFactor);

        this.panzoom = Panzoom(this.elements.imageContainer, {
            startScale: zoomFactor,
            minScale: 0.01,
            startX: start.x,
            startY: start.y,
            animate: false,
            noBind: true
        });
    }

    calculateZoomFactorToFit() {
        const factor = 1;
        const imageWidth = this.elements.image.naturalWidth;
        const imageHeight = this.elements.image.naturalHeight;
        const containerWidth = this.elements.imageContainer.clientWidth;
        const containerHeight = this.elements.imageContainer.clientHeight;
        const widthFactor = containerWidth / imageWidth;
        const heightFactor = containerHeight / imageHeight;

        return Math.min(factor, widthFactor, heightFactor);
    }

    calculateXYstart(zoomFactor) {
        const result = { x: 0, y: 0 };
        result.x = -(this.elements.image.naturalWidth - this.elements.image.naturalWidth * zoomFactor) / 2;
        result.y = -(this.elements.image.naturalHeight - this.elements.image.naturalHeight * zoomFactor) / 2;
        return result;
    }

    zoomToPoint(event) {
        const point = { clientX: event.clientX, clientY: event.clientY };
        this.panzoom.zoomToPoint(1.0, point, { animate: false });
        this.isZoomed = true;
    }

    resetZoom() {
        this.panzoom.reset({ animate: false });
        this.isZoomed = false;
    }

    pan(event, pointerPosition) {
        if (this.isZoomed) {
            const currentPan = this.panzoom.getPan();
            this.panzoom.pan(
                currentPan.x - (pointerPosition.x - event.x),
                currentPan.y - (pointerPosition.y - event.y),
                { force: true }
            );
        }
    }
}
