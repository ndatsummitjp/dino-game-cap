export default class GameInput {
    private canvas: HTMLCanvasElement | null = null;

    public constructor(private readonly onAction: () => void) {}

    public attach(canvas: HTMLCanvasElement): void {
        this.detach();
        this.canvas = canvas;
        this.canvas.addEventListener("keydown", this.handleKeyDown);
    }

    public detach(): void {
        this.canvas?.removeEventListener("keydown", this.handleKeyDown);
        this.canvas = null;
    }

    private readonly handleKeyDown = (event: KeyboardEvent): void => {
        if (event.code !== "Space" && event.code !== "ArrowUp") {
            return;
        }
        event.preventDefault();
        if (!event.repeat) {
            this.onAction();
        }
    };
}
