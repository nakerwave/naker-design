
import { ui_input, inputEvents } from './input';

import { el, mount, setAttr } from 'redom';
import noUiSlider from 'nouislider';

/*
  +------------------------------------------------------------------------+
  | SLIDER                                                                 |
  +------------------------------------------------------------------------+
*/

export interface slideroption {
	value:number;
	max:number;
	min:number;
	step?:number;
	curve?:'logarithmic'|'linear';
}

export class ui_slider extends ui_input {

	label:HTMLElement;
	number:HTMLElement;
	defaultValue:number;
	min:number;
	max:number;
	step:number = 0.01;
	curve:'logarithmic'|'linear' = 'linear';

	noUiSlider:noUiSlider;

  constructor(parent:HTMLElement, label:string, slideroption:slideroption) {
		super(parent, label)
		this.el = parent;
		this.defaultValue = slideroption.value;
		this.min = slideroption.min;
		this.max = slideroption.max;
		if (slideroption.step) this.step = slideroption.step;
		if (slideroption.curve) this.curve = slideroption.curve;
		let value = this.checkAccuracy(slideroption.value);
		this.formerValue = value;
		this.createSlider(parent, value);
		this.number = el('input.rangenumber.input-parameter', { type: 'number', value:value, min:this.min, max:this.max, step:this.step })
		mount(parent, this.number);
		return this;
	}

	createSlider (parent:HTMLElement, value:number) {
		this.noUiSlider = noUiSlider.create(parent, {
          range: {'min': this.min, 'max': this.max},
          step: this.step,
          start: [value],
          connect: 'lower',
        });
	}

	setValue (value:number) {
		if (value == undefined) {
			setAttr(this.number, {value:this.defaultValue});
			this.noUiSlider.set([this.defaultValue]);
		} else {
			value = this.checkAccuracy(value);
			setAttr(this.number, {value:value});
			let slidervalue = this.checkNumberCurve(value);
			this.noUiSlider.set([slidervalue], false);
		}
		this.formerValue = value;
	}

	checkSliderCurve (value:string|number) {
		if (this.curve == 'linear') {
			return value;
		} else if (this.curve == 'logarithmic') {
			let newvalue = parseFloat(value);
			newvalue = Math.pow(newvalue, 2) / this.max;
			newvalue = this.checkAccuracy(newvalue);
			return newvalue.toString();
		}
	}

	checkNumberCurve (value:string|number) {
		if (this.curve == 'linear') {
			return value;
		} else if (this.curve == 'logarithmic') {
			let newvalue = parseFloat(value);
			newvalue = Math.pow(newvalue * this.max, 1/2);
			return newvalue.toString();
		}
	}

	checkMaxMin (value:string) {
		let newvalue = parseFloat(value);
		if (this.min) newvalue = Math.max(this.min, newvalue);
		if (this.max) newvalue = Math.min(this.max, newvalue);
		// Make sure value is not empty which gives a NaN
		if (!newvalue && newvalue !== 0) newvalue = 0;
		// If decimal number, it can be very anoying to change the value we type
		let str = value.toString();
		if (str.indexOf('.') == -1) return newvalue;
		else return value;
	}

	checkAccuracy (value) {
		let accuracy = 1 / this.step;
		return Math.round( value * accuracy) / accuracy;
	}

	inputEvent:inputEvents = {
		change:'update',
		focus:'start',
		blur:'end',
	};
	numberInputEvent:inputEvents = {
		change:'input',
		focus:'focus',
		blur:'blur',
	};
	formerValue:number;
	on (event:string, funct:Function) {
		this.noUiSlider.on(this.inputEvent[event], (values, handle) => {
			let value = values[0];
			value = this.checkAccuracy(value);
			if (value == this.formerValue) return;
			this.formerValue = value;
			value = this.checkSliderCurve(value);
			setAttr(this.number, {value:value});
			funct(parseFloat(value), this);
		});
		this.number.addEventListener(this.numberInputEvent[event], (evt) => {
			let value = this.checkMaxMin(evt.target.value);
			value = this.checkAccuracy(value);
			if (value == this.formerValue) return;
			this.formerValue = value;
			setAttr(this.number, {value:value});
			let slidervalue = this.checkNumberCurve(value);
			this.noUiSlider.set([slidervalue]);
			funct(parseFloat(value), this);
		});
		return this;
	}
}
