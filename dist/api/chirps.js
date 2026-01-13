import { BadRequestError } from "./middleware.js";
import { respondWithJSON } from "./json.js";
export async function handlerChirpsValidate(req, res) {
    const parsedBody = req.body["body"];
    if (parsedBody.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
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
