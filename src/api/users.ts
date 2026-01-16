import { createUser, getUserByEmail } from "../db/queries/users.js";
import { respondWithJSON, respondWithError } from "./json.js";
import type { Request, Response } from "express";
import { hashPassword, checkPasswordHash } from "../db/auth.js";
import type { NewUser } from "../db/schema.js";


export async function handlerCreateNewUser(req: Request, res: Response) {
    const email = req.body.email; 
    const password = req.body.password;
    const hashedPassword = await hashPassword(password);
    if (!email || !password) {
        throw new Error("Need email and password to continue");
    }
    const newUser = await createUser({
        "email": email,
        "hashedPassword": hashedPassword, 
    });
    res.status(201).send(JSON.stringify(toPublicUser(newUser)));
}


export async function handlerLogin(req: Request, res: Response) {
    const user = await getUserByEmail(req.body.email);
    const passwordCorrect = await checkPasswordHash(req.body.password, user.hashedPassword);
    if (!user || !passwordCorrect) {
        respondWithError(res, 401, "Incorrect email or password");
    }
    respondWithJSON(res, 200, toPublicUser(user));
} 

type PublicUser = Omit<NewUser, "hashedPassword">;

function toPublicUser(user: NewUser): PublicUser {
    return {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
    };
}
