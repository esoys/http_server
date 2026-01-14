import { createUser } from "../db/queries/users.js";
import { respondWithJSON, respondWithError } from "./json.js";
import type { Request, Response } from "express";

export async function handlerCreateNewUser(req: Request, res: Response) {
    console.log("DEBUG req body: ", req.body);
    const email = req.body.email; 
    if (!email) {
        throw new Error("Need email to continue");
    }
    const newUer = await createUser({ "email": email });
    console.log("DEBUG NEW USER", newUer);
    res.status(201).send(JSON.stringify(newUer));
}

