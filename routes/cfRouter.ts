import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { Option } from "fp-ts/lib/Option";
import { computeCF } from "../models/codfisc";
import { Identity } from "../types/identity";

export const cfRouter = express.Router();

const replyError = (res: Response, error: Error) => {
    return res.render("pages/index", {
        errorMessages: error.message, codFiscale: undefined
    });
}

const replyCF = (res: Response, cf: string) => {
    return res.render("pages/index", {
        errorMessages: undefined, codFiscale: cf
    });
}

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
    // computeCF(identity).then(cfOption => {
    //     switch(cfOption._tag) {
    //         case "None": {
    //             return res.render("pages/index", {
    //                 errorMessages: undefined, codFiscale: undefined
    //             });
    //         }
    //         case "Some": {
    //             return res.render("pages/index", {
    //                 errorMessages: undefined, codFiscale: cfOption.value.codFiscale.toUpperCase()
    //             });
    //         }
    //     }
    // }); // todo: catch

    // TODO: refactor with Option<Identity>


    computeCF(identity).then(cf => {
        res.render("pages/index", {
            errorMessages: undefined, codFiscale: cf.codFiscale.toUpperCase()
        });
    })
});