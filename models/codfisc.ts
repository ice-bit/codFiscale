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
    // Se le consonanti sono >= 4, prendi la prima, la terza e la quarta
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

export const computeCF = (identity: Identity): Either<Error, string> => {
    let codiceFiscale: string | undefined = undefined;
    const cognome: string = computeSurname(identity.surname);
    const nome: string = computeName(identity.name);

    codiceFiscale = cognome + nome;

    return codiceFiscale ? right(codiceFiscale.toUpperCase()) : left(new Error("Errore durante il calcolo del CF"));
}