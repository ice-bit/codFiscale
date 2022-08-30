import Database from "better-sqlite3";
import { Option, some, none } from "fp-ts/lib/Option";
import path from "path";

export const getCodNazione = (birthPlace: string): Option<string> => {
    const db = new Database(path.join(__dirname +  "/../codnazioni.db"));
    const row = db.prepare("SELECT Code FROM codNazioni Where UPPER(City) = ?").get(birthPlace.toUpperCase());

    return row.Code ? some(row.Code) : none;
}