import type { CharacterSpriteName, DinosaurAnimationState, Obstacle } from "./gameTypes";
import type SpriteBank from "./SpriteBank";

export default class Dinosaur {
    private static readonly WIDTH = 44;
    private static readonly HEIGHT = 47;
    private static readonly X = 54;
    private static readonly LEFT = 58;
    private static readonly RIGHT = 94;
    private static readonly JUMP_VELOCITY = 13;

    private jumpHeight = 0;
    private jumpVelocity = 0;

    public reset(): void {
        this.jumpHeight = 0;
        this.jumpVelocity = 0;
    }

    public jump(): void {
        if (this.jumpHeight === 0) {
            this.jumpVelocity = Dinosaur.JUMP_VELOCITY;
        }
    }

    public update(delta: number): void {
        if (this.jumpHeight > 0 || this.jumpVelocity > 0) {
            this.jumpHeight += this.jumpVelocity * delta;
            this.jumpVelocity -= 0.72 * delta;
            if (this.jumpHeight <= 0) {
                this.reset();
            }
        }
    }

    public collides(obstacles: readonly Obstacle[], canvasHeight: number): boolean {
        const groundY = canvasHeight - 32;
        const playerBottom = groundY - this.jumpHeight;
        return obstacles.some((obstacle) => {
            const obstacleTop = groundY - obstacle.height;
            return Dinosaur.RIGHT > obstacle.x
                && Dinosaur.LEFT < obstacle.x + obstacle.width
                && playerBottom > obstacleTop;
        });
    }

    public draw(
        context: CanvasRenderingContext2D,
        sprites: SpriteBank,
        state: DinosaurAnimationState,
        groundY: number
    ): void {
        const sprite = sprites.getReadyCharacterSprite(this.getSpriteName(state));
        if (sprite) {
            context.drawImage(
                sprite,
                Dinosaur.X,
                groundY - Dinosaur.HEIGHT - this.jumpHeight,
                Dinosaur.WIDTH,
                Dinosaur.HEIGHT
            );
        }
    }

    private getSpriteName(state: DinosaurAnimationState): CharacterSpriteName {
        if (state.isGameOver) {
            return "dinoCrash";
        }
        if (this.jumpHeight > 0) {
            return "dinoJump";
        }
        if (state.isRunning) {
            return Math.floor(state.currentScore / 3) % 2 === 0 ? "dinoRun1" : "dinoRun2";
        }
        return "dinoIdle";
    }
}
