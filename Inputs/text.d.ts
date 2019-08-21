import { ui_input, inputEvents } from './input';
export declare class ui_textinput extends ui_input {
    label: HTMLElement;
    value: string;
    constructor(parent: HTMLElement, label: string, text: string, className?: string);
    setValue(value: string): void | this;
    setPlaceholder(text: string): void;
    setEvents(): void;
    inputEvent: inputEvents;
    changeFunctions: Array<Function>;
    enterkeyFunctions: Array<Function>;
    on(event: string, funct: Function): this;
}
export declare class ui_paragraphinput extends ui_input {
    label: HTMLElement;
    value: string;
    max: number;
    constructor(parent: HTMLElement, label: string, text: string, className?: string);
    count: any;
    setCount(): void;
    setValue(value: string): void | this;
    setPlaceholder(text: string): void;
    setEvents(): void;
    inputEvent: inputEvents;
    changeFunctions: Array<Function>;
    enterkeyFunctions: Array<Function>;
    on(event: string, funct: Function): this;
}
