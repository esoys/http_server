import type { Request, Response, NextFunction } from "express";
import { respondWithJSON } from "./json.js";

export async function handlerChirpsValidate(req: Request, res: Response) {
    const parsedBody = req.body["body"];

    if (parsedBody.length > 140) {
        throw new Error("Chirp is too long");
    }

    const profane = ["kerfuffle", "sharbert", "fornax"];
    let splitBody = parsedBody.split(" ");
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

    respondWithJSON(res, 200, {
        cleanBody: cleanBody,
    });
}
