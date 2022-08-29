import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { Either } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { computeCF } from "../models/codFisc";
import { IError } from "../types/error";
import { Identity } from "../types/identity";

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
    const match = <E, R, A>(onLeft: (left: E) => R, onRight: (right: A) => R) => (fa: Either<E, A>): R => {
        switch(fa._tag) {
            case "Left": return onLeft(fa.left);
            case "Right": return onRight(fa.right);
        }
    }

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.render("pages/index", { 
            errorMessages: errors.array(), codFiscale: undefined
        });
    }

    const identity: Identity = req.body;
    identity.codFiscale = "";
    computeCF(identity).then(cfOption => {
        pipe(
            cfOption,
            match(
                (error: IError) => {
                    res.render("pages/index", {
                        errorMessages: [error], codFiscale: undefined
                    });
                },
                (cf: string) => {
                    res.render("pages/index", {
                        errorMessages: undefined, codFiscale: cf
                    });    
                }
            )
        )
    });
});