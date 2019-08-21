import { ui_input } from '../Inputs/input';
import { ui } from '../Layers/common';
export interface coloroption {
    opacity: boolean;
    removable?: boolean;
    color?: Array<number>;
}
export declare class ui_colorbutton extends ui_input {
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
export declare class ui_colorpicker extends ui {
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
    currentInput: ui_colorbutton;
    setCurrentInput(input: ui_colorbutton): void;
    setPickerPosition(): void;
}
export declare let colorpicker: ui_colorpicker;
