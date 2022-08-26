import { Identity } from "../types/identity";
import { right, left, Either } from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";

const getConsonants = (s: string): string => {
    return Array.from(s.toLowerCase()).filter(c => !"aeiou".includes(c)).join('');
}

const getVowels = (s: string): string => {
    return Array.from(s.toLowerCase()).filter(c => "aeiou".includes(c)).join('');
}

const computeSurname = (identity: Identity): Identity => {
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

const computeName = (identity: Identity): Identity => {
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

    // altrimenti prendi le prime tre consonanti in ordine
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

const computeBirthYear = (identity: Identity): Identity => {
    identity.codFiscale += identity.birthYear.slice(-2);

    return identity;
}

const computeBirthMonth = (identity: Identity): Identity => {
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

export const computeCF = (identity: Identity): Either<Error, string> => {
    const codiceFiscale: Identity = pipe(identity, 
        computeSurname, computeName, computeBirthYear, computeBirthMonth);

    return codiceFiscale ? right(codiceFiscale.codFiscale.toUpperCase()) : left(new Error("Errore durante il calcolo del CF"));
}