import { Identity } from "../types/identity";
import { right, left, Either } from "fp-ts/Either";

const getConsonants = (s: string): string => {
    return Array.from(s.toLowerCase()).filter(c => !"aeiou".includes(c)).join('');
}

const getVowels = (s: string): string => {
    return Array.from(s.toLowerCase()).filter(c => "aeiou".includes(c)).join('');
}

const computeSurname = (surname: string): string => {
    // Estrai le prime tre consonanti del cognome
    const consonantiCognome: string = getConsonants(surname);
    let codCognome: string = consonantiCognome.slice(0, 3);

    // Se le consonanti sono minori di tre, estrai pure le vocali
    if(consonantiCognome.length < 3) {
        const vocaliCognome: string = getVowels(surname);
        codCognome += vocaliCognome;
        codCognome = codCognome.slice(0, 3);
    }

    // Se il risultato < 3(i.e. il cognome e' di due caratteri), aggiungi 'x'
    if(codCognome.length < 3)
        codCognome += 'x';

    return codCognome;
}

const computeName = (name: string): string => {
    // Estrai le consonanti del nome
    const consonantiNome: string = getConsonants(name);
    // Se le consonanti sono >= 4, estrai la prima, la terza e la quarta
    if(consonantiNome.length >= 4) {
        let codName: string = consonantiNome[0];
        codName += consonantiNome[2];
        codName += consonantiNome[3];

        return codName;
    }

    // altrimenti prendi le prime tre consonanti in ordine
    let codName: string = consonantiNome.slice(0, 3);
    // Se le consonanti sono minori di tre, estrai pure le vocali
    if(consonantiNome.length < 3) {
        const vocaliNome: string = getVowels(name);
        codName += vocaliNome;
        codName = codName.slice(0, 3);
    }

    // Se il risultato < 3(i.e. il nome e' di due caratteri), aggiungi 'x'
    if(codName.length < 3)
        codName += 'x';

    return codName;
}

const computeBirthYear = (year: string): string => year.slice(-2);

const computeBirthMonth = (month: number): string => {
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
    return monthMap[month];
}

export const computeCF = (identity: Identity): Either<Error, string> => {
    const cognome: string = computeSurname(identity.surname);
    const nome: string = computeName(identity.name);
    const annoNascita: string = computeBirthYear(identity.birthYear);
    const meseNascita: string = computeBirthMonth(identity.birthMonth);
    const codiceFiscale: string = cognome + nome + annoNascita + meseNascita;

    return codiceFiscale ? right(codiceFiscale.toUpperCase()) : left(new Error("Errore durante il calcolo del CF"));
}