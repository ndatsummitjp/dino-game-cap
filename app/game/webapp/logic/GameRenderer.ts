import CanvasSurface from "./CanvasSurface";
import Dinosaur from "./Dinosaur";
import GameState from "./GameState";
import type { GameDisplayTexts, Obstacle, SpriteName } from "./gameTypes";
import SpriteBank from "./SpriteBank";

export default class GameRenderer {
    private displayTexts: GameDisplayTexts = {
        scoreLabel: "SCORE",
        bestScoreLabel: "BEST",
        gameOver: "Game over",
        spriteLoadFailed: "Game sprites could not be loaded."
    };

    public setDisplayTexts(displayTexts: GameDisplayTexts): void {
        this.displayTexts = displayTexts;
    }

    public draw(canvas: CanvasSurface, sprites: SpriteBank, state: GameState, dinosaur: Dinosaur): void {
        if (!canvas.width || !canvas.height) {
            return;
        }

        const context = canvas.context;
        const groundY = canvas.height - 32;
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let index = 0; index < 3; index++) {
            const cloudX = this.wrapPosition(
                canvas.width * (0.25 + index * 0.32) - state.currentScore * 0.2,
                canvas.width + 46
            ) - 46;
            this.drawImageSprite(context, sprites, "cloud", cloudX, 52 + index % 2 * 36, 46, 14);
        }

        const groundOffset = (state.currentScore * 3) % 600;
        for (let x = -groundOffset; x < canvas.width; x += 600) {
            this.drawImageSprite(context, sprites, "ground", x, groundY, 600, 12);
        }
        for (const obstacle of state.activeObstacles) {
            this.drawObstacle(context, sprites, obstacle, groundY, state.currentScore);
        }
        dinosaur.draw(context, sprites, state, groundY);
        this.drawScore(context, canvas.width, state.currentScore, state.bestScore);

        if (sprites.hasFailures) {
            context.fillStyle = "#b91c1c";
            context.textAlign = "center";
            context.font = "600 16px sans-serif";
            context.fillText(this.displayTexts.spriteLoadFailed, canvas.width / 2, canvas.height / 2);
        }
        if (state.isGameOver) {
            context.fillStyle = "#1e293b";
            context.textAlign = "center";
            context.font = "700 24px sans-serif";
            context.fillText(this.displayTexts.gameOver, canvas.width / 2, canvas.height / 2);
        }
    }

    private drawObstacle(
        context: CanvasRenderingContext2D,
        sprites: SpriteBank,
        obstacle: Obstacle,
        groundY: number,
        currentScore: number
    ): void {
        let spriteName: SpriteName;
        if (obstacle.sprite === "pterodactyl") {
            spriteName = Math.floor(currentScore / 6) % 2 === 0 ? "pterodactyl1" : "pterodactyl2";
        } else {
            spriteName = obstacle.sprite;
        }
        const sprite = sprites.getReady(spriteName);
        if (sprite) {
            context.drawImage(sprite, obstacle.x, groundY - obstacle.height, obstacle.width, obstacle.height);
        }
    }

    private drawImageSprite(
        context: CanvasRenderingContext2D,
        sprites: SpriteBank,
        name: SpriteName,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        const sprite = sprites.getReady(name);
        if (sprite) {
            context.drawImage(sprite, x, y, width, height);
        }
    }

    private drawScore(context: CanvasRenderingContext2D, canvasWidth: number, currentScore: number, bestScore: number): void {
        context.fillStyle = "#475569";
        context.textAlign = "right";
        context.font = "600 14px monospace";
        context.fillText(
            `${this.displayTexts.scoreLabel} ${Math.floor(currentScore).toString().padStart(5, "0")}   ${this.displayTexts.bestScoreLabel} ${bestScore.toString().padStart(5, "0")}`,
            canvasWidth - 18,
            28
        );
    }

    private wrapPosition(position: number, range: number): number {
        return ((position % range) + range) % range;
    }
}
