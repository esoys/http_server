import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";


export async function handlerReset(req: Request, res: Response) {
    config.api.fileServerHits = 0;
    res.write("Config has been reset");
    res.end();
}
