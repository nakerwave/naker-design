import { Input } from '../Inputs/input';
import { UI } from '../Layers/common';
export interface coloroption {
    opacity: boolean;
    removable?: boolean;
    color?: Array<number>;
}
export declare class ColorButton extends Input {
    rgba: Array<number>;
    opacity: boolean;
    callback: Function;
    colorel: HTMLElement;
    coloricon: HTMLElement;
    colorbutton: HTMLElement;
    constructor(parent: HTMLElement, label: string, coloroption: coloroption);
    checkErase(): void;
    mouseEnter(): void;
    mouseLeave(): void;
    setIcon(icon: string): void;
    setValue(rgba: Array<number>, frompicker?: any): void | this;
    erase(frompicker?: any): void;
    events: any;
    startrgba: any;
    focus(): void;
    blurEvent(picker?: any): void;
    on(event: string, funct: Function): this;
}
export declare class ColorPicker extends UI {
    back: HTMLElement;
    title: HTMLElement;
    picker: any;
    opacityPicker: HTMLElement;
    palette: Array<string>;
    set(palette?: Array<string>): this;
    setBack(): void;
    visible: boolean;
    hidePicker(): void;
    setEvent(): void;
    currentInput: ColorButton;
    setCurrentInput(input: ColorButton): void;
    setPickerPosition(): void;
}
export declare let colorPicker: ColorPicker;
