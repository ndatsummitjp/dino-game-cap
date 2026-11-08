## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Sun Nov 08 2026 00:46:32 GMT+0900 (Japan Standard Time)|
|**App Generator**<br>SAP Fiori Application Generator|
|**App Generator Version**<br>1.24.0|
|**Generation Platform**<br>Visual Studio Code|
|**Template Used**<br>Basic V4|
|**Service Type**<br>Local CAP|
|**Service URL**<br>http://localhost:4004/odata/v4/dino/|
|**Module Name**<br>game|
|**Application Title**<br>Game|
|**Namespace**<br>|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.154.0|
|**Enable TypeScript**<br>True|
|**Add Eslint configuration**<br>True, see https://www.npmjs.com/package/@sap-ux/eslint-plugin-fiori-tools#rules for the eslint rules.|

## game

Game page

### Starting the generated app

-   This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite.  To launch the generated app, start your CAP project:  and navigate to the following location in your browser:

http://localhost:4004/game/index.html

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)

### Game logic structure

The game logic is split by responsibility under `webapp/logic`:

- `GameEngine.ts` coordinates the game lifecycle and animation loop.
- `GameState.ts` owns score, speed, game status, and active obstacles.
- `Dinosaur.ts` handles player movement, collision detection, and sprite selection.
- `GameRenderer.ts` draws the game scene and score.
- `CanvasSurface.ts`, `SpriteBank.ts`, and `GameInput.ts` manage the canvas, sprite assets, and keyboard input.
- `gameTypes.ts` contains shared game and rendering types.
