
import { Input, inputEvents } from './input';

import { el, mount, setAttr, setStyle } from 'redom';
import noUiSlider from 'nouislider';

/*
  +------------------------------------------------------------------------+
  | SLIDER                                                                 |
  +------------------------------------------------------------------------+
*/

export interface slideroption {
    value: number;
    max: number;
    min: number;
    unit?: string,
    step?: number;
    power?: number;
    curve?: 'logarithmic' | 'exponential' | 'linear';
}

export abstract class Slider extends Input<number> {

    abstract on(event: string, funct: (value: number) => void);

    defaultValue: number;
    min: number = 0;
    max: number = 1;
    step: number = 0.01;
    curve: 'logarithmic' | 'exponential' | 'linear' = 'linear';

    noUiSlider: noUiSlider;

    constructor(parent: HTMLElement, label: string, slideroption?: slideroption) {
        super(parent, label);
        this.el = this.parent;
        if (slideroption) this.initSliderVar(slideroption);
    }
    
    initSliderVar(slideroption: slideroption) {
        this.defaultValue = slideroption.value;
        if (slideroption.step) this.step = slideroption.step;
        if (slideroption.curve) this.curve = slideroption.curve;
        if (slideroption.power) this.power = slideroption.power;
        this.max = slideroption.max;
        this.min = slideroption.min;
        let value = this.checkAccuracy(slideroption.value);
        this.lastSliderValue = value;
    }

    createSlider(parent: HTMLElement, value: number) {
        // Need to recalculate slider min when logarithmic curve
        this.setClass('input-container input-container-big');
        let min = this.checkNumberCurve(this.min);
        let max = this.max;
        this.noUiSlider = noUiSlider.create(parent, {
            range: { 'min': min, 'max': max },
            step: this.step,
            start: [value],
            connect: 'lower',
        });
    }

    setSliderValue(value: number) {
        if (value == undefined) {
            this.lastSliderValue = value; // To avoid slider to send new value in change callback
            this.noUiSlider.set([this.defaultValue]);
        } else {
            value = this.checkAccuracy(value);
            
            let slidervalue = this.checkNumberCurve(value);
            this.noUiSlider.set([slidervalue], false);
        }
        this.lastSliderValue = value;
    }
    
    power = 2;
    checkSliderCurve(value: number): number {
        if (this.curve == 'linear') {
            return value;
        } else if (this.curve == 'logarithmic') {
            let newvalue = this.max * Math.pow(value / this.max, this.power);
            newvalue = this.checkAccuracy(newvalue);
            return newvalue;
        } else if (this.curve == 'exponential') {
            let newvalue = this.max * Math.pow(value / this.max, 1 / this.power);
            newvalue = this.checkAccuracy(newvalue);
            return newvalue;
        }
    }
    
    checkNumberCurve(value: number): number {
        if (this.curve == 'linear') {
            return value;
        } else if (this.curve == 'logarithmic') {
            let newvalue = this.max * Math.pow(value / this.max, 1 / this.power);
            return newvalue
        } else if (this.curve == 'exponential') {
            let newvalue = this.max * Math.pow(value / this.max, this.power);
            return newvalue
        }
    }

    checkMaxMin(value: number): number {
        let newvalue = value;
        if (this.min) newvalue = Math.max(this.min, value);
        if (this.max) value = Math.min(this.max, newvalue);
        // Make sure value is not empty which gives a NaN
        if (!newvalue && newvalue !== 0) newvalue = 0;
        // If decimal number, it can be very anoying to change the value we type
        let str = value.toString();
        if (str.indexOf('.') == -1) return newvalue;
        else return value;
    }

    checkAccuracy(value: number): number {
        let accuracy = 1 / this.step;
        return Math.round(value * accuracy) / accuracy;
    }

    // See page https://refreshless.com/nouislider/events-callbacks/ to understand nouislider events
    // Be careful because event are very sensitive and it can break a lot of things like undo
    sliderEvent: inputEvents = {
        change: 'slide',
        focus: 'start',
        blur: 'change',
    };
    lastSliderValue: number;
    onSlider(event: string, funct: Function) {
        this.noUiSlider.on(this.sliderEvent[event], (values, handle) => {
            let value = values[0];
            value = this.checkAccuracy(value);
            // Allow focus and blur event where the value hasn't changed
            if (value == this.lastSliderValue && event == 'change') return;
            this.lastSliderValue = value;
            value = this.checkSliderCurve(value);
            funct(value, this);
        });
        return this;
    }
}

export class SliderInput extends Slider {

    number: HTMLElement;

    constructor(parent: HTMLElement, label: string, slideroption: slideroption) {
        super(parent, label, slideroption);
        this.setClass('input-container input-container-big');
        let value = this.checkAccuracy(slideroption.value);
        this.createSlider(this.parent, value);
        this.number = el('input.rangenumber.input-parameter', { type: 'number', value: value, min: this.min, max: this.max, step: this.step })
        mount(this.parent, this.number);
        if (slideroption.unit) this.setUnit(slideroption.unit);
        return this;
    }

    setValue(value: number) {
        if (value === undefined) {
            setAttr(this.number, { value: this.defaultValue });
        } else {
            value = this.checkAccuracy(value);
            setAttr(this.number, { value: value });
        }
        this.setSliderValue(value);
    }

    unit: HTMLElement;
    setUnit(unit: string) {
        this.unit = el('div', { class: 'input-unit' });
        this.unit.textContent = unit;
        mount(this.el, this.unit);
        setAttr(this.number, {
            onfocus: () => { setStyle(this.unit, { display: 'none' }) },
            onblur: () => { setStyle(this.unit, { display: 'block' }) }
        });

        this.updateUnit(unit);
    }

    updateUnit(unit: string) {
        this.unit.textContent = unit;
    }

    // See page https://refreshless.com/nouislider/events-callbacks/ to understand nouislider events
    // Be careful because event are very sensitive and it can break a lot of things like undo
    numberInputEvent: inputEvents = {
        change: 'input',
        focus: 'focus',
        blur: 'blur',
    };
    lastSliderValue: number;
    on(event: string, funct: Function) {
        this.onSlider(event, (value) => {
            setAttr(this.number, { value: value });
            funct(value, this);
        });
        this.number.addEventListener(this.numberInputEvent[event], (evt) => {
            let value = this.checkMaxMin(evt.target.value);
            value = this.checkAccuracy(value);
            if (value == this.lastSliderValue) return;
            this.lastSliderValue = value;
            setAttr(this.number, { value: value });
            let slidervalue = this.checkNumberCurve(value);
            this.noUiSlider.set([slidervalue]);
            funct(value, this);
        });
        return this;
    }
}
