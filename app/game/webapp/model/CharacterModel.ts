import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ODataContext from "sap/ui/model/odata/v4/Context";
import type { CharacterSpriteName, CharacterSpriteUrls } from "game/logic/gameTypes";

export type CharacterOption = {
    id: string;
    name: string;
    idleImageUrl: string;
    spriteUrls: CharacterSpriteUrls;
};

export default class CharacterModel extends JSONModel {
    private static readonly IMAGE_FIELDS: { sprite: CharacterSpriteName; field: string; mediaType: string }[] = [
        { sprite: "dinoIdle", field: "idle_image", mediaType: "idle_image_mediaType" },
        { sprite: "dinoRun1", field: "run_1_image", mediaType: "run_1_image_mediaType" },
        { sprite: "dinoRun2", field: "run_2_image", mediaType: "run_2_image_mediaType" },
        { sprite: "dinoJump", field: "jump_image", mediaType: "jump_image_mediaType" },
        { sprite: "dinoCrash", field: "crash_image", mediaType: "crash_image_mediaType" }
    ];
    private static readonly MEDIA_TYPE_FIELDS = CharacterModel.IMAGE_FIELDS.map(({ mediaType }) => mediaType);

    private characterOptions: CharacterOption[] = [];
    private readonly defaultCharacter: CharacterOption;
    private selectedCharacter: CharacterOption;

    public constructor(defaultCharacterName: string) {
        const defaultCharacter: CharacterOption = {
            id: "",
            name: defaultCharacterName,
            idleImageUrl: sap.ui.require.toUrl("game/assets/sprites/idle_image.png"),
            spriteUrls: {}
        };
        super({
            characters: [defaultCharacter],
            selectedCharacterId: defaultCharacter.id,
            selectedCharacterName: defaultCharacter.name,
            selectedCharacterIdleImageUrl: defaultCharacter.idleImageUrl
        });
        this.defaultCharacter = defaultCharacter;
        this.selectedCharacter = defaultCharacter;
    }

    public setDefaultCharacterName(name: string): void {
        this.defaultCharacter.name = name;
        if (this.selectedCharacter === this.defaultCharacter) {
            this.setProperty("/selectedCharacterName", name);
        }
        this.setProperty("/characters/0/name", name);
    }

    public getSelectedSpriteUrls(): CharacterSpriteUrls {
        return this.selectedCharacter.spriteUrls;
    }

    public selectCharacter(id: string): CharacterOption {
        const selectedCharacter = this.characterOptions.find((character) => character.id === id)
            ?? this.defaultCharacter;
        this.selectedCharacter = selectedCharacter;
        this.setProperty("/selectedCharacterId", selectedCharacter.id);
        this.setProperty("/selectedCharacterName", selectedCharacter.name);
        this.setProperty("/selectedCharacterIdleImageUrl", selectedCharacter.idleImageUrl);
        return selectedCharacter;
    }

    public async loadCharacters(model: ODataModel): Promise<void> {
        const binding = model.bindList("/Characters", undefined, undefined, undefined, {
            $select: ["id", "name", ...CharacterModel.MEDIA_TYPE_FIELDS].join(",")
        });
        try {
            const contexts = await binding.requestContexts(0, Infinity);
            const serviceUrl = new URL(model.getServiceUrl(), window.location.href);
            this.characterOptions = contexts.flatMap((context: ODataContext) => {
                const id: unknown = context.getProperty("id");
                const name: unknown = context.getProperty("name");
                if (typeof id !== "string" || typeof name !== "string") {
                    return [];
                }

                const entityPath = context.getPath().replace(/^\/+/, "");
                const spriteUrls: CharacterSpriteUrls = {};
                for (const { sprite, field, mediaType } of CharacterModel.IMAGE_FIELDS) {
                    if (CharacterModel.isImageMediaType(context.getProperty(mediaType))) {
                        spriteUrls[sprite] = new URL(`${entityPath}/${field}/$value`, serviceUrl).toString();
                    }
                }
                return [{
                    id,
                    name,
                    idleImageUrl: spriteUrls.dinoIdle ?? "",
                    spriteUrls
                }];
            });
            this.setProperty("/characters", [this.defaultCharacter, ...this.characterOptions]);
        } finally {
            binding.destroy();
        }
    }

    private static isImageMediaType(value: unknown): value is string {
        return typeof value === "string" && value.startsWith("image/");
    }
}
