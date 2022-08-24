import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";

export const cfRouter = express.Router();

cfRouter.get("/", (req: Request, res: Response) => {
    res.render("pages/index", { 
        errorMessages: undefined, codFiscale: undefined 
    });
});

cfRouter.post("/",
[
    check("cognome")
        .not()
        .isEmpty()
        .withMessage("Inserire il cognome"),    
    check("nome")
        .not()
        .isEmpty()
        .withMessage("Inserire il nome"),
    check("sesso")
        .not()
        .isEmpty()
        .withMessage("Specificare il sesso"),
    check("luogonascita")
        .not()
        .isEmpty()
        .withMessage("Inserire il luogo di nascita"),
    check("provincia")
        .not()
        .isEmpty()
        .withMessage("Inserire la provincia"),
    check("giornonascita")
        .not()
        .isEmpty()
        .withMessage("Inserire il giorno di nascita"),
    check("mesenascita")
        .not()
        .isEmpty()
        .withMessage("Inserire il mese di nascita"),
    check("annonascita")
        .not()
        .isEmpty()
        .withMessage("Inserire l'anno di nascita"),
],
(req: Request, res: Response) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        res.render("pages/index", { 
            errorMessages: errors.array(), codFiscale: undefined
        });
    }

    res.render("pages/index", {
        errorMessages: undefined, codFiscale: "Hello World"
    });
});