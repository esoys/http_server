import { config } from "../config.js"
import type { Request, Response } from "express";
import { getBearerToken, updateRefreshToken, makeJWT, getRefreshToken, getUserFromRefreshToken } from "../auth.js";
import { respondWithJSON, respondWithError } from "./json.js";


export async function handlerRefreshToken(req: Request, res: Response) {
    const token = getBearerToken(req); 
    
    if (!token) {
        throw new Error("missing header");
    }

    const dbToken = await getRefreshToken(token);

    if (!dbToken || dbToken.revokedAt !== null || dbToken.expiresAt < new Date()) {
        respondWithError(res, 401, "token not found or invalid");
        return;
    } 

    const userID = await getUserFromRefreshToken(token);
    const newAccessToken = makeJWT(userID, config.secret); 

    respondWithJSON(res, 200, {
        "token": newAccessToken, 
    });
} 

export async function handlerRevokeRefreshToken(req: Request, res: Response) {
    await updateRefreshToken(req);

    respondWithJSON(res, 204, {})
}
