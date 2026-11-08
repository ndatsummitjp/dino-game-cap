export type ObstacleSprite = "cactusSmall" | "cactusLarge" | "pterodactyl";

export type Obstacle = {
    x: number;
    width: number;
    height: number;
    sprite: ObstacleSprite;
};

export type CharacterSpriteName = "dinoIdle" | "dinoRun1" | "dinoRun2" | "dinoJump" | "dinoCrash";

export type CharacterSpriteUrls = Partial<Record<CharacterSpriteName, string>>;

export type GameDisplayTexts = {
    scoreLabel: string;
    bestScoreLabel: string;
    gameOver: string;
    spriteLoadFailed: string;
};

export type SpriteName =
    | CharacterSpriteName
    | "cactusSmall"
    | "cactusLarge"
    | "pterodactyl1"
    | "pterodactyl2"
    | "cloud"
    | "ground";

export type DinosaurAnimationState = {
    isGameOver: boolean;
    isRunning: boolean;
    currentScore: number;
};
