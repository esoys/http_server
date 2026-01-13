import { createUser } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import type { Request, Response } from "express";

export function handlerCreateNewUser(req: Request, res: Response) {
    console.log("DEBUG req body: ", req.body);
//    const userMail = req.body
//    const newUer = await createUser()
}

