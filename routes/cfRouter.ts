import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { computeCF } from "../models/codFisc";
import { Identity } from "../types/identity";
import { IError } from "../types/error";

export const cfRouter = express.Router();

cfRouter.get("/", (_: Request, res: Response) => {
    res.render("pages/index", { 
        errorMessages: undefined, codFiscale: undefined 
    });
});

cfRouter.post("/",
[
    check("surname")
        .not()
        .isEmpty()
        .withMessage("Inserire il cognome"),    
    check("name")
        .not()
        .isEmpty()
        .withMessage("Inserire il nome"),
    check("sex")
        .not()
        .isEmpty()
        .withMessage("Specificare il sesso"),
    check("birthPlace")
        .not()
        .isEmpty()
        .withMessage("Inserire il luogo di nascita"),
    check("birthDay")
        .not()
        .isEmpty()
        .withMessage("Inserire il giorno di nascita"),
    check("birthMonth")
        .not()
        .isEmpty()
        .withMessage("Inserire il mese di nascita"),
    check("birthYear")
        .not()
        .isEmpty()
        .withMessage("Inserire l'anno di nascita"),
],
(req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.render("pages/index", { 
            errorMessages: errors.array(), codFiscale: undefined
        });
    }

    const identity: Identity = req.body;
    identity.codFiscale = "";
    computeCF(identity).then(cfOption => {
        switch(cfOption._tag) {
            case "Left": {
                res.render("pages/index", {
                    errorMessages: [cfOption.left], codFiscale: undefined
                });
                break;
            }
            case "Right": {
                res.render("pages/index", {
                    errorMessages: undefined, codFiscale: cfOption.right
                });
                break;
            }
        }
    });
});