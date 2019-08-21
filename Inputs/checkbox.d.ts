import { ui_input, inputEvents } from './input';
export declare class ui_checkbox extends ui_input {
    constructor(parent: HTMLElement, label: string, checked: boolean);
    setValue(checked: boolean): void;
    inputEvent: inputEvents;
    on(event: string, funct: Function): this;
}
