import { Identity } from "../types/identity";
import { Either, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { IError } from "../types/error";

const getBirthYear = (identity: Identity): Identity => {
    const year: number = Number(identity.codFiscale.slice(6, 8));
    const currentYear: number = new Date().getFullYear() % 100;

    // Se l'anno di nascita >= anno corrente, anteponi '19' al risultato
    // Altrimenti antiponi '00' al risultato
    if(year > currentYear)
        identity.birthYear = `19${year}`;
    else
        identity.birthYear = `20${year}`;


    return identity;
}

export const reverseCF = (identity: Identity): Either<IError, Identity> => {
    if(identity.codFiscale.length != 16) {
        const error: IError = {
            code: 400,
            msg: "Codice fiscale invalido"
        };
        return left(error);
    }


    const result: Identity = pipe(
        identity,
        getBirthYear
    );


    return right(result);
}
