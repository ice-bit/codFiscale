import * as codes from "../models/codes";
import {Option} from "fp-ts/lib/Option";
import {pipe} from "fp-ts/lib/function";

const extractOption = <T extends string>(opt: Option<T>): string => {
    const match = <R, A>(onNone: () => R, onSome: (a: A) => R) => (fa: Option<A>) => {
        switch (fa._tag) {
            case "None": return onNone();
            case "Some": return onSome(fa.value);
        }
    }

    return pipe(
        opt,
        match(
            (): string => "",
            (codCatastale: string): string => codCatastale
        ));
}

describe("Testing codes.ts file", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    test("getCodCatastale method should returns the codCatastale of a given city", () => {
        const city: string = "Roma";
        const actual: string = pipe(city, codes.getCodCatastale, extractOption);

        expect(actual).toBe("H501");
    });

    test("getComune method should returns the city of a given codCatastale", () => {
        const codCatastale: string = "F205";
        const actual: string = pipe(codCatastale, codes.getComune, extractOption);

        expect(actual).toBe("MILANO");
    });

    test("getCodNazione method should returns the codNazione of a given state", () => {
        const state: string = "germania";
        const actual: string = pipe(state, codes.getCodNazione, extractOption);

        expect(actual).toBe("Z112");
    });

    test("getNazione method should returns the state of a given codNazione", () => {
        const codNazione: string = "Z110";
        const actual: string = pipe(codNazione, codes.getNazione, extractOption);

        expect(actual).toBe("Francia");
    });
});