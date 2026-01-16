import argon2 from "argon2";


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
}
