import { ui_input } from './input';
export interface textnode {
    ui: string;
    text: string;
}
export declare class ui_button extends ui_input {
    textnode: textnode;
    constructor(parent: HTMLElement, textnode: textnode, className?: string);
    setText(text: string): void;
}
export declare class ui_imagebutton extends ui_input {
    image: HTMLElement;
    constructor(parent: HTMLElement, imageurl: string, className?: string);
    setImage(imageurl: string): void;
}
