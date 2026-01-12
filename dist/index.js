import express from "express";
import { handlerChirpsValidate } from "./api/chirps.js";
import { config } from "./config.js";
const app = express();
const PORT = 8080;
app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricInc, express.static("./src/app"));
app.get("/api/healthz", (req, res) => {
    res.set({
        "Content-Type": "text/plain; charset=utf-8",
    });
    res.status(200).send("OK");
});
app.get("/admin/metrics", (req, res) => {
    const num = config.fileserverHits;
    const html = `<html><body><h1>Welcome, Chirpy Admin</h1><p>Chirpy has been visited ${num} times!</p></body></html>`;
    res.set({
        "Content-Type": "text/html; charset=utf-8",
    });
    res.status(200).send(html);
});
app.post("/admin/reset", (req, res) => {
    config.fileserverHits = 0;
    res.status(200).send("Config has been reset");
});
app.post("/api/validate_chirp", async (req, res, next) => {
    try {
        await handlerChirpsValidate(req, res);
    }
    catch (err) {
        next(err);
    }
});
app.listen(PORT, () => {
    console.log(`Server on: http://localhost:${PORT}`);
});
// error route muss als letztes kommen!
app.use(errorHandler);
function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode < 200 || statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });
    next();
}
function middlewareMetricInc(req, res, next) {
    config.fileserverHits++;
    next();
}
function errorHandler(err, req, res, next) {
    console.log(err);
    res.status(500).json({
        error: "Something went wrong on our end"
    });
}
