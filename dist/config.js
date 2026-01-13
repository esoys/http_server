process.loadEnvFile();
const migrationConfig = {
    migrationsFolder: "./db/out",
};
export const config = {
    api: {
        fileServerHits: 0,
        port: Number(envOrThrow("PORT")),
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
