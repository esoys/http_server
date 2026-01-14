process.loadEnvFile();
const migrationConfig = {
    migrationsFolder: "./src/db/migrations",
};
export const config = {
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
function envOrThrow(key) {
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
