
import { Input, inputEvents } from './input';

import { el, mount, setAttr } from 'redom';

/*
  +------------------------------------------------------------------------+
  | TEXT INPUT                                                             |
  +------------------------------------------------------------------------+
*/

export class TextInput extends Input {
	
	value:string;

  constructor(parent:HTMLElement, label:string, text:string, className?:string) {
		super(parent, label)
		if (!className) className = 'input-parameter input-text'
		this.el = el('input', {class:className});
	  	mount(this.parent, this.el);
		setAttr(this.el, { type: 'text', placeholder:text.toString(), onfocus:()=>{this.el.select()} });
		this.value = text.toString();
		this.setEvents();
		return this;
	}

	valueChangedTimeout:any;
	setValue (value:string) {
		if (value == undefined) return setAttr(this.el, {value: ''});
		if (value == this.el.value) return this;
		this.value = value.toString();
		setAttr(this.el, {value: value});
		if (this.valueChangedTimeout) clearTimeout(this.valueChangedTimeout);
		setAttr(this.el, {changed:true});
		this.valueChangedTimeout = setTimeout(()=>{setAttr(this.el, {changed:false})}, 100);
		return this;
	}

	setPlaceholder (text:string) {
		setAttr(this.el, {value: ''});
		setAttr(this.el, {placeholder:text.toString()});
	}

	setEvents () {
		this.el.addEventListener('input', (evt) => {
			this.value = evt.target.value;
		});
		this.el.addEventListener("keyup", (evt) => {
			event.preventDefault();
			if (evt.keyCode === 13) {
				this.value = evt.target.value;
				for (let i = 0; i < this.enterkeyFunctions.length; i++) {
					this.enterkeyFunctions[i](this.value, this, evt);
				}
			}
		});
	}

	inputEvent:inputEvents = {
		change:'change',
		input:'input',
		focus:'focus',
		blur:'blur',
		click:'click',
		enterkey:'enterkey',
	};
	changeFunctions:Array<Function> = [];
	enterkeyFunctions:Array<Function> = [];
	on (event:string, funct:Function) {
		if (event == 'change') this.changeFunctions.push(funct);
		if (event == 'enterkey') this.enterkeyFunctions.push(funct);
		this.el.addEventListener(this.inputEvent[event], (evt) => {
			funct(evt.target.value, this, evt);
		});
		if (event == 'click') {
			this.el.addEventListener('contextmenu', (evt) => {
				evt.preventDefault();
				funct(evt.target.value, this, evt);
			}, false);
		}
		return this;
	}
}

/*
  +------------------------------------------------------------------------+
  | PARAGRAPH INPUT                                                        |
  +------------------------------------------------------------------------+
*/

export class ParagraphInput extends Input {
	label:HTMLElement;
	value:string;
	max = 300;

  constructor(parent:HTMLElement, label:string, text:string, className?:string) {
		super(parent, label);
		if (this.label) setAttr(this.label, {class:'input-label input-label-paragraph'});
		if (!className) className = 'input-paragraph editor-scroll';
		this.el = el('textarea', {class:'siimple-input '+className, maxlength:this.max});
		mount(this.parent, this.el);
		setAttr(this.el, { placeholder:text.toString() });
		this.value = text.toString();
		this.setEvents();
		this.setCount();
		return this;
	}

	count:any;
	setCount () {
		this.count = el('div', {class:'input-count'});
		mount(this.el.parentNode, this.count);
	}

	setValue (value:string) {
		if (value == undefined) return setAttr(this.el, {value: ''});
		if (value == this.el.value) return this;
		this.value = value.toString();
		setAttr(this.el, {value: value});
		setAttr(this.el, { changed: true });
		setTimeout(() => { setAttr(this.el, { changed: false }) }, 200);
		this.count.textContent = this.value.length + '/' + this.max;
		return this;
	}

	setPlaceholder (text:string) {
		setAttr(this.el, {value: ''});
		setAttr(this.el, {placeholder:text.toString()});
	}

	setEvents () {
		this.el.addEventListener('input', (evt) => {
			this.value = evt.target.value;
			this.count.textContent = this.value.length + '/' + this.max;
		});
		this.el.addEventListener("keyup", (evt) => {
			event.preventDefault();
			if (evt.keyCode === 13) {
				this.value = evt.target.value;
				for (let i = 0; i < this.enterkeyFunctions.length; i++) {
					this.enterkeyFunctions[i](this.value, this, evt);
				}
			}
		});
	}

	inputEvent:inputEvents = {
		change:'change',
		input:'input',
		focus:'focus',
		blur:'blur',
		click:'click',
		enterkey:'enterkey',
	};
	changeFunctions:Array<Function> = [];
	enterkeyFunctions:Array<Function> = [];
	on (event:string, funct:Function) {
		if (event == 'change') this.changeFunctions.push(funct);
		if (event == 'enterkey') this.enterkeyFunctions.push(funct);
		this.el.addEventListener(this.inputEvent[event], (evt) => {
			funct(evt.target.value, this, evt);
		});
		if (event == 'click') {
			this.el.addEventListener('contextmenu', (evt) => {
				evt.preventDefault();
				funct(evt.target.value, this, evt);
			}, false);
		}
		return this;
	}
}
