import { elementEvents, UI } from '../Layers/common';
export declare let defaultwithinput: number;
export declare let defaultleftinput: number;
export interface inputEvents extends elementEvents {
    change: string;
    focus: string;
    blur: string;
}
export declare class Input extends UI {
    label: HTMLElement;
    parent: HTMLElement;
    el: any;
    inputEvent: inputEvents;
    constructor(container: HTMLElement, label?: string);
}
