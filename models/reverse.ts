import { Identity } from "../types/identity";
import { Either, left, right } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { IError } from "../types/error";

const getSurname = (identity: Identity): Identity => {
    const surname: string = identity.codFiscale.slice(0, 3);

    identity.surname = surname;

    return identity;
}

const getName = (identity: Identity): Identity => {
    const name: string = identity.codFiscale.slice(3, 6);

    identity.name = name;

    return identity;
}

const getBirthYear = (identity: Identity): Identity => {
    const birthYear: string = identity.codFiscale.slice(6, 8);
    const currentYear: number = new Date().getFullYear();


    // Se le cifre dell'anno sono maggiori dell'anno corrente,
    // allora anteponi '19' nell'anno di nascita.
    // ALtrimenti anteponi '20'
    if(Number(`20${birthYear}`) > currentYear)
        identity.birthYear = `19${birthYear}`;
    else
        identity.birthYear = `20${birthYear}`;


    return identity;
}

const getBirthMonth = (identity: Identity): Identity => {
    type monthT = {
        [value: string]: number;
    }
    // Mappa ciascun valore al mese corrispondente
    const monthMap: monthT = {
        "A": 1, // Gennaio
        "B": 2, // Febbraio
        "C": 3, // Marzo
        "D": 4, // Aprile
        "E": 5, // Maggio
        "H": 6, // Giugno
        "L": 7, // Luglio
        "M": 8, // Agosto
        "P": 9, // Settembre
        "R": 10, // Ottobre
        "S": 11, // Novembre
        "T": 12 // Dicembre
    };

    identity.birthMonth = monthMap[identity.codFiscale[8]];

    return identity;
}

const getBirthDay = (identity: Identity): Identity => {
    const birthDay: number = Number(identity.codFiscale.slice(9, 11));

    identity.birthDay = birthDay;

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
        getSurname,
        getName,
        getBirthYear,
        getBirthMonth,
        getBirthDay
    );


    return right(result);
}
