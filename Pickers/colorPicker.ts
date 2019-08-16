
import { ui_input } from '../Inputs/input';
import { ui } from '../Layers/common';

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
	color?:Array<number>,
}

export interface duoColors {
	main:Array<number>,
	second:Array<number>,
}

export class ui_colorbutton extends ui_input {

	rgba:Array<number>;
	opacity:boolean;
	callback:Function;
	colorel:HTMLElement;
	coloricon:HTMLElement;
	colorbutton:HTMLElement;
	duoColors:duoColors;

	constructor(parent:any, coloroption:coloroption, className:string, duoColors:duoColors) {
    	super();
		this.duoColors = duoColors;
		this.opacity = coloroption.opacity;
		this.input = el('div', {class:' '+className},
			[
				this.colorbutton = el('div.picker-button.color-default-background', {onclick:()=>{this.focus()}},
					this.colorel = el('div.color-background')
				),
				this.coloricon = el('div.icon-color.erase-icon', {onclick:()=>{this.checkErase()}, onmouseenter:()=>{this.mouseEnter()}, onmouseleave:()=>{this.mouseLeave()}},
					[el('span.path1'), el('span.path2'), el('span.path3')]
				)
			]
		);
		mount(parent, this.input);
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
		this.rgba = clone(rgba);
		let stringRgba = clone(rgba);
		if (rgba == undefined) return this.erase(frompicker);
		if (rgba[0] == null) return this.erase(frompicker); // history change
		if (rgba[3] == undefined || !this.opacity) stringRgba[3] = 1;
		let color = 'rgba('+stringRgba[0]+', '+stringRgba[1]+', '+stringRgba[2]+', '+stringRgba[3]+')';
		setStyle(this.colorel, {'background-color':color});
		setStyle(this.coloricon, {'color':colormain});
		if (this.events.change && frompicker) this.events.change(this.rgba);
		return this;
	}

	erase (frompicker?:any) {
		setStyle(this.colorel, {'background-color':colorgrey});
		setStyle(this.coloricon, {'color':colorthirdgrey});
		if (this.events.change && frompicker) this.events.change(undefined);
		if (this.events.blur && frompicker) this.events.blur(undefined);
	}

	events:any = {};
	startrgba:any;

	focus () {
		this.startrgba = this.rgba;
		setStyle(this.colorbutton, {'border-color':colormain})
		colorpicker.setCurrentInput(this);
		if (this.events.focus) this.events.focus(this.rgba);
	}

	blurEvent (picker?:any) {
		if (this.events.blur && picker && this.startrgba != this.rgba) this.events.blur(this.rgba);
		setStyle(this.colorbutton, {'border-color':colorthirdgrey})
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

export class ui_colorpicker extends ui {

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

	currentInput:ui_colorbutton = null;
	setCurrentInput (input:ui_colorbutton) {
		this.visible = true;
		if (input.rgba == undefined) input.rgba = [0, 0, 0, 1];
		let rgba = clone(input.rgba);
		if (!input.opacity) rgba[3] = 1;
		this.picker.rgba = rgba;
		this.currentInput = input;
		this.setPickerPosition();
		this.title.textContent = input.label.textContent;
		setStyle(this.back, {display:'block'});
		if (input.opacity) setStyle(this.opacityPicker, {display:'block'});
		else setStyle(this.opacityPicker, {display:'none'});
		this.show();
	}

	setPickerPosition () {
		let pos = this.currentInput.el.getBoundingClientRect();
		let y = Math.min(pos.top - 80, window.innerHeight - 230);
		y = Math.max(y, 0);
		setStyle(this.el, {left: pos.x - 345 + 'px', top: y + 'px'});
	}
}

export let colorpicker = new ui_colorpicker();
