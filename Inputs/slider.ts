
import { Input, inputEvents } from './input';

import { el, mount, setAttr } from 'redom';
import noUiSlider from 'nouislider';

/*
  +------------------------------------------------------------------------+
  | SLIDER                                                                 |
  +------------------------------------------------------------------------+
*/

export interface slideroption {
    value: Array<number>;
    max: number;
    min: number;
    step?: number;
    points?: number;
    curve?: 'logarithmic' | 'exponential' | 'linear';
}

export class Slider extends Input {

    defaultValues: Array<number>;
    min: number = 0;
    max: number = 1;
    step: number = 0.01;
    points = 1;
    curve: 'logarithmic' | 'exponential' | 'linear' = 'linear';

    noUiSlider: noUiSlider;

    constructor(parent: HTMLElement, label: string, slideroption?: slideroption) {
        super(parent, label);
        this.el = this.parent;
        if (slideroption) this.initSliderVar(slideroption);
    }
    
    initSliderVar(slideroption: slideroption) {
        this.defaultValues = slideroption.value;
        if (slideroption.step) this.step = slideroption.step;
        if (slideroption.curve) this.curve = slideroption.curve;
        if (slideroption.points) this.points = slideroption.points;
        this.max = slideroption.max;
        this.min = slideroption.min;
        let val = slideroption.value;
        if (typeof val == 'number') val = new Array(this.points).fill(val);
        let value = this.checkAccuracy(val);
        this.lastSliderValues = value;
        this.defaultValues = value;
    }

    createSlider(parent: HTMLElement) {
        // Need to recalculate slider min when logarithmic curve
        setAttr(this.parent, { class: 'input-container input-container-big' });
        let min = this.checkNumberCurveValue(this.min);
        let max = this.max
        this.noUiSlider = noUiSlider.create(parent, {
            range: { 'min': min, 'max': max },
            step: this.step,
            start: this.defaultValues,
            connect: 'lower',
        });
    }

    setSliderValue(values: Array<number>) {
        if (values == undefined) {
            this.lastSliderValues = values; // To avoid slider to send new values in change callback
            this.noUiSlider.set(this.defaultValues);
        } else {
            values = this.checkAccuracy(values);
            let slidervalues = this.checkNumberCurve(values);
            this.noUiSlider.set(slidervalues, false);
        }
        this.lastSliderValues = values;
    }
    
    checkSliderCurve(values: Array<number>): Array<number> {
        for (let i = 0; i < values.length; i++) {
            values[i] = this.checkSliderCurveValue(values[i]);
        }
        return values;
    }
    
    power = 3;
    checkSliderCurveValue(value: number): number {
        if (this.curve == 'linear') {
            return value;
        } else if (this.curve == 'logarithmic') {
            let newvalue = Math.pow(value, this.power) / this.max;
            newvalue = this.checkAccuracyValue(newvalue);
            return newvalue;
        } else if (this.curve == 'exponential') {
            let newvalue = Math.pow(value, 1 / this.power) / this.max;
            newvalue = this.checkAccuracyValue(newvalue);
            return newvalue;
        }
    }

    checkNumberCurve(values: Array<number>): Array<number> {
        for (let i = 0; i < values.length; i++) {
            values[i] = this.checkNumberCurveValue(values[i]);
        }
        return values;
    }

    checkNumberCurveValue(value: number): number {
        if (this.curve == 'linear') {
            return value;
        } else if (this.curve == 'logarithmic') {
            return Math.pow(value * this.max, 1 / this.power);
        } else if (this.curve == 'exponential') {
            return Math.pow(value * this.max, this.power);
        }
    }

    checkMinMax(values: Array<number>): Array<number> {
        for (let i = 0; i < values.length; i++) {
            values[i] = this.checkMinMaxValue(values[i]);
        }
        return values;
    }

    checkMinMaxValue(value: number): number {
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

    checkAccuracy(values: Array<number>): Array<number> {
        for (let i = 0; i < values.length; i++) {
            values[i] = this.checkAccuracyValue(values[i]);
        }
        return values;
    }

    checkAccuracyValue(value: number): number {
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
    lastSliderValues: Array<number>;
    onSlider(event: string, funct: Function) {
        this.noUiSlider.on(this.sliderEvent[event], (values: Array<number>, handle) => {
            // let value = values[0];
            values = this.checkAccuracy(values);
            // Allow focus and blur event where the value hasn't changed
            if (values == this.lastSliderValues && event == 'change') return;
            this.lastSliderValues = values;
            values = this.checkSliderCurve(values);
            funct(values, this);
        });
        return this;
    }
}

export class SliderInput extends Slider {

    number: HTMLElement;
    defaultValue: number;

    constructor(parent: HTMLElement, label: string, slideroption: slideroption) {
        super(parent, label, slideroption);
        setAttr(this.parent, { class: 'input-container input-container-big' });        
        this.createSlider(this.parent);
        this.number = el('input.rangenumber.input-parameter', { type: 'number', value: value, min: this.min, max: this.max, step: this.step })
        mount(this.parent, this.number);
        return this;
    }

    setValue(value: number) {
        if (value == undefined) {
            setAttr(this.number, { value: this.defaultValue });
        } else {
            value = this.checkAccuracyValue(value);
            setAttr(this.number, { value: value });
        }
        this.setSliderValue([value]);
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
            let value = this.checkMinMaxValue(evt.target.value);
            value = this.checkAccuracyValue(value);
            if (value == this.lastSliderValue) return;
            this.lastSliderValue = value;
            setAttr(this.number, { value: value });
            let slidervalue = this.checkNumberCurveValue(value);
            this.noUiSlider.set([slidervalue]);
            funct(value, this);
        });
        return this;
    }
}
