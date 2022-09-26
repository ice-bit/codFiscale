import { Identity } from "../types/identity";
import { Either, left, right } from "fp-ts/lib/Either";
import { Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getCodCatastale } from "./codcatastale";
import { getCodNazione } from "./codnazione";
import { IError } from "../types/error";
import * as redis from "redis";

export const getConsonants = (s: string): string => {
    return Array.from(s.split(/\s/).join('').toLowerCase()).filter(c => !"aeiou".includes(c)).join('');
}

export const getVowels = (s: string): string => {
    return Array.from(s.split(/\s/).join('').toLowerCase()).filter(c => "aeiou".includes(c)).join('');
}

export const getEven = (s: string): string[] => {
    return Array.from(s).filter((_, i) => (i + 1) % 2 == 0);
}

export const getOdd = (s: string): string[] => {
    return Array.from(s).filter((_, i) => (i + 1) % 2 != 0);
}

export const getSurname = (identity: Identity): Identity => {
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

export const getName = (identity: Identity): Identity => {
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

export const getBirthYear = (identity: Identity): Identity => {
    identity.codFiscale += identity.birthYear.slice(-2);

    return identity;
}

export const getBirthMonth = (identity: Identity): Identity => {
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

export const getBirthDay = (identity: Identity): Identity => {
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

export const getBirthPlace = async (identity: Identity): Promise<Identity> => {
    const match = <R, A>(onNone: () => R, onSome: (a: A) => R) => (fa: Option<A>) => {
        switch(fa._tag) {
            case "None": return onNone();
            case "Some": return onSome(fa.value);
        }
    }

    const REDIS_HOST = process.env.REDIS_HOST as string;
    const REDIS_PORT = <unknown>process.env.REDIS_PORT as number;
    const redisClient = redis.createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` });
    redisClient.on("error", (error) => console.log("error: " + error));
    await redisClient.connect();

    // Cerca codice catastale nella cache
    const codCatastaleCache = await redisClient.get(identity.birthPlace.toUpperCase());
    if(codCatastaleCache) {
        identity.codFiscale += codCatastaleCache;
        redisClient.quit();
        return identity;
    } else {
        // Altrimenti estrailo attraverso l'API
        const codCatastale: string = await getCodCatastale(identity.birthPlace);
        // Se il codice catastale esiste, salvalo nella cache
        if(codCatastale)
            await redisClient.set(identity.birthPlace.toUpperCase(), codCatastale);
        else {
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
        redisClient.quit();
        return identity;
    }
}

export const getControlCode = async (identity: Promise<Identity>): Promise<Identity> => {
    (await identity).codFiscale = (await identity).codFiscale.toUpperCase();
    // Separa i caratteri in posizione dispari da quelli in posizione pari
    const oddChars: string[] = getOdd((await identity).codFiscale);
    const evenChars: string[] = getEven((await identity).codFiscale);
    type sumMap = {
        [ch: string]: number
    };
    type modMap = {
        [val: number]: string
    };

    // Mappa dei valori dispari
    const oddMap: sumMap = {
        "0": 1, "1": 0, "2": 5, "3": 7, "4": 9, "5": 13,
        "6": 15, "7": 17, "8": 19, "9": 21, "A": 1, "B": 0,
        "C": 5, "D": 7, "E": 9, "F": 13, "G": 15, "H": 17,
        "I": 19, "J": 21, "K": 2, "L": 4, "M": 18, "N": 20,
        "O": 11, "P": 3, "Q": 6, "R": 8, "S": 12, "T": 14,
        "U": 16, "V": 10, "W": 22, "X": 25, 'Y': 24, "Z": 23
    };

    // Mappa dei valori pari
    const evenMap: sumMap = {
        "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
        "6": 6, "7": 7, "8": 8, "9": 9, "A": 0, "B": 1,
        "C": 2, "D": 3, "E": 4, "F": 5, "G": 6, "H": 7,
        "I": 8, "J": 9, "K": 10, "L": 11, "M": 12, "N": 13,
        "O": 14, "P": 15, "Q": 16, "R": 17, "S": 18, "T": 19,
        "U": 20, "V": 21, "W": 22, "X": 23, "Y": 24, "Z": 25
    };

    // Mappa del carattere di controllo
    const controlMap: modMap = {
        0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F",
        6: "G", 7: "H", 8: "I", 9: "J", 10: "K", 11: "L",
        12: "M", 13: "N", 14: "O", 15: "P", 16: "Q", 17: "R",
        18: "S", 19: "T", 20: "U", 21: "V", 22: "W", 23: "X",
        24: "Y", 25: "Z"
    };

    // Somma i valori dispari associati a ciascun carattere
    const oddSum: number = oddChars.reduce((previousValue: number, currentValue: string, index: number) => {
        return index === 0 ? oddMap[currentValue] : previousValue + oddMap[currentValue];
    }, 0);

    // Somma i valori pari associati a ciascun carattere
    const evenSum: number = evenChars.reduce((previousValue: number, currentValue: string, index: number) => {
        return index === 0 ? evenMap[currentValue] : previousValue + evenMap[currentValue];
    }, 0);

    // Somma i due risultati parziali assieme ed esegui la divisione mod 26
    const controlNumber: number = ((oddSum + evenSum) % 26);
    
    // Mappa il codice di controllo al relativo carattere
    (await identity).codFiscale += controlMap[controlNumber];

    return identity;
}

export const getCF = async (identity: Identity): Promise<Either<IError, Identity>> => {
    const codiceFiscale: Promise<Identity> = pipe(
        identity, 
        getSurname, 
        getName, 
        getBirthYear, 
        getBirthMonth,
        getBirthDay,
        getBirthPlace,
        getControlCode
    );

    return !(await codiceFiscale).errors
        ? right((await codiceFiscale))
        : left((await codiceFiscale).errors as IError);
}
