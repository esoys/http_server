import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { resetUsers } from"../db/queries/users.js";


export async function handlerReset(req: Request, res: Response) {
    config.api.fileServerHits = 0;
    await resetUsers();
    res.write("Config has been reset");
    res.end();
}
