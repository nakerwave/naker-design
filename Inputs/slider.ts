
import { Input, inputEvents } from './input';

import { el, mount, setAttr } from 'redom';
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
    step?: number;
    curve?: 'logarithmic' | 'linear';
}

export class Slider extends Input {

    defaultValue: number;
    min: number = 0;
    max: number = 1;
    step: number = 0.01;
    curve: 'logarithmic' | 'linear' = 'linear';

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
        this.max = slideroption.max;
        this.min = slideroption.min;
        let value = this.checkAccuracy(slideroption.value);
        this.formerValue = value;
    }

    createSlider(parent: HTMLElement, value: number) {
        // Need to recalculate slider min when logarithmic curve
        setAttr(this.parent, { class: 'input-container input-container-big' });
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
            this.formerValue = value; // To avoid slider to send new value in change callback
            this.noUiSlider.set([this.defaultValue]);
        } else {
            value = this.checkAccuracy(value);
            let slidervalue = this.checkNumberCurve(value);
            this.noUiSlider.set([slidervalue], false);
        }
        this.formerValue = value;
    }

    checkSliderCurve(value: number): number {
        if (this.curve == 'linear') {
            return value;
        } else if (this.curve == 'logarithmic') {
            let newvalue = Math.pow(value, 2) / this.max;
            newvalue = this.checkAccuracy(newvalue);
            return newvalue;
        }
    }

    checkNumberCurve(value: number): number {
        if (this.curve == 'linear') {
            return value;
        } else if (this.curve == 'logarithmic') {
            return Math.pow(value * this.max, 1 / 2);
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
    formerValue: number;
    onSlider(event: string, funct: Function) {
        this.noUiSlider.on(this.sliderEvent[event], (values, handle) => {
            let value = values[0];
            value = this.checkAccuracy(value);
            // Allow focus and blur event where the value hasn't changed
            if (value == this.formerValue && event == 'change') return;
            this.formerValue = value;
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
        setAttr(this.parent, { class: 'input-container input-container-big' });
        let value = this.checkAccuracy(slideroption.value);
        this.createSlider(this.parent, value);
        this.number = el('input.rangenumber.input-parameter', { type: 'number', value: value, min: this.min, max: this.max, step: this.step })
        mount(this.parent, this.number);
        return this;
    }

    setValue(value: number) {
        if (value == undefined) {
            setAttr(this.number, { value: this.defaultValue });
        } else {
            value = this.checkAccuracy(value);
            setAttr(this.number, { value: value });
        }
        this.setSliderValue(value);
    }

    // See page https://refreshless.com/nouislider/events-callbacks/ to understand nouislider events
    // Be careful because event are very sensitive and it can break a lot of things like undo
    numberInputEvent: inputEvents = {
        change: 'input',
        focus: 'focus',
        blur: 'blur',
    };
    formerValue: number;
    on(event: string, funct: Function) {
        this.onSlider(event, (value) => {
            setAttr(this.number, { value: value });
            funct(value, this);
        });
        this.number.addEventListener(this.numberInputEvent[event], (evt) => {
            let value = this.checkMaxMin(evt.target.value);
            value = this.checkAccuracy(value);
            if (value == this.formerValue) return;
            this.formerValue = value;
            setAttr(this.number, { value: value });
            let slidervalue = this.checkNumberCurve(value);
            this.noUiSlider.set([slidervalue]);
            funct(value, this);
        });
        return this;
    }
}
