import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { Either } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { getCF } from "../models/codfisc";
import { reverseCF } from "../models/reverse";
import { IError } from "../types/error";
import { Identity } from "../types/identity";

export const cfRouter = express.Router();

const match = <E, R, A>(onLeft: (left: E) => R, onRight: (right: A) => R) => (fa: Either<E, A>): R => {
    switch(fa._tag) {
        case "Left": return onLeft(fa.left);
        case "Right": return onRight(fa.right);
    }
}

cfRouter.get("/", (_: Request, res: Response) => {
    res.render("pages/index", { 
        errorMessages: undefined
    });
});

cfRouter.get("/reverse", (_: Request, res: Response) => {
    res.render("pages/reverse", {
        errorMessages: undefined
    });
});

cfRouter.post("/reverse",
[
    check("codFiscale")
        .not()
        .isEmpty()
        .withMessage("Inserisci il codice fiscale")
],
(req: Request, res: Response) => {
    const errors = validationResult(req);
    const identity: Identity = req.body;

    if(!errors.isEmpty()) {
        return res.render("pages/reverse", {
            errorMessages: errors.array()
        });
    }

    // Rimuovi eventuali spazi bianchi dalla stringa
    identity.codFiscale = identity.codFiscale.trim();

    const resOpt: Either<IError, Identity> =  reverseCF(identity);
    pipe(
        resOpt,
        match(
            (error: IError): void => {
                res.render("pages/reverse", {
                    errorMessages: [error]
                });
            },
            (identity: Identity): void => {
                res.render("pages/result", {
                    identity: identity,
                    reverse: true,
                });
            }
        )
    );
});

cfRouter.get("/about", (_: Request, res: Response) => {
    res.render("pages/about");
})

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
    const normalizeField = (s: string): string => {
        return s.trim().slice(0, 1).toUpperCase() +
               s.trim().split(/\s/).join('').slice(1).toLowerCase();
    }

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.render("pages/index", { 
            errorMessages: errors.array()
        });
    }

    const identity: Identity = req.body;
    identity.codFiscale = "";
    // Normalizza i campi dell'identita'
    identity.name = normalizeField(identity.name);
    identity.surname = normalizeField(identity.surname);
    identity.birthPlace = normalizeField(identity.birthPlace);

    getCF(identity).then(cfOption => {
        pipe(
            cfOption,
            match(
                (error: IError): void => {
                    res.render("pages/index", {
                        errorMessages: [error]
                    });
                },
                (identity: Identity): void => {
                    res.render("pages/result", {
                        identity: identity,
                        reverse: undefined
                    });    
                }
            )
        )
    });
});
