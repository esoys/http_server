import { config } from "../config.js";
import { respondWithError } from "./json.js";
export class BadRequestError extends Error {
    constructor(message) {
        super(message);
    }
}
export class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
    }
}
export class ForbiddenError extends Error {
    constructor(message) {
        super(message);
    }
}
export class NotFoundError extends Error {
    constructor(message) {
        super(message);
    }
}
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
    config.api.fileServerHits++;
    next();
}
export function errorMiddleware(err, _, res, __) {
    let statusCode = 0;
    let message;
    switch (err.constructor) {
        case BadRequestError:
            statusCode = 400;
            break;
        case UnauthorizedError:
            statusCode = 401;
            break;
        case ForbiddenError:
            statusCode = 403;
            break;
        case NotFoundError:
            statusCode = 404;
            break;
    }
    console.log(err.message);
    respondWithError(res, statusCode, err.message);
}
