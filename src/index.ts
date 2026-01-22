import express from "express";
import type { Request, Response, NextFunction } from "express";
import { config } from "./config.js";
import { middlewareMetricInc, middlewareLogResponses, errorMiddleware } from "./api/middleware.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerPostChirp, handlerGetAllChirps, handlerGetChirpById, handlerDeleteChirp } from "./api/chirps.js";
import { handlerCreateNewUser, handlerLogin, handlerUpdateUser, handlerUpgradeUserToRed } from "./api/users.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { handlerRefreshToken, handlerRevokeRefreshToken } from "./api/refreshToken.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);


const app = express();

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
});

app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerMetrics(req, res)).catch(next);
});

app.get("/api/chirps{/:authorId}{/:sort}", (req, res, next) => {
    Promise.resolve(handlerGetAllChirps(req, res)).catch(next);
});

app.get("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(handlerGetChirpById(req, res)).catch(next);
});

app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res)).catch(next);
});

app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerPostChirp(req, res)).catch(next);
});

app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerCreateNewUser(req, res)).catch(next);
});

app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerLogin(req, res)).catch(next);
});

app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handlerRefreshToken(req, res)).catch(next);
});

app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handlerRevokeRefreshToken(req, res)).catch(next);
});

app.post("/api/polka/webhooks", (req, res, next) => {
    Promise.resolve(handlerUpgradeUserToRed(req, res)).catch(next);
});

app.put("/api/users", (req, res, next) => {
    Promise.resolve(handlerUpdateUser(req, res)).catch(next);
});

app.delete("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(handlerDeleteChirp(req, res)).catch(next);
});

app.use(errorMiddleware);


app.listen(config.api.port, () => {
    console.log(`Server on: http://localhost:${config.api.port}`);
});
