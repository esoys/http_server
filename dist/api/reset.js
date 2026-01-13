import { config } from "../config.js";
export async function handlerReset(req, res) {
    config.api.fileServerHits = 0;
    res.write("Config has been reset");
    res.end();
}
