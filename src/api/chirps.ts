import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "./middleware.js";
import { respondWithJSON, respondWithError } from "./json.js";
import { createChirp, getAllChirps, getChirpById, deleteChirp } from "../db/queries/chirps.js";
import { config } from "../config.js";
import { getBearerToken, validateJWT } from "../auth.js";


export async function handlerDeleteChirp(req: Request, res: Response) {
    let userId;

    try {
        const bearerToken = getBearerToken(req);
        userId = validateJWT(bearerToken, config.secret);
    } catch (err) {
        respondWithError(res, 401, `Authentification failed: ${err}`);
        return;
    }
    
    const chirpID = String(req.params.chirpID);
    const chirpToDelete = await getChirpById(chirpID);

    if (!chirpToDelete) {
        respondWithError(res, 404, "Chirp not found");
        return;
    }

    if (chirpToDelete.userId !== userId) {
        respondWithError(res, 403, `Authentification failed: Your not the owner of the chirp`);
        return;
    } else {
        const deletedChirp = await deleteChirp(chirpID);
        respondWithJSON(res, 204, {});
    }
}


export function chirpsValidate(data: string) {
    if (data.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const profane = ["kerfuffle", "sharbert", "fornax"];
    let splitBody = data.split(" ");
    let i = 0;

    for (const word of profane) {
        i = 0;
        for (const bodyWord of splitBody) {
            if (bodyWord.toLowerCase() === word) {
                splitBody[i] = "****";
            }
            i++;
        }
    }

    const cleanBody = splitBody.join(" ");

    return cleanBody;
};


export async function handlerPostChirp(req: Request, res: Response) {
    const data = req.body;
    let userId;

    try {
        const bearerToken = getBearerToken(req);
        userId = validateJWT(bearerToken, config.secret); 
    } catch (err) {
        respondWithError(res, 401, `Authentification failed: ${err}`);
        return;
    }
        const newChirp = await createChirp({
        body: chirpsValidate(data.body),
        userId: userId,
    });

    respondWithJSON(res, 201, newChirp);
};


export async function handlerGetAllChirps(req: Request, res: Response) {
    const result = await getAllChirps();
    respondWithJSON(res, 200, result);
}; 


export async function handlerGetChirpById(req: Request, res: Response) {
    const chirpId = String(req.params.chirpID);
    const result = await getChirpById(chirpId);

    if (!result) {
        respondWithError(res, 404, "Chirp not found");
        return;
    }
    respondWithJSON(res, 200, result);
}
