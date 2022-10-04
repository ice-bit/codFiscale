import * as reverse from "../models/reverse";
import { Identity } from "../types/identity";


describe("Testing reverse.ts file", () => {
    test("getSurname method should returns the three characters of the surname", () => {
        const identity: Identity = {
            surname: "",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: "RSSMRA85A01H501Z"
        };

        const actual = reverse.getSurname(identity);
        expect(actual.surname).toBe("RSS");
    });

    test("getName method should returns the three characters of the name", () => {
        const identity: Identity = {
            surname: "",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: "RSSMRA85A01H501Z"
        };

        const actual = reverse.getName(identity);
        expect(actual.name).toBe("MRA");
    });

    test("getBirthYear method should returns the year of birth", () => {
        const identity: Identity = {
            surname: "",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: "RSSMRA85A01H501Z"
        };

        const actual = reverse.getBirthYear(identity);
        expect(actual.birthYear).toBe("1985");
    });

    test("getBirthMonth method should returns the month of birth", () => {
        const identity: Identity = {
            surname: "",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: "RSSMRA85A01H501Z"
        };

        const actual = reverse.getBirthMonth(identity);
        expect(actual.birthMonth).toBe(1);
    });

    test("getBirthDay method should returns the day of birth", () => {
        const identity: Identity = {
            surname: "",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: "RSSMRA85A47H501Z"
        };

        const actual = reverse.getBirthDay(identity);
        expect(actual.birthDay).toBe(7);
    });

    test("getBirthPlace method should returns the birth place", () => {
        const identity: Identity = {
            surname: "",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: "RSSMRA85A47H501Z"
        };

        const actual = reverse.getBirthPlace(identity);
        expect(actual.birthPlace).toBe("Roma");
    });

    test("getBirthSex method should returns the sex", () => {
        const identity: Identity = {
            surname: "",
            name: "",
            sex: "",
            birthPlace: "",
            pr: "",
            birthDay: 0,
            birthMonth: 0,
            birthYear: "",
            codFiscale: "RSSMRA85A47H501Z"
        };

        const actual = reverse.getSex(identity);
        expect(actual.sex).toBe("female");
    });
})
