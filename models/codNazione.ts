import { Database } from "sqlite3";
import { Option, some, none } from "fp-ts/lib/Option";
import path from "path";

export const getCodNazione = async (birthPlace: string): Promise<Option<string>> => {
    const db: Database = new Database(path.join(__dirname +  "/../codnazioni.db"));
    const query: string = "SELECT Code FROM codNazioni WHERE UPPER(City) = UPPER(?);";

    const res: any = await new Promise((resolve, reject) => {
        db.get(query, [birthPlace], (err, row) => {
            if(err)
                reject(err);

            if(row)
                resolve(row);
        });
        db.close();
        resolve(0);
    });

    return res.Code === undefined ? none : some(res.Code);
}