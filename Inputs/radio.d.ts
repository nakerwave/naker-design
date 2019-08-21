import { Input, inputEvents } from './input';
import { RedomElement } from 'redom';
export interface radiooption {
    value: string;
    list: Array<string>;
}
export declare class RadioInput extends Input {
    option: Array<string>;
    label: HTMLElement;
    constructor(parent: HTMLElement, label: string, radiooption: radiooption);
    radiobuttons: Array<RedomElement>;
    radionodes: Array<RedomElement>;
    setInput(radiooption: radiooption): void;
    setValue(value: string): void;
    inputEvent: inputEvents;
    on(event: string, funct: Function): this;
}
export interface radioiconoption {
    value: string;
    iconperline: number;
    list: Array<string>;
}
export declare class RadioIconInput extends Input {
    option: Array<string>;
    iconperline: number;
    label: HTMLElement;
    linenumber: number;
    row: any;
    constructor(parent: HTMLElement, label: string, radiooption: radioiconoption);
    radiobuttons: Array<any>;
    setInput(label: string, radiooption: radioiconoption): void;
    setValue(value: string): void;
    inputEvent: inputEvents;
    on(event: string, funct: Function): this;
}
