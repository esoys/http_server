import crypto from "crypto";
import { db } from "../index.js";
import { eq } from "drizzle-orm";
import { refreshTokens } from "../schema.js"
import { getBearerToken } from "../../auth.js";
import type { Request } from "express";


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
