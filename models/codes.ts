import Database from "better-sqlite3";
import { Option, some, none } from "fp-ts/lib/Option";
import path from "path";

const dbPath: string = path.join(__dirname + "/../codes.db");

// Dato un comune estrai il codice catastale corrispondente
export const getCodCatastale = (comune: string): Option<string> => {
    const db = new Database(dbPath);
    const row = db.prepare("SELECT Code FROM codCatastali WHERE UPPER(City) = ?").get(comune.toUpperCase());
    db.close();

    return !row ? none : some(row.Code);
}

// Dato un codice catastale estrai il comune corrispondente
export const getComune = (codCatastale: string): Option<string> => {
    const db = new Database(dbPath);
    const row = db.prepare("SELECT City FROM codCatastali WHERE Code = ?").get(codCatastale);
    db.close();

    return !row ? none : some(row.City);
}

// Data una nazione, estrai il codice nazionale
export const getCodNazione = (nazione: string): Option<string> => {
    const db = new Database(dbPath);
    const row = db.prepare("SELECT Code FROM codNazioni WHERE UPPER(State) = ?").get(nazione.toUpperCase());
    db.close();

    return !row ? none : some(row.Code);
}

// Data un codice di una nazione, estrai la nazione
export const getNazione = (codNazione: string): Option<string> => {
    const db = new Database(dbPath);
    const row = db.prepare("SELECT State FROM codNazioni WHERE Code = ?").get(codNazione);
    db.close();

    return !row ? none : some(row.State);
}
