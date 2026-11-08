import type { CharacterSpriteName, CharacterSpriteUrls, SpriteName } from "./gameTypes";

export default class SpriteBank {
    private static readonly PATHS: Record<SpriteName, string> = {
        dinoIdle: "idle_image.png",
        dinoRun1: "run_1_image.png",
        dinoRun2: "run_2_image.png",
        dinoJump: "jump_image.png",
        dinoCrash: "crash_image.png",
        cactusSmall: "cactus-small.png",
        cactusLarge: "cactus-large.png",
        pterodactyl1: "pterodactyl-1.png",
        pterodactyl2: "pterodactyl-2.png",
        cloud: "cloud.png",
        ground: "ground.png"
    };

    private readonly images = new Map<SpriteName, HTMLImageElement>();
    private readonly failed = new Set<SpriteName>();
    private readonly characterImages = new Map<CharacterSpriteName, HTMLImageElement>();

    public get hasFailures(): boolean {
        return this.failed.size > 0;
    }

    public load(onChange: () => void, onError: (error: unknown) => void): void {
        for (const [name, fileName] of Object.entries(SpriteBank.PATHS) as [SpriteName, string][]) {
            const image = new Image();
            image.addEventListener("load", () => {
                if (this.images.get(name) !== image) {
                    return;
                }
                this.failed.delete(name);
                onChange();
            });
            image.addEventListener("error", () => {
                if (this.images.get(name) !== image) {
                    return;
                }
                this.failed.add(name);
                onError(new Error(`Failed to load game sprite "${fileName}".`));
                onChange();
            });
            this.images.set(name, image);
            image.src = sap.ui.require.toUrl(`game/assets/sprites/${fileName}`);
        }
    }

    public getReady(name: SpriteName): HTMLImageElement | null {
        const image = this.images.get(name);
        return image?.complete && image.naturalWidth > 0 ? image : null;
    }

    public getReadyCharacterSprite(name: CharacterSpriteName): HTMLImageElement | null {
        const image = this.characterImages.get(name);
        if (image?.complete && image.naturalWidth > 0) {
            return image;
        }
        return this.getReady(name);
    }

    public setCharacterSprites(
        sources: CharacterSpriteUrls,
        onChange: () => void,
        onError: (error: unknown) => void
    ): void {
        this.characterImages.clear();
        const entries = Object.entries(sources) as [CharacterSpriteName, string][];
        if (!entries.length) {
            onChange();
            return;
        }

        for (const [name, source] of entries) {
            const image = new Image();
            this.characterImages.set(name, image);
            image.addEventListener("load", () => {
                if (this.characterImages.get(name) === image) {
                    onChange();
                }
            });
            image.addEventListener("error", () => {
                if (this.characterImages.get(name) !== image) {
                    return;
                }
                this.characterImages.delete(name);
                onError(new Error(`Failed to load selected character sprite "${name}".`));
                onChange();
            });
            image.src = source;
        }
    }

    public clear(): void {
        this.images.clear();
        this.failed.clear();
        this.characterImages.clear();
    }
}
