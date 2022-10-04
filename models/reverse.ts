import { Identity } from "../types/identity";
import { Either, left, right } from "fp-ts/lib/Either";
import { Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { IError } from "../types/error";
import { getComune, getNazione } from "./codes";

export const getSurname = (identity: Identity): Identity => {
    const surname: string = identity.codFiscale.slice(0, 3);

    identity.surname = surname;

    return identity;
}

export const getName = (identity: Identity): Identity => {
    const name: string = identity.codFiscale.slice(3, 6);

    identity.name = name;

    return identity;
}

export const getBirthYear = (identity: Identity): Identity => {
    const birthYear: string = identity.codFiscale.slice(6, 8);
    const currentYear: number = new Date().getFullYear();


    // Se le cifre dell'anno sono maggiori dell'anno corrente,
    // allora anteponi '19' nell'anno di nascita.
    // Altrimenti anteponi '20'
    if(Number(`20${birthYear}`) > currentYear)
        identity.birthYear = `19${birthYear}`;
    else
        identity.birthYear = `20${birthYear}`;


    return identity;
}

export const getBirthMonth = (identity: Identity): Identity => {
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

export const getBirthDay = (identity: Identity): Identity => {
    const birthDay: number = Number(identity.codFiscale.slice(9, 11));
    // Se il giorno di nascita e' '41' e '71', si tratta
    // di un soggetto di sesso femminile. Dunque si sottrae
    // '40' dal risultato finale
    if(birthDay >= 41 && birthDay <= 71)
        identity.birthDay = (birthDay - 40);
    else if(birthDay >= 1 && birthDay <= 31)
        identity.birthDay = birthDay;
    else {
        const error: IError = {
            code: 400,
            msg: "Il giorno di nascita del codice fiscale risulta invalido"
        };
        identity.errors = error;
    }

    return identity;
}

export const getBirthPlace = (identity: Identity): Identity => {
    const match = <R, A>(onNone: () => R, onSome: (a: A) => R) => (fa: Option<A>) => {
        switch(fa._tag) {
            case "None": return onNone();
            case "Some": return onSome(fa.value);
        }
    }

    const normalizeField = (s: string): string => {
        return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
    }

    // Estrai i caratteri del luogo di nascita dal codice fiscale
    const codBirthPlace: string = identity.codFiscale.slice(11, 15);

    // Se il codice del luogo di nascita inizia con 'Z', cerca nella
    // tabella dei codici nazionali
    if(codBirthPlace[0] === 'Z') {
        const nazioneOpt: Option<string> = getNazione(codBirthPlace);
        pipe(
            nazioneOpt,
            match(
                (): void => {
                    const error: IError = {
                        code: 400,
                        msg: "La nazione del codice fiscale non esiste"
                    };
                    identity.errors = error;
                },
                (nazione: string): void => {
                    identity.birthPlace = normalizeField(nazione);
                }
            )
        );
        return identity;
    }

    // Altrimenti cerca nella tabella dei comuni Italiani
    const comuneOpt: Option<string> = getComune(codBirthPlace);
    pipe(
        comuneOpt,
        match(
            (): void => {
                const error: IError = {
                    code: 400,
                    msg: "Il comune del codice fiscale non esiste"
                };
                identity.errors = error;
            },
            (comune: string): void => {
                identity.birthPlace = normalizeField(comune);
            }
        )
    );

    return identity;
}

export const getSex = (identity: Identity): Identity => {
    const birthDay: number = Number(identity.codFiscale.slice(9, 11));

    identity.sex = (birthDay >= 41 && birthDay <= 71) ? "female" : "male";

    return identity;
}

export const reverseCF = (identity: Identity): Either<IError, Identity> => {
    if(identity.codFiscale.length !== 16) {
        const error: IError = {
            code: 400,
            msg: "Codice fiscale invalido"
        };
        return left(error);
    }

    const result:Identity = pipe(
        identity,
        getSurname,
        getName,
        getBirthYear,
        getBirthMonth,
        getBirthDay,
        getSex,
        getBirthPlace
    );

    return !result.errors
        ? right(result)
        : left(result.errors as IError);
}
