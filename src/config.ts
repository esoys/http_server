import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

type Config = {
    api: APIConfig,
    db: DBConfig,
};

type APIConfig = {
    fileServerHits: number;
    port: number;
    platform: string;
};

type DBConfig = {
    migrationConfig: MigrationConfig;
    url: string;
};

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
    api: {
        fileServerHits: 0,
        port: Number(envOrThrow("PORT")),
        platform: envOrThrow("PLATFORM"),
    },
    db: {
        migrationConfig: migrationConfig,
        url: envOrThrow("DB_URL"),
    },
};


function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Env variable ${key} not present`);
    }
    return value;
}

function checkPlatform() {
    const value = process.env["PLATFORM"];
    if (value !== "dev") {
        throw new Error("Unauthorized"); 
    }
}
