import { ui_input, inputEvents } from './input';
import Suggestions from 'suggestions';
export interface selectoption {
    value: string;
    list: Array<string>;
}
export declare class ui_select extends ui_input {
    options: Array<string>;
    label: HTMLElement;
    constructor(parent: HTMLElement, label: string, selectoption: selectoption);
    selectlabels: Array<any>;
    suggestion: Suggestions;
    list: Suggestions["List"];
    setInput(selectoption: selectoption): void;
    setOptions(options: Array<string>): void;
    setEvents(): void;
    blur(): void;
    value: string;
    setValue(value: string): void;
    inputEvent: inputEvents;
    changeFunctions: Array<Function>;
    blurFunctions: Array<Function>;
    on(event: string, funct: Function): this;
}
