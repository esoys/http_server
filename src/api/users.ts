import { createUser } from "../db/queries/users.js";
import { respondWithJSON, respondWithError } from "./json.js";
import type { Request, Response } from "express";

export async function handlerCreateNewUser(req: Request, res: Response) {
    const email = req.body.email; 
    if (!email) {
        throw new Error("Need email to continue");
    }
    const newUer = await createUser({ "email": email });
    res.status(201).send(JSON.stringify(newUer));
}

