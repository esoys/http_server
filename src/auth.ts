import { db } from "./db/index.js";
import crypto from "crypto";
import type { Request } from "express"; 
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { refreshTokens } from "./db/schema.js";
import type { NewRefreshToken } from "./db/schema.js";
import { eq } from "drizzle-orm";


export async function hashPassword(password: string): Promise<string> {
    try {
        return await argon2.hash(password);
    } catch {
        throw new Error(`password hash failed`);
    }
};


export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch {
        throw new Error(`password verification failed`);
    }
};


type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

const TOKEN_ISSUER = "chirpy";

export function makeJWT(userID: string, secret: string): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + 3600;
    return jwt.sign({
        iss: TOKEN_ISSUER,
        sub: userID,
        iat: issuedAt,
        exp: expiresAt,
    }, secret);
}


export function validateJWT(tokenString: string, secret: string): string {
    let decoded: payload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch {
        throw new Error("invalid token");
    }

    if (decoded.iss !== TOKEN_ISSUER) {
        throw new Error("Invalid issuer");
    }

    if (!decoded.sub || typeof decoded.sub !== "string") {
        throw new Error("No user ID in token");
    }

    return decoded.sub;

}


export function getBearerToken(req: Request): string {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new Error("Authorize header missing");
    }

    if (!authHeader.startsWith("Bearer ")) {
        throw new Error("Invalid Authorization header format");
    }

    const token = authHeader.slice("Bearer ".length).trim();
    
    if (!token) {
        throw new Error("missing header");
    }
    return token;
}


export async function makeRefreshToken(userId: string) {
    const newRefreshToken = crypto.randomBytes(32).toString("hex");
    
    const [result] = await db
        .insert(refreshTokens)
        .values({
            "token": newRefreshToken,
            "userId": userId,
        })
        .onConflictDoNothing()
        .returning();

    console.log("DEBUG MAKE REFRESH", result);
    return result;
}


export async function getRefreshToken(refreshToken: string) {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    return result;
}


export async function getUserFromRefreshToken(refreshToken: string) {
    const dbRefreshToken = await getRefreshToken(refreshToken);
    return dbRefreshToken.userId;
}


export async function updateRefreshToken(req: Request) {
    const token = getBearerToken(req);
    const revokedToken = await db.update(refreshTokens)
        .set({
            revokedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(refreshTokens.token, token))
        .returning();
}
