import express from "express";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";


export async function handlerReadiness(req: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("OK");
}
