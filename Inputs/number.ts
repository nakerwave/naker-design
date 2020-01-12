
import { Input, inputEvents } from './input';

import { el, unmount, mount, setAttr, setStyle } from 'redom';
import merge from 'lodash/merge';

/*
  +------------------------------------------------------------------------+
  | NUMBER                                                               |
  +------------------------------------------------------------------------+
*/

export interface numberoption {
    value?: number,
    unit?: string,
    min?: number,
    max?: number,
    step?: number
    decimal?: number
}

export class NumberInput extends Input {

    unit: any;
    value: number;
    max: number;
    min: number;
    decimal: number;

    constructor(parent: HTMLElement, label: string, number: numberoption) {
        super(parent, label)
        this.el = el('input.input-parameter');
        mount(this.parent, this.el);
        if (number.value) setAttr(this.el, { value: number.value });
        let step = (number.step) ? number.step : 0.1;
        this.value = number.value;
        setAttr(this.el, { type: 'number', step: step, onfocus: () => { this.el.select() } });
        this.setMinMax(number);
        if (number.decimal !== undefined) this.decimal = number.decimal;
        this.setUnit(number);
        this.setEvents();
    }

    setMinMax(number: numberoption) {
        this.min = number.min;
        this.max = number.max;
        // Prevent the correct step, it can add the minimum value to the step
        // if (number.min !== undefined) setAttr(this.el, { min: number.min });
        // if (number.max !== undefined) setAttr(this.el, { max: number.max });
    }

    setUnit(number: numberoption) {
        this.unit = el('div', { class: 'input-unit' });
        this.unit.textContent = number.unit;
        mount(this.el.parentNode, this.unit);

        this.on('focus', () => { setStyle(this.unit, { display: 'none' }) });
        this.on('blur', () => { setStyle(this.unit, { display: 'block' }) });

        this.updateUnit(number.unit);
    }

    updateUnit(unit: string) {
        this.unit.textContent = unit;
    }

    valueChangedTimeout: any;
    setValue(value: number) {
        if (value == undefined) return setAttr(this.el, { value: 0 });
        if (value == this.el.value) return this;
        this.value = value;
        this.checkDecimal();
        setAttr(this.el, { value: this.value });
        if (this.valueChangedTimeout) clearTimeout(this.valueChangedTimeout);
        setAttr(this.el, { changed: true });
        this.valueChangedTimeout = setTimeout(() => { setAttr(this.el, { changed: false }) }, 100);
        return this;
    }

    checkDecimal() {
        if (this.value) {
            let abs = Math.abs(this.value);
            let decimal = abs - Math.floor(abs);
            if (decimal && this.decimal) {
                let highvalue = this.value * Math.pow(10, this.decimal);
                let signvalue = (this.value > 0) ? Math.floor(highvalue) : Math.ceil(highvalue);
                this.value = signvalue / Math.pow(10, this.decimal);
            }
        }
        if (!this.value && this.value !== 0) this.value = 0;
    }

    checkMaxMin() {
        let value = parseFloat(this.el.value);
        if (this.min) value = Math.max(this.min, value);
        if (this.max) value = Math.min(this.max, value);
        // Make sure value is not empty which gives a NaN
        if (!this.value && this.value !== 0) this.value = 0;
        // If decimal number, it can be very anoying to change the value we type
        // str.length > 2 so that we can have empty value
        let str = this.value.toString();
        if (str.indexOf('.') == -1 && str.length > 2) setAttr(this.el, { value: this.value });
        this.value = value;
    }

    setEvents() {
        this.el.addEventListener('blur', (evt) => {
            setAttr(this.el, { value: this.value });
        });
        this.el.addEventListener("keyup", (evt) => {
            event.preventDefault();
            if (evt.keyCode === 13) {
                this.checkMaxMin();
                this.checkDecimal();
                for (let i = 0; i < this.enterkeyFunctions.length; i++) {
                    this.enterkeyFunctions[i](this.value, this, evt);
                }
            }
        });
    }

    inputEvent: inputEvents = {
        change: 'input',
        focus: 'focus',
        blur: 'blur',
        click: 'click',
        enterkey: 'enterkey',
    };
    enterkeyFunctions: Array<Function> = [];
    on(event: string, funct: Function) {
        if (event == 'enterkey') this.enterkeyFunctions.push(funct);
        this.el.addEventListener(this.inputEvent[event], (evt) => {
            this.value = parseFloat(this.el.value);
            // Useless to check value when focus + prevent auto selection on focus
            if (event != 'focus') {
                this.checkMaxMin();
                this.checkDecimal();
            }
            funct(this.value, this, evt);
        });
        return this;
    }
}

/*
  +------------------------------------------------------------------------+
  | VECTOR                                                                 |
  +------------------------------------------------------------------------+
*/

interface vectorvalue {
    x?: number;
    y?: number;
    z?: number;
}
export class VectorInput extends Input {

    x: NumberInput;
    y: NumberInput;
    z: NumberInput;

    constructor(parent: HTMLElement, label: string, numberoption: numberoption) {
        super(parent, label);
        let vectorContainer = el('div.vector-container')
        mount(this.parent, vectorContainer);
        let i = 0;
        for (let key in { x: 0, y: 0, z: 0 }) {
            let vectoroption = merge(numberoption, { value: 0, unit: key.toUpperCase(), decimal: 2 });
            this[key] = new NumberInput(parent, '', vectoroption);
            unmount(parent, this[key].parent);
            mount(vectorContainer, this[key].el);
            setAttr(this[key].el, { class: 'vector-input' });
            i++;
        }
    }

    on(event: string, funct: Function) {
        for (let key in { x: 0, y: 0, z: 0 }) {
            ((key) => {
                this[key].on(event, (number) => {
                    let change = {};
                    change[key] = number;
                    funct(change);
                });
            })(key)
        }
        return this;
    }

    setValue(value: vectorvalue) {
        if (value.x !== undefined) this.x.setValue(value.x);
        if (value.y !== undefined) this.y.setValue(value.y);
        if (value.z !== undefined) this.z.setValue(value.z);
    }
}
