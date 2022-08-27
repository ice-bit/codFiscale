import axios from "axios";
import * as cheerio from "cheerio";

// Estrai il codice catastale dal sito dell'Agenzia Delle Entrate
export const getCodCat = async (birthPlace: string): Promise<string> => {
    const url: string = 
        `https://www1.agenziaentrate.gov.it/servizi/codici/ricerca/VisualizzaTabella.php?iniz=${birthPlace.slice(0, 12)}&ArcName=COM-ICI`;

    const res = await axios(url);
    const html = await res.data;
    const $: cheerio.Root = cheerio.load(html);
    let result: string = "";

    // Seleziona attributo table
    const rows: cheerio.Cheerio = $("table.table.table-striped.table-hover.table-bordered.table-header > tbody > tr");

    rows.each((_, element: cheerio.Element) => {
        const tds: cheerio.Cheerio = $(element).find("td");
        const code: string = $(tds[0]).text();
        const city: string = $(tds[1]).text();

        // Se la citta' corrente e' uguale a quella scelta dall'utente
        // Estrai il relativo codice catastale
        if(city.trim() === birthPlace.trim().toUpperCase())
            result = code;
    });

    return result;
}