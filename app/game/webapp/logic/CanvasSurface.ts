export default class CanvasSurface {
    private element: HTMLCanvasElement | null = null;
    private drawingContext: CanvasRenderingContext2D | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private surfaceWidth = 0;
    private surfaceHeight = 0;

    public get canvas(): HTMLCanvasElement {
        if (!this.element) {
            throw new Error("The game canvas has not been initialized.");
        }
        return this.element;
    }

    public get context(): CanvasRenderingContext2D {
        if (!this.drawingContext) {
            throw new Error("The game canvas context has not been initialized.");
        }
        return this.drawingContext;
    }

    public get width(): number {
        return this.surfaceWidth;
    }

    public get height(): number {
        return this.surfaceHeight;
    }

    public initialize(onResize: () => void): void {
        this.dispose();

        const canvas = document.querySelector(".dinoGameCanvas");
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("The game canvas is missing from the view.");
        }
        this.element = canvas;
        this.drawingContext = canvas.getContext("2d");
        if (!this.drawingContext) {
            throw new Error("This browser does not support the game canvas.");
        }

        this.resizeObserver = new ResizeObserver(onResize);
        this.resizeObserver.observe(canvas);
        this.resize();
    }

    public resize(): boolean {
        if (!this.element || !this.drawingContext) {
            return false;
        }

        const bounds = this.element.getBoundingClientRect();
        if (!bounds.width || !bounds.height) {
            return false;
        }

        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.surfaceWidth = bounds.width;
        this.surfaceHeight = bounds.height;
        this.element.width = Math.round(bounds.width * pixelRatio);
        this.element.height = Math.round(bounds.height * pixelRatio);
        this.drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        return true;
    }

    public dispose(): void {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.element = null;
        this.drawingContext = null;
        this.surfaceWidth = 0;
        this.surfaceHeight = 0;
    }
}
