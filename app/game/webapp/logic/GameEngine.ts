import CanvasSurface from "./CanvasSurface";
import Dinosaur from "./Dinosaur";
import GameInput from "./GameInput";
import GameRenderer from "./GameRenderer";
import GameState from "./GameState";
import SpriteBank from "./SpriteBank";
import type { CharacterSpriteUrls, GameDisplayTexts } from "./gameTypes";

export default class GameEngine {
    private readonly canvas = new CanvasSurface();
    private readonly state = new GameState();
    private readonly dinosaur = new Dinosaur();
    private readonly sprites = new SpriteBank();
    private readonly renderer = new GameRenderer();
    private readonly input = new GameInput(() => this.runWithErrorHandler(() => this.handleGameKey()));
    private animationFrameId: number | null = null;
    private previousFrameTimestamp = 0;

    public constructor(private readonly onError: (error: unknown) => void) {}

    public initialize(): void {
        this.dispose();
        this.canvas.initialize(() => {
            this.runWithErrorHandler(() => {
                if (this.canvas.resize() && !this.state.isRunning) {
                    this.draw();
                }
            });
        });

        this.sprites.load(
            () => this.runWithErrorHandler(() => this.draw()),
            this.onError
        );
        this.input.attach(this.canvas.canvas);
        this.draw();
    }

    public dispose(): void {
        this.input.detach();
        this.sprites.clear();
        this.canvas.dispose();
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.state.stop();
    }

    public startGame(): void {
        this.canvas.canvas.focus();
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.state.start();
        this.dinosaur.reset();
        this.previousFrameTimestamp = performance.now();
        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    public jump(): void {
        if (!this.state.isRunning) {
            this.startGame();
        }
        this.dinosaur.jump();
        this.canvas.canvas.focus();
    }

    public setCharacterSprites(sources: CharacterSpriteUrls): void {
        this.sprites.setCharacterSprites(
            sources,
            () => this.runWithErrorHandler(() => this.draw()),
            this.onError
        );
    }

    public setDisplayTexts(displayTexts: GameDisplayTexts): void {
        this.renderer.setDisplayTexts(displayTexts);
        this.draw();
    }

    private handleGameKey(): void {
        if (this.state.isRunning) {
            this.jump();
        } else {
            this.startGame();
        }
    }

    private readonly animate = (timestamp: number): void => {
        try {
            const delta = Math.min((timestamp - this.previousFrameTimestamp) / (1000 / 60), 2);
            this.previousFrameTimestamp = timestamp;
            this.state.update(delta, this.canvas.width);
            this.dinosaur.update(delta);
            if (this.dinosaur.collides(this.state.activeObstacles, this.canvas.height)) {
                this.state.endGame();
            }
            this.draw();

            if (this.state.isRunning) {
                this.animationFrameId = requestAnimationFrame(this.animate);
            } else {
                this.animationFrameId = null;
            }
        } catch (error) {
            this.state.stop();
            this.animationFrameId = null;
            this.onError(error);
        }
    };

    private draw(): void {
        this.renderer.draw(this.canvas, this.sprites, this.state, this.dinosaur);
    }

    private runWithErrorHandler(action: () => void): void {
        try {
            action();
        } catch (error) {
            this.onError(error);
        }
    }
}
