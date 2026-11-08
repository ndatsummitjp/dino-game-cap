import type { Obstacle, ObstacleSprite } from "./gameTypes";

export default class GameState {
    private currentScoreValue = 0;
    private bestScoreValue = 0;
    private worldSpeedValue = 6;
    private obstacleSpawnCountdown = 0;
    private isRunningValue = false;
    private isGameOverValue = false;
    private readonly activeObstaclesValue: Obstacle[] = [];

    public get currentScore(): number {
        return this.currentScoreValue;
    }

    public get bestScore(): number {
        return this.bestScoreValue;
    }

    public get worldSpeed(): number {
        return this.worldSpeedValue;
    }

    public get isRunning(): boolean {
        return this.isRunningValue;
    }

    public get isGameOver(): boolean {
        return this.isGameOverValue;
    }

    public get activeObstacles(): readonly Obstacle[] {
        return this.activeObstaclesValue;
    }

    public start(): void {
        this.isRunningValue = true;
        this.isGameOverValue = false;
        this.currentScoreValue = 0;
        this.worldSpeedValue = 6;
        this.obstacleSpawnCountdown = 45;
        this.activeObstaclesValue.length = 0;
    }

    public stop(): void {
        this.isRunningValue = false;
    }

    public endGame(): void {
        this.isRunningValue = false;
        this.isGameOverValue = true;
        this.bestScoreValue = Math.max(this.bestScoreValue, Math.floor(this.currentScoreValue));
    }

    public update(delta: number, canvasWidth: number): void {
        this.currentScoreValue += this.worldSpeedValue * delta / 6;
        this.worldSpeedValue = Math.min(this.worldSpeedValue + 0.002 * delta, 13);
        this.updateObstacles(delta, canvasWidth);
    }

    private updateObstacles(delta: number, canvasWidth: number): void {
        this.obstacleSpawnCountdown -= delta;
        if (this.obstacleSpawnCountdown <= 0) {
            const sprite = this.nextObstacleSprite();
            const dimensions = this.getObstacleDimensions(sprite);
            this.activeObstaclesValue.push({
                x: canvasWidth + 12,
                width: dimensions.width,
                height: dimensions.height,
                sprite
            });
            this.obstacleSpawnCountdown = 55 + Math.random() * 35;
        }

        for (const obstacle of this.activeObstaclesValue) {
            obstacle.x -= this.worldSpeedValue * delta;
        }
        while (this.activeObstaclesValue.length && this.activeObstaclesValue[0].x + this.activeObstaclesValue[0].width < 0) {
            this.activeObstaclesValue.shift();
        }
    }

    private nextObstacleSprite(): ObstacleSprite {
        if (this.worldSpeedValue > 8.5 && Math.random() > 0.6) {
            return "pterodactyl";
        }
        return Math.random() > 0.5 ? "cactusLarge" : "cactusSmall";
    }

    private getObstacleDimensions(sprite: ObstacleSprite): { width: number; height: number } {
        switch (sprite) {
            case "cactusLarge":
                return { width: 25, height: 50 };
            case "pterodactyl":
                return { width: 46, height: 40 };
            case "cactusSmall":
                return { width: 17, height: 35 };
            default:
                throw new Error("Unknown obstacle sprite.");
        }
    }
}
