import { Identity } from "../types/identity";
import { Either, left, right } from "fp-ts/lib/Either";
import { Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getCodCatastale } from "./codCatastale";
import { getCodNazione } from "./codNazione";
import { IError } from "../types/error";

const getConsonants = (s: string): string => {
    return Array.from(s.toLowerCase()).filter(c => !"aeiou".includes(c)).join('');
}

const getVowels = (s: string): string => {
    return Array.from(s.toLowerCase()).filter(c => "aeiou".includes(c)).join('');
}

const getEven = (s: string): string[] => {
    return Array.from(s).filter((_, i) => (i + 1) % 2 == 0);
}

const getOdd = (s: string): string[] => {
    return Array.from(s).filter((_, i) => (i + 1) % 2 != 0);
}

const getSurname = (identity: Identity): Identity => {
    // Estrai le prime tre consonanti del cognome
    const consonantiCognome: string = getConsonants(identity.surname);
    let codCognome: string = consonantiCognome.slice(0, 3);

    // Se le consonanti sono minori di tre, estrai pure le vocali
    if(consonantiCognome.length < 3) {
        const vocaliCognome: string = getVowels(identity.surname);
        codCognome += vocaliCognome;
        codCognome = codCognome.slice(0, 3);
    }

    // Se il risultato < 3(i.e. il cognome e' di due caratteri), aggiungi 'x'
    if(codCognome.length < 3)
        codCognome += 'x';

    identity.codFiscale += codCognome;
    
    return identity;
}

const getName = (identity: Identity): Identity => {
    // Estrai le consonanti del nome
    const consonantiNome: string = getConsonants(identity.name);
    // Se le consonanti sono >= 4, estrai la prima, la terza e la quarta
    if(consonantiNome.length >= 4) {
        let codName: string = consonantiNome[0];
        codName += consonantiNome[2];
        codName += consonantiNome[3];
        identity.codFiscale += codName;

        return identity;
    }

    // Altrimenti prendi le prime tre consonanti in ordine
    let codName: string = consonantiNome.slice(0, 3);
    // Se le consonanti sono minori di tre, estrai pure le vocali
    if(consonantiNome.length < 3) {
        const vocaliNome: string = getVowels(identity.name);
        codName += vocaliNome;
        codName = codName.slice(0, 3);
    }

    // Se il risultato < 3(i.e. il nome e' di due caratteri), aggiungi 'x'
    if(codName.length < 3)
        codName += 'x';

    identity.codFiscale += codName;
    
    return identity;
}

const getBirthYear = (identity: Identity): Identity => {
    identity.codFiscale += identity.birthYear.slice(-2);

    return identity;
}

const getBirthMonth = (identity: Identity): Identity => {
    type monthT = {
        [month: number]: string;
    }
    // Mappa ciascun mese al corrispondente valore
    const monthMap: monthT = {
        1: "A", // Gennaio
        2: "B", // Febbraio
        3: "C", // Marzo
        4: "D", // Aprile
        5: "E", // Maggio
        6: "H", // Giugno
        7: "L", // Luglio
        8: "M", // Agosto
        9: "P", // Settembre
        10: "R", // Ottobre
        11: "S", // Novembre
        12: "T" // Dicembre
    };

    // Ritorna il valore corrispondente al mese scelto
    identity.codFiscale += monthMap[identity.birthMonth];

    return identity;
}

const getBirthDay = (identity: Identity): Identity => {
    let birthday: number = Number(identity.birthDay);
    // Se il soggetto e' una donna, sommare 40 al giorno di nascita
    if(identity.sex === "female") {
        birthday += 40;
        identity.codFiscale += birthday;

        return identity;
    }

    // Se il risultato finale <= 9, anteporre uno '0' al risultato
    if(birthday < 10)
        identity.codFiscale += '0';

    identity.codFiscale += birthday;

    return identity;
}

const getBirthPlace = async (identity: Identity): Promise<Identity> => {
    const match = <R, A>(onNone: () => R, onSome: (a: A) => R) => (fa: Option<A>) => {
        switch(fa._tag) {
            case "None": return onNone();
            case "Some": return onSome(fa.value);
        }
    }

    // Estrai il codice catastale in base al comune
    const codCatastale: string = await getCodCatastale(identity.birthPlace);
    if(!codCatastale) {
        // Se il codice catastale e' nullo, prova a cercare il codice della nazione
        const codNazione: Option<string> = getCodNazione(identity.birthPlace);
        pipe(
            codNazione,
            match(
                () => {
                    const error: IError = {
                        code: 400,
                        msg: "Il luogo di nascita selezionato non esiste"
                    };
                    identity.errors = error;
                    return identity;
                },
                (codNazione: string) => {
                    identity.codFiscale += codNazione;
                    return identity;
                }
            )
        );
    }

    identity.codFiscale += codCatastale;
    return identity;
}

const getControlCode = async (identity: Promise<Identity>): Promise<Identity> => {
    // Separa i caratteri in posizione dispari da quelli in posizione pari
    const oddChars: string[] = getOdd((await identity).codFiscale);
    const evenChars: string[] = getEven((await identity).codFiscale);
    type checkMap = {
        [ch: string]: number
    };

    // Mappa dei valori dispari
    const oddMap: checkMap = {
        "0": 1, "1": 0, "2": 5, "3": 7, "4": 9, "5": 13,
        "6": 15, "7": 17, "8": 19, "9": 21, "A": 1, "B": 0,
        "C": 5, "D": 7, "E": 9, "F": 13, "G": 15, "H": 17,
        "I": 19, "J": 21, "K": 2, "L": 4, "M": 18, "N": 20,
        "O": 11, "P": 3, "Q": 6, "R": 8, "S": 12, "T": 14,
        "U": 16, "V": 10, "W": 22, "X": 25, 'Y': 24, "Z": 23
    };

    // Mappa dei valori pari
    const evenMap: checkMap = {
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
        "6": 6, "7": 7, "8": 8, "9": 9, "A": 0, "B": 1,
        "C": 2, "D": 3, "E": 4, "F": 5, "G": 6, "H": 7,
        "I": 8, "J": 9, "K": 10, "L": 11, "M": 12, "N": 13,
        "O": 14, "P": 15, "Q": 16, "R": 17, "S": 18, "T": 19,
        "U": 20, "V": 21, "W": 22, "X": 23, "Y": 24, "Z": 25
    };


    const oddSum: number = oddChars.reduce((prev, curr) => {
        return oddMap[prev] + oddMap[curr];
    }, 0);

    console.log(oddSum);


    return identity;
}

export const getCF = async (identity: Identity): Promise<Either<IError, string>> => {
    const codiceFiscale: Promise<Identity> = pipe(
        identity, 
        getSurname, 
        getName, 
        getBirthYear, 
        getBirthMonth,
        getBirthDay,
        getBirthPlace
    );

    return !(await codiceFiscale).errors
        ? right((await codiceFiscale).codFiscale.toUpperCase())
        : left((await codiceFiscale).errors as IError);
}