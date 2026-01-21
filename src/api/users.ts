import { createUser, getUserByEmail, upgradeUserToRed, updateUser } from "../db/queries/users.js";
import { respondWithJSON, respondWithError } from "./json.js";
import type { Request, Response } from "express";
import { getBearerToken, hashPassword, checkPasswordHash, makeJWT, validateJWT, getAPIKey } from "../auth.js";
import { makeRefreshToken } from "../db/queries/auth.js";
import type { NewUser } from "../db/schema.js";
import { config } from "../config.js";


export async function handlerUpgradeUserToRed(req: Request, res: Response) {
    if (req.body.event !== "user.upgraded") {
        respondWithJSON(res, 204, {});
        return;
    } else {
        const apiKey = getAPIKey(req);
        console.log("DEBUG api key ", apiKey); 
        console.log("ENV API ", config.api.polkaAPIKey);
        if (apiKey !== config.api.polkaAPIKey) {
            respondWithError(res, 401, "Wrong api key");
            return;
        }
        const upgradedUser = await upgradeUserToRed(req.body.data.userId);

        if (!upgradedUser) {
            respondWithError(res, 404, "User not found");
            return;
        }

        respondWithJSON(res, 204, {});
    }
}


export async function handlerUpdateUser(req: Request, res: Response) {
    let userId;

    try {
        const bearerToken = getBearerToken(req);
        userId = validateJWT(bearerToken, config.secret); 
    } catch (err) {
        respondWithError(res, 401, `Authentification failed: ${err}`);
        return;
    }
    
    const newPassword = await hashPassword(req.body.password);
    const newEmail = req.body.email;
    const updatedUser = await updateUser(userId, newEmail, newPassword);
    const publicUser = toPublicUser(updatedUser);

    respondWithJSON(res, 200, publicUser);
}


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
        return;
    }
    
    const token = makeJWT(user.id, config.secret); 
    const publicUser = toPublicUser(user);
    const newRefreshToken = await makeRefreshToken(user.id);

    respondWithJSON(res, 200, {
        id: publicUser.id,
        createdAt: publicUser.createdAt,
        updatedAt: publicUser.updatedAt,
        email: publicUser.email,
        token: token,
        refreshToken: newRefreshToken.token,
        isChirpyRed: publicUser.isChirpyRed,
    });
} 

type PublicUser = Omit<NewUser, "hashedPassword">;

function toPublicUser(user: NewUser): PublicUser {
    return {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        isChirpyRed: user.isChirpyRed,
    };
}
