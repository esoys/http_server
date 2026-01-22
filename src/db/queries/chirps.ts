import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { asc, eq, and, desc } from "drizzle-orm";


export async function deleteChirp(chirpID: string) {
    const [deletedChirp] = await db
        .delete(chirps)
        .where(eq(chirps.id, chirpID))
        .returning();

    return deletedChirp;
}


export async function createChirp(chirp: NewChirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return result;
}


export async function resetChirps() {
    await db.delete(chirps);
}


export async function getAllChirps(sortingQuery: string) {
    let result;
    switch (sortingQuery) {
        case "desc":
            result = await db.select().from(chirps).orderBy(desc(chirps.createdAt));
            break;
        default:
            result = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
            break;
    }
    return result;
}


export async function getAuthorsChirps(authorId: string, sortingQuery: string) {
    let result;
    switch (sortingQuery) {
        case "desc":
            result = await db.select().from(chirps).where(eq(chirps.userId, authorId)).orderBy(desc(chirps.createdAt));
            break;
        default:
            result = await db.select().from(chirps).where(eq(chirps.userId, authorId)).orderBy(asc(chirps.createdAt));
            break;
    }
    return result;
}

export async function getChirpById(chirpId: string) {
    const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
    return result;
} 
