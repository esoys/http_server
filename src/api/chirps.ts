import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "./middleware.js";
import { respondWithJSON } from "./json.js";
import { createChirp } from "../db/queries/chirps.js";


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
    console.log("DEBUG CHIRP DATA", data);
    const newChirp = await createChirp({
        body: chirpsValidate(data.body),
        userId: data.userId,
    });

    respondWithJSON(res, 201, newChirp);


    console.log("DEBUG NEW CHIRP", newChirp);
};
