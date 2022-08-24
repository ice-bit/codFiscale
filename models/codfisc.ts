import { Identity } from "../types/identity";
import { right, left, Either } from "fp-ts/Either";

const getConsonants = (s: string): string => {
    return Array.from(s.toLowerCase()).filter(c => !"aeiou".includes(c)).join('');
}

const getVowels = (s: string): string => {
    return Array.from(s.toLowerCase()).filter(c => "aeiou".includes(c)).join('');
}

const computeSurname = (surname: string): string => {
    // Estrai le consonanti del cognome
    const consonantiCognome = getConsonants(surname);
    let codCognome: string = consonantiCognome;

    // Se le consonanti sono minori di tre, estrai pure le vocali
    if(consonantiCognome.length < 3) {
        const vocaliCognome = getVowels(surname);
        codCognome += vocaliCognome;
        codCognome = codCognome.slice(0, 3);
    }

    // Se il risultato < 3(i.e. il cognome e' di due caratteri), aggiungi 'x'
    if(codCognome.length < 3)
        codCognome += 'x';

    return codCognome;
}

export const computeCF = (identity: Identity): Either<Error, string> => {
    const cognome: string = computeSurname(identity.surname);

    return cognome ? right(cognome) : left(new Error("Errore durante il calcolo del CF"));
}