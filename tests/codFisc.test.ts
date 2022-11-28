import * as codFisc from "../models/codfisc";
import { Identity } from "../types/identity";

describe("Testing codFisc.ts file", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    test("getConsonants method should returns a string containing consonants only", () => {
        const vowels = "aeiou";
        const cons = "This is a test";
        expect(codFisc.getConsonants(vowels)).toBe("");
        expect(codFisc.getConsonants(cons)).toBe("thsstst");
    });

    test("getVowels method should returns a string containing vowels only", () => {
        const cons = "QWT";
        const vowels = "Aeiou";
        expect(codFisc.getVowels(cons)).toBe("");
        expect(codFisc.getVowels(vowels)).toBe("aeiou"); 
    });

    test("getEven method should returns even indexed character only", () => {
        const str = "HelloWorld";
        expect(codFisc.getEven(str)).toEqual(Array.from("elWrd"));
    });

    test("getOdd method should returns odd indexed character only", () => {
        const str = "HelloWorld";
        expect(codFisc.getOdd(str)).toEqual(Array.from("Hlool"));
    });

    test("getSurname method should returns three consonants from the surname", () => {
        const identity: Identity = {
            surname: "Rossi",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: ""
        };

        const actual = codFisc.getSurname(identity);
        expect(actual.codFiscale).toBe("rss");
    });

    test("getSurname method should returns a vowel when consonants are missing", () => {
        const identity: Identity = {
            surname: "Rosai",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: ""
        };

        const actual = codFisc.getSurname(identity);
        expect(actual.codFiscale).toBe("rso");
    });

    test("getSurname method should add an X to the result when surname length < 2", () => {
        const identity: Identity = {
            surname: "Fo",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: ""
        };

        const actual = codFisc.getSurname(identity);
        expect(actual.codFiscale).toBe("fox");
    });

    test("getName method should returns three consonants from the surname", () => {
        const identity: Identity = {
            surname: "",
            name: "Marco",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: ""
        };

        const actual = codFisc.getName(identity);
        expect(actual.codFiscale).toBe("mrc");
    });

    test("getName method should returns at least one vowel when consonants are missing", () => {
        const identity: Identity = {
            surname: "",
            name: "Mario",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: ""
        };

        const actual = codFisc.getName(identity);
        expect(actual.codFiscale).toBe("mra");
    });

    test("getName method should returns at the 1st, 3rd and 4th consonants when name.length > 3", () => {
        const identity: Identity = {
            surname: "",
            name: "Francesco",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: ""
        };

        const actual = codFisc.getName(identity);
        expect(actual.codFiscale).toBe("fnc");
    });

    test("getName method should add an X when name.length < 3", () => {
        const identity: Identity = {
            surname: "",
            name: "Al",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: ""
        };

        const actual = codFisc.getName(identity);
        expect(actual.codFiscale).toBe("lax");
    });

    test("getBirthYear method should returns the last two digits of the birth year", () => {
        const identity: Identity = {
            surname: "",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "1980",
            codFiscale: ""
        };

        const actual = codFisc.getBirthYear(identity);
        expect(actual.codFiscale).toBe("80");
    });

    test("getBirthMonth method should returns the a symbol associated with each month of the year", () => {
        type monthT = {
            [month: number]: string;
        }
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

        Array(12).fill(0).map((_, i) => {
            const identity: Identity = {
                surname: "",
                name: "",
                sex: "",
                birthPlace: "",
                pr: "",
                birthDay: 0,
                birthMonth: (i + 1),
                birthYear: "",
                codFiscale: ""
            };
            const actual = codFisc.getBirthMonth(identity);
            expect(actual.codFiscale).toBe(monthMap[i+1]);
        });
    });

    test("getBirthDay method should returns the plain birthday for male citizens", () => {
        const identity: Identity = {
            surname: "",
            name: "",
            sex: "male",
            birthPlace: "",
            pr: "",
            birthDay: 9,
            birthMonth: 0,
            birthYear: "",
            codFiscale: ""
        };

        const actual = codFisc.getBirthDay(identity);
        expect(actual.codFiscale).toBe("09");
    });

    test("getBirthDay method should returns the birthday+40 for female citizens", () => {
        const identity: Identity = {
            surname: "",
            name: "",
            sex: "female",
            birthPlace: "",
            pr: "",
            birthDay: 9,
            birthMonth: 0,
            birthYear: "",
            codFiscale: ""
        };

        const actual = codFisc.getBirthDay(identity);
        expect(actual.codFiscale).toBe("49");
    });
});