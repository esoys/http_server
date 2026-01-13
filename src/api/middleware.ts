import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
    }
}


export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode < 200 || statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    })
    next();
}

export function middlewareMetricInc(req: Request, res: Response, next: NextFunction) {
    config.api.fileServerHits++;
    next();
}

export function errorMiddleware(err: Error, _: Request, res: Response, __: NextFunction) {
    let statusCode = 0;
    let message: string; 

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
