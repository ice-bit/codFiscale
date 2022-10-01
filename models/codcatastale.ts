import * as cheerio from "cheerio";

export enum opType {
    getCodCatastale,
    getComune
};

// Estrai il codice catastale di un dato comune e viceversa.
export const getComune = async (query: string, op: opType): Promise<string> => {
    const url: string = "https://dait.interno.gov.it/territorio-e-autonomie-locali/sut/elenco_codici_comuni.php";

    try {
        const res: Response = await fetch(url);
        const data: string = await res.text();

        const $: cheerio.Root = cheerio.load(data);
        let result: string = "";

        // Seleziona attributo tabella
        const rows: cheerio.Cheerio = $("table > tbody > tr");

        rows.each((_, element: cheerio.Element) => {
            const tds: cheerio.Cheerio = $(element).find("td");
            const city: string = $(tds[1]).text();
            const code: string = $(tds[5]).text();

            switch(op) {
                case opType.getCodCatastale: {
                    if(city.trim() === query.trim().toUpperCase())
                        return result = code;
                }
                case opType.getComune: {
                    if(query.trim() === code.trim())
                        return result = city;
                }
            }
        });

        return result;
    } catch(error) {
        return "";
    }
}
