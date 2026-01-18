import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT, hashPassword, checkPasswordHash } from "../src/db/auth.ts";


describe("Password Hashing", () => {
    const password1 = "correctPasword123!";
    const password2 = "anotherPassword456!";

    let hash1: string;
    let hash2: string;

    beforeAll(async () => {
        hash1 = await hashPassword(password1);
        hash2 = await hashPassword(password2);
    });

    it("should return true for the correct password", async () => {
        const result = await checkPasswordHash(password1, hash1);
        expect(result).toBe(true);
    });

    it("should return true for the correct password", async () => {
        const result = await checkPasswordHash(password2, hash2);
        expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
        const result = await checkPasswordHash(password1, hash2);
        expect(result).toBe(false);
    });

    it("should return false for incorrect password", async () => {
        const result = await checkPasswordHash(password2, hash1);
        expect(result).toBe(false);
    });

})
