
import { Input } from '../Inputs/input';
import { UI } from '../Layers/common';

import { el, mount, setAttr, setStyle } from 'redom';
import * as AColorPicker from 'a-color-picker';
import clone from 'lodash/clone';

/*
  +------------------------------------------------------------------------+
  | COLOR BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export interface coloroption {
	opacity:boolean,
	removable?: boolean,
	color?:Array<number>,
}

export class ColorButton extends Input {

	rgba:Array<number>;
	opacity:boolean;
	callback:Function;
	colorel:HTMLElement;
	coloricon:HTMLElement;
	colorbutton:HTMLElement;

	constructor(parent:HTMLElement, label:string, coloroption:coloroption) {
    	super(parent, label);
		this.opacity = coloroption.opacity;
		this.el = el('div.input-parameter',
			[
				this.colorbutton = el('div.picker-button.color-default-background', {onclick:()=>{this.focus()}},
					this.colorel = el('div.color-background')
				),
				this.coloricon = el('div.icon-color.erase-icon', {onclick:()=>{this.checkErase()}, onmouseenter:()=>{this.mouseEnter()}, onmouseleave:()=>{this.mouseLeave()}},
					[el('span.path1'), el('span.path2'), el('span.path3')]
				)
			]
		);
		mount(this.parent, this.el);
		if (coloroption.removable === false) setStyle(this.coloricon, { display: 'none' });
		if (coloroption.color) this.setValue(coloroption.color);
	}

	checkErase () {
		if (this.rgba !== undefined) this.setValue(undefined, true);
		else this.focus();
	}

	mouseEnter () {
		if (this.rgba !== undefined) this.setIcon('delete');
	}

	mouseLeave () {
		this.setIcon('color');
	}

	setIcon (icon:string) {
		setAttr(this.coloricon, {class:'icon-'+icon+' erase-icon'});
	}

	setValue (rgba:Array<number>, frompicker?:any) {
		if (rgba == undefined) return this.erase(frompicker);
		if (rgba[0] == null) return this.erase(frompicker); // history change
		if (typeof rgba !== 'object') return console.error('Bad color value sent to ColorButton');
		this.rgba = clone(rgba);
		let stringRgba = clone(rgba);
		if (rgba[3] == undefined || !this.opacity) stringRgba[3] = 1;
		let color = 'rgba('+stringRgba[0]+', '+stringRgba[1]+', '+stringRgba[2]+', '+stringRgba[3]+')';
		setStyle(this.colorel, {'background-color':color});
		setAttr(this.coloricon, {active:true});
		if (this.events.change && frompicker) this.events.change(this.rgba);
		return this;
	}

	erase (frompicker?:any) {
		setStyle(this.colorel, { 'background-color':'rgba(0,0,0,0)'});
		setAttr(this.coloricon, {active:false});
		if (this.events.change && frompicker) this.events.change(undefined);
		if (this.events.blur && frompicker) this.events.blur(undefined);
	}

	events:any = {};
	startrgba:any;

	focus () {
		this.startrgba = this.rgba;
		setAttr(this.colorbutton, { active: true });
		colorPicker.setCurrentInput(this);
		if (this.events.focus) this.events.focus(this.rgba);
	}

	blurEvent (picker?:any) {
		if (this.events.blur && picker && this.startrgba != this.rgba) this.events.blur(this.rgba);
		setAttr(this.colorbutton, {active:false});
	}

	on (event:string, funct:Function) {
		this.events[event] = funct;
		return this;
	}
}

/*
  +------------------------------------------------------------------------+
  | COLOR PICKER                                                           |
  +------------------------------------------------------------------------+
*/

export class ColorPicker extends UI {

	back:HTMLElement;
	title:HTMLElement;
	picker:any;
	opacityPicker:HTMLElement;
	palette:Array<string> = [];

	set (palette?:Array<string>) {
		if (typeof palette === 'object') this.palette = palette;
		this.el = el('div', {id:'colorpicker', class:'picker color-picker'},
			[
				el('div.picker-title',
					this.title = el('div.title-text')
				),
				el('div.a-color-picker-palette-background')
			]
		);
		
		mount(document.body, this.el);
		this.picker = AColorPicker.createPicker({
			attachTo: '#colorpicker',
			color: 'green',
			showHSL:false,
			showAlpha:true,
			paletteEditable:true,
			palette:palette,
		});
		this.opacityPicker = document.querySelector('.a-color-picker-alpha');
		this.setEvent();
		this.setBack();
		this.hide();
		return this;
	}

	setBack () {
		this.back = el('div.modal-background', {onclick:() => {this.hidePicker();}});
		setStyle(this.back, {cursor:'auto', 'z-index':199});
		mount(document.body, this.back);
	}

	visible = false;
	hidePicker () {
		if (!this.visible) return;
		this.visible = false;
		setStyle(this.back, {display:'none'});
		this.hide();
		this.currentInput.blurEvent(this.picker);
		this.currentInput = undefined;
	}

	setEvent () {
		this.picker.onchange = (picker) => {
			if (this.currentInput) this.currentInput.setValue(picker.rgba, true);
		};
		this.picker.oncoloradd = (picker, color) => {
			this.palette.push(color);
		}
		this.picker.oncolorremove = (picker, color) => {
			let index = this.palette.indexOf(color);
			this.palette.splice(index, 1);
		}

		window.addEventListener("resize", () => {
			if (this.currentInput) this.setPickerPosition();
		});
	}

	currentInput:ColorButton = null;
	setCurrentInput (input:ColorButton) {
		this.visible = true;
		if (input.rgba == undefined) input.rgba = [0, 0, 0, 1];
		let rgba = clone(input.rgba);
		if (!input.opacity) rgba[3] = 1;
		this.picker.rgba = rgba;
		this.currentInput = input;
		this.setPickerPosition();
		if (input.label) this.title.textContent = input.label.textContent;
		else this.title.textContent = 'Color';
		setStyle(this.back, {display:'block'});
		if (input.opacity) setStyle(this.opacityPicker, {display:'block'});
		else setStyle(this.opacityPicker, {display:'none'});
		this.show();
	}

	setPickerPosition () {
		let pos = this.currentInput.el.getBoundingClientRect();
		let y = Math.min(pos.top - 80, window.innerHeight - 230);
		y = Math.max(y, 0);
		setStyle(this.el, {left: pos.left - 285 + 'px', top: y + 'px'});
	}
}

export let colorPicker = new ColorPicker();
