import { Input, inputEvents } from './input';
import noUiSlider from 'nouislider';
export interface slideroption {
    value: number;
    max: number;
    min: number;
    step?: number;
    curve?: 'logarithmic' | 'linear';
}
export declare class SliderInput extends Input {
    label: HTMLElement;
    number: HTMLElement;
    defaultValue: number;
    min: number;
    max: number;
    step: number;
    curve: 'logarithmic' | 'linear';
    noUiSlider: noUiSlider;
    constructor(parent: HTMLElement, label: string, slideroption: slideroption);
    createSlider(parent: HTMLElement, value: number): void;
    setValue(value: number): void;
    checkSliderCurve(value: string | number): string | number;
    checkNumberCurve(value: string | number): string | number;
    checkMaxMin(value: string): string | number;
    checkAccuracy(value: any): number;
    inputEvent: inputEvents;
    numberInputEvent: inputEvents;
    formerValue: number;
    on(event: string, funct: Function): this;
}
