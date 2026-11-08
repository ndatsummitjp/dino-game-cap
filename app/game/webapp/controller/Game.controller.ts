import MessageToast from "sap/m/MessageToast";
import Controller from "sap/ui/core/mvc/Controller";
import type { Select$ChangeEvent } from "sap/m/Select";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import GameEngine from "game/logic/GameEngine";
import CharacterModel from "game/model/CharacterModel";
import type { GameDisplayTexts } from "game/logic/gameTypes";

/**
 * @namespace game.controller
 */
export default class Game extends Controller {
    private gameEngine: GameEngine | null = null;
    private characterModel: CharacterModel | null = null;

    public onInit(): void {
        const view = this.getView();
        if (!view) {
            this.handleGameError(new Error("The game view is not available."));
            return;
        }

        const i18nModel = this.getOwnerComponent()?.getModel("i18n");
        const initialName = i18nModel instanceof ResourceModel
            ? i18nModel.getProperty("/defaultCharacterName")
            : null;
        const characterModel = new CharacterModel(typeof initialName === "string" ? initialName : "");
        this.characterModel = characterModel;
        view.setModel(characterModel, "characterState");

        if (i18nModel instanceof ResourceModel) {
            void this.loadDefaultCharacterName(i18nModel, characterModel).catch(this.handleGameError);
        } else {
            this.handleGameError(new Error("The game translation model is not available."));
        }

        const model = this.getOwnerComponent()?.getModel();
        if (!(model instanceof ODataModel)) {
            this.handleGameError(new Error("The DinoService OData V4 model is not available."));
            return;
        }
        void characterModel.loadCharacters(model)
            .then(() => this.gameEngine?.setCharacterSprites(characterModel.getSelectedSpriteUrls()))
            .catch(this.handleGameError);
    }

    private async loadDefaultCharacterName(
        i18nModel: ResourceModel,
        characterModel: CharacterModel
    ): Promise<void> {
        const bundle = await i18nModel.getResourceBundle();
        const defaultCharacterName = bundle.getText("defaultCharacterName");
        if (!defaultCharacterName || defaultCharacterName === "defaultCharacterName") {
            throw new Error("The default character name translation is not available.");
        }
        characterModel.setDefaultCharacterName(defaultCharacterName);
    }

    public onAfterRendering(): void {
        this.runGameAction(() => {
            this.gameEngine ??= new GameEngine(this.handleGameError);
            this.gameEngine.initialize();
            this.gameEngine.setCharacterSprites(this.characterModel?.getSelectedSpriteUrls() ?? {});
            this.loadGameDisplayTexts();
        });
    }

    public onExit(): void {
        this.runGameAction(() => {
            this.gameEngine?.dispose();
            this.gameEngine = null;
        });
    }

    public onStartGame(): void {
        this.runGameAction(() => this.requireGameEngine().startGame());
    }

    public onJump(): void {
        this.runGameAction(() => this.requireGameEngine().jump());
    }

    public onCharacterChange(event: Select$ChangeEvent): void {
        if (!this.characterModel) {
            this.handleGameError(new Error("The character selection model is not available."));
            return;
        }

        const selectedCharacter = this.characterModel.selectCharacter(event.getSource().getSelectedKey());
        this.gameEngine?.setCharacterSprites(selectedCharacter.spriteUrls);
    }

    private readonly handleGameError = (error: unknown): void => {
        const message = error instanceof Error ? error.message : String(error);
        MessageToast.show(message);
    };

    private loadGameDisplayTexts(): void {
        const i18nModel = this.getView()?.getModel("i18n");
        if (!(i18nModel instanceof ResourceModel)) {
            this.handleGameError(new Error("The game translation model is not available."));
            return;
        }

        void (async () => {
            const bundle = await i18nModel.getResourceBundle();
            document.title = bundle.getText("appTitle") ?? "Dino Runner";
            document.documentElement.lang = sap.ui.getCore().getConfiguration().getLanguage().replace("_", "-");
            const displayTexts: GameDisplayTexts = {
                scoreLabel: bundle.getText("scoreLabel") ?? "SCORE",
                bestScoreLabel: bundle.getText("bestScoreLabel") ?? "BEST",
                gameOver: bundle.getText("gameOver") ?? "Game over",
                spriteLoadFailed: bundle.getText("spriteLoadFailed") ?? "Game sprites could not be loaded."
            };
            this.gameEngine?.setDisplayTexts(displayTexts);
        })().catch(this.handleGameError);
    }

    private runGameAction(action: () => void): void {
        try {
            action();
        } catch (error) {
            this.handleGameError(error);
        }
    }

    private requireGameEngine(): GameEngine {
        if (!this.gameEngine) {
            throw new Error("The game has not been initialized.");
        }
        return this.gameEngine;
    }
}
