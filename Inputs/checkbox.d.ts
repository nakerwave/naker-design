import { Input, inputEvents } from './input';
export declare class Checkbox extends Input {
    constructor(parent: HTMLElement, label: string, checked: boolean);
    setValue(checked: boolean): void;
    inputEvent: inputEvents;
    on(event: string, funct: Function): this;
}
