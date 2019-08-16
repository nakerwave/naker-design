
import { ui_input, inputEvents, defaultwithinput } from './input';

import { el, mount, setAttr, setStyle, setChildren } from 'redom';

/*
  +------------------------------------------------------------------------+
  | TEXT INPUT                                                             |
  +------------------------------------------------------------------------+
*/

/*
  +------------------------------------------------------------------------+
  | RADIO                                                                  |
  +------------------------------------------------------------------------+
*/

export interface radiooption {
	value:string;
	list:Array<string>;
}

export class ui_radio extends ui_input {
	option:Array<string>;
	label:HTMLElement;

  constructor(parent:any, radiooption:radiooption, className:string) {
		super();
		this.el = el('div', { class:'radio '+className })
		mount(parent, this.el);
		setStyle(parent, {height:22 * radiooption.list.length+'px'});
		this.setInput(radiooption);
		return this;
	}

	radiobuttons:Array<any> = [];
	radionodes:Array<any> = [];
	setInput (radiooption:radiooption) {
		this.option = radiooption.list;
		for (let i = 0; i < this.option.length; i++) {
			let label = this.option[i]
			let radiobutton;
			let div = el('div', {class:'siimple-radio'},
				[
					radiobutton = el('input', {type: 'radio', id:label}),
					el('label', {for:label})
				]
			);

			this.radiobuttons.push(radiobutton);
			this.radionodes.push(div);
			let radiolabel = el('div', label, {class:'radio-label'});
			mount(div, radiolabel);
			if (label == radiooption.value) setAttr(radiobutton, {checked:true});
		}
		setChildren(this.el, [this.radionodes]);
	}

	setValue (value:string) {
		if (value == undefined) value = this.option[0];
		for (let i = 0; i < this.option.length; i++) {
			if (value == this.option[i]) setAttr(this.radiobuttons[i], {checked:true});
			else setAttr(this.radiobuttons[i], {checked:false});
		}
	}

	inputEvent:inputEvents = {
		change:'click',
		focus:'mousedown',
		blur:'mouseup',
	};
	on (event:string, funct:Function) {
		for (let i = 0; i < this.radiobuttons.length; i++) {
			((i)=>{
				this.radiobuttons[i].addEventListener(this.inputEvent[event], (evt) => {
					funct(evt.target.id, this);
					this.setValue(evt.target.id);
				});
			})(i)
		}
		return this;
	}
}

/*
  +------------------------------------------------------------------------+
  | RADIO ICON                                                             |
  +------------------------------------------------------------------------+
*/

export interface radioiconoption {
	value:string;
	iconperline:number;
	list:Array<string>;
}

export class ui_radioicon extends ui_input {
	option:Array<string>;
	iconperline:number;
	label:HTMLElement;
	linenumber:number;
	row:any;

  constructor(parent:any, radiooption:radioiconoption, className:string) {
		super();
		this.option = radiooption.list;
		this.iconperline = radiooption.iconperline;
		this.linenumber = Math.ceil(radiooption.list.length/radiooption.iconperline);
		this.el = el('div', { class:'radio '+className })
		mount(parent, this.el);
		setStyle(parent, {height:(this.linenumber*22+2).toString()+'px'});
		setStyle(this.el, {height:(this.linenumber*22).toString()+'px'});
		setStyle(this.el, {'z-index':2, overflow: 'hidden'});
		this.setInput(radiooption);
		return this;
	}

	radiobuttons:Array<any> = [];
	setInput (radiooption:radioiconoption) {
		let width = defaultwithinput/this.iconperline;
		for (let i = 0; i < this.option.length; i++) {
			let label = this.option[i];
			let radiobutton = el('div.radio-icon-button.icon-'+label, {id:label, style:{width:width+'px'}},
				[el('span.path1'), el('span.path2'), el('span.path3')]
			);
			this.radiobuttons.push(radiobutton);
		}
		setChildren(this.el, this.radiobuttons);
		this.setValue(radiooption.value);
	}

	setValue (value:string) {
		if (value == undefined) value = this.option[0];
		for (let i = 0; i < this.option.length; i++) {
			let label = this.option[i];
			if (value == this.option[i]) setAttr(this.radiobuttons[i], {class:'radio-icon-button radio-selected icon-'+label});
			else setAttr(this.radiobuttons[i], {class:'radio-icon-button icon-'+label});
		}
	}

	inputEvent:inputEvents = {
		change:'click',
		focus:'mousedown',
		blur:'mouseup',
	};
	on (event:string, funct:Function) {
		for (let i = 0; i < this.radiobuttons.length; i++) {
			((i)=>{
				let radiobutton = this.radiobuttons[i];
				let value = radiobutton.id;
				radiobutton.addEventListener(this.inputEvent[event], (evt) => {
					funct(value, this);
					this.setValue(value);
				});
			})(i)
		}
		return this;
	}
}
