import express, { Request, Response } from "express";
import path from "path";

export const cfRouter = express.Router();

cfRouter.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname + "/../frontend/index.html"));
});