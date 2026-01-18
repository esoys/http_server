import type { Request } from "express"; 
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";


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

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;
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
