import { config } from "../config.js";
import { respondWithError } from "./json.js";
export function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode < 200 || statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });
    next();
}
export function middlewareMetricInc(req, res, next) {
    config.fileServerHits++;
    next();
}
export function errorMiddleware(err, _, res, __) {
    let statusCode = 500;
    let message = "Something went wrong on our end";
    console.log(err.message);
    respondWithError(res, statusCode, message);
}
