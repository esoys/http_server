import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "./middleware.js";
import { respondWithJSON } from "./json.js";
import { createChirp, getAllChirps, getChirpById } from "../db/queries/chirps.js";
import { config } from "../config.js";
import { getBearerToken, validateJWT } from "../db/auth.js";


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
    const bearerToken = getBearerToken(req);
    const userId = validateJWT(bearerToken, config.secret); 

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
    console.log("PARAMS", chirpId, typeof chirpId);
    const result = await getChirpById(chirpId);

    respondWithJSON(res, 200, result);
}
