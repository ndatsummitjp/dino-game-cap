# Getting Started

[日本語](./readme.ja.md)

Welcome to your new CAP project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`readme.md` | this getting started guide

## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start with your domain model, in a CDS file in `db/`

Node.js 24 or newer is required to run the CAP TypeScript service implementation.

## Build the UI

Run `npm run build:ui` from the project root to build the UI5 apps. The build output is written to `gen/srv/app/`, which CAP serves automatically.

Run `npm run build:cds` to compile the local CAP service for production. The generated Node.js service is written to `gen/srv/`.

## Run with Docker and PostgreSQL

Run `docker compose up --build` (or `npm run docker:up`) to build the production image and start the app with PostgreSQL. The CAP landing page is available at <http://localhost:4004>, and the game UI is at <http://localhost:4004/game/>. Compose enables CAP's service index and uses mock authentication for local use; configure real authentication before exposing it beyond your development machine.

The runtime image contains only the generated `gen/srv` service and `gen/pg` database deployment artifacts, along with their production dependencies. Source files and build tools are left in the build stage. The generated PostgreSQL deployment runs before the service starts.

The Compose file uses `dino` as the default database, user, and password for local development. Set `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` in the environment to override them. The database is persisted in the `postgres-data` volume. Run `docker compose down` (or `npm run docker:down`) to stop the stack without removing the data.

## Upload character images

On a character's object page, choose **Upload Images** to select multiple image files. Supported filenames match the target field: `idle_image`, `run_1_image`, `run_2_image`, `jump_image`, or `crash_image`, followed by `.png`, `.jpg`, `.jpeg`, `.gif`, or `.webp`. For example, `idle_image.png` updates the `idle_image` field. Files with unknown field names are ignored; at least one supported filename is required. Supported files must be 10 MiB or smaller, and their content signature must match the extension. Images uploaded while editing a draft are saved to that draft and become active when the draft is activated. The UI sends selected files together to `/odata/v4/dino/uploadCharacterImages` in its `images` parameter. Each item contains the character `id`, `IsActiveEntity` state, `fileName`, and base64-encoded `content`; repeated supported fields for the same character and state are rejected.

## Learn More

Learn more at <https://cap.cloud.sap>.
