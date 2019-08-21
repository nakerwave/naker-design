import { Input, inputEvents } from './input';
export interface numberoption {
    value?: number;
    unit?: string;
    left?: number;
    width?: number;
    min?: number;
    max?: number;
    step?: number;
    decimal?: number;
}
export declare class NumberInputinput extends Input {
    unit: any;
    value: number;
    width: number;
    left: number;
    max: number;
    min: number;
    decimal: number;
    constructor(parent: HTMLElement, label: string, number: numberoption);
    setMinMax(number: numberoption): void;
    setUnit(number: numberoption): void;
    updateUnit(unit: string): void;
    setValue(value: number): void | this;
    checkDecimal(): void;
    checkMaxMin(): void;
    setEvents(): void;
    inputEvent: inputEvents;
    changeFunctions: Array<Function>;
    enterkeyFunctions: Array<Function>;
    on(event: string, funct: Function): this;
}
export declare class VectorInputinput extends Input {
    numberInputs: any;
    constructor(parent: HTMLElement, label: string, numberoption: numberoption);
    on(event: string, funct: Function): this;
}
