import { Input } from './input';
export interface textnode {
    ui: string;
    text: string;
}
export declare class Button extends Input {
    textnode: textnode;
    constructor(parent: HTMLElement, textnode: textnode, className?: string);
    setText(text: string): void;
}
export declare class ImageButton extends Input {
    image: HTMLElement;
    constructor(parent: HTMLElement, imageurl: string, className?: string);
    setImage(imageurl: string): void;
}
