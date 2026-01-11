import express from "express";
import { config } from "./config.js";
const app = express();
const PORT = 8080;
app.use(middlewareLogResponses);
app.use("/metrics", middlewareWriteNumReq);
app.use("/reset", middlewareMetricReset);
app.use("/app", middlewareMetricInc, express.static("./src/app"));
app.get("/healthz", (req, res) => {
    res.set({
        "Content-Type": "text/plain; charset=utf-8",
    });
    res.status(200).send("OK");
});
app.listen(PORT, () => {
    console.log(`Server on: http://localhost:${PORT}`);
});
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
function middlewareWriteNumReq(req, res, next) {
    res.status(200).send(`Hits: ${config.fileserverHits}`);
    next();
}
function middlewareMetricReset(req, res, next) {
    config.fileserverHits = 0;
    res.status(200).send("Config has been reseted");
    next();
}
