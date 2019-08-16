
import { defaultwithinput, ui_input, ui_imagebutton, ui_button } from '../Inputs/input';
import { ui } from '../Layers/common';

import { el, mount, setAttr, setStyle } from 'redom';
import find from 'lodash/find';
import remove from 'lodash/remove';

export interface asset {
  type:string,
  url:string
};

export interface assetEvents {
	change?:Function,
	focus?:Function,
  blur?:Function,
};

export class ui_assetinput extends ui_input {
	url:string;
	type:string;

	constructor(assetoption:asset) {
		super();
		this.url = assetoption.url;
		this.type = assetoption.type;
	}

	getThumbnail (url:string) {
		let asset = find(assetpicker.assetImages[this.type], (o:asset) => { return o.url == url; });
		if (asset) return asset.thumbnail;
		else return url;
	}

	setValue (url:string, frompicker:boolean) {
		this._setValue(url, frompicker);
	}

	_setValue (url:string, frompicker:boolean) {
		this.url = url;
		if (this.events.change && frompicker) this.events.change(url);
		let thumbnail = this.getThumbnail(url);
		return thumbnail;
	}

	events:assetEvents = {};
	starturl:string;
	focus () {
		this.starturl = this.url;
		if (this.events.focus) this.events.focus(this.url, this);
		assetpicker.setCurrentInput(this);
	}

	blurEvent () {
		if (this.events.blur && this.starturl != this.url) this.events.blur(this.url, this);
		// In order to avoid waitedAsset changing last selected texture
		assetpicker.currentInput = undefined;
	}

	on (event:'focus'|'blur'|'change', funct:Function) {
		this.events[event] = funct;
		return this;
	}

	checkErase (evt:Event) {
		evt.stopPropagation();
		evt.preventDefault();
		if (this.url !== undefined) this.setValue(undefined, true);
		else this.focus();
	}

}

/*
  +------------------------------------------------------------------------+
  | ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class ui_assetbutton extends ui_assetinput {

	image:HTMLElement;
	text:HTMLElement;
	assetbutton:HTMLElement;
	asseticon:HTMLElement;

	constructor(parent:HTMLElement, assetoption:asset, className:string) {
    super(assetoption);
		this.el = el('div', {class:' '+className},
			[
				this.assetbutton = el('div.picker-button', {onclick:()=>{this.focus()}},
					[
						this.image = el('img', { src: '', style: {width:'100%', height:'100%', display:'none'} }),
						this.text = el('div', { style: {width:'100%', height:'100%', display:'none', 'overflow': 'hidden'}})
					]
				),
				this.asseticon = el('div.icon-texture.erase-icon', {onclick:(evt)=>{this.checkErase(evt)}, onmouseenter:()=>{this.mouseEnter()}, onmouseleave:()=>{this.mouseLeave()}}, [el('span.path1'),el('span.path2'),el('span.path3')])
			]
		);
		mount(parent, this.el);
		if (assetoption.url) this.setValue(assetoption.url);
	}

	setValue (url:string, frompicker?:any) {
		if (url !== undefined && url !== null) {
			let image = url;
			let asset = find(assetpicker.assetImages[this.type], (o) => { return o.url == url; });
			if (asset) image = asset.thumbnail;
			if (image.indexOf('http') != -1) {
				setStyle(this.image, {display:'block'});
				setStyle(this.text, {display:'none'});
				setAttr(this.image, {src:image});
			} else {
				setStyle(this.text, {display:'block'});
				setStyle(this.image, {display:'none'});
				this.text.textContent = image;
			}
			setStyle(this.asseticon, {'color':colormain});
		} else {
			this.erase(frompicker);
		}
		this.url = url;
		if (this.events.change && frompicker) this.events.change(url);
		return this;
	}

	mouseEnter () {
		if (this.url !== undefined) this.setIcon('delete');
	}

	mouseLeave () {
		this.setIcon('texture');
	}

	setIcon (icon:string) {
		setAttr(this.asseticon, {class:'icon-'+icon+' erase-icon'});
	}

	erase (frompicker?:any) {
		setStyle(this.image, {display:'none'});
		setStyle(this.text, {display:'none'});
		setStyle(this.asseticon, {'color':colorthirdgrey});
		if (this.events.change && frompicker) this.events.change(undefined);
		if (frompicker) this.blurEvent();
	}
}

/*
  +------------------------------------------------------------------------+
  | IMAGE ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class ui_imageassetbutton extends ui_assetinput {

	image:HTMLElement;
	text:HTMLElement;
	hover:HTMLElement;
	label:HTMLElement;
	container:HTMLElement;

	constructor(parent:HTMLElement, assetoption:asset, className:string) {
    	super(assetoption);
		this.el = el('div', {class:'input-asset-image '+className, onclick:()=>{this.focus()}},
			[
				this.hover = el('div.image-hover', el('div.image-hover-text', 'Replace '+this.type)),
				this.image = el('img', { src: '', style: {width:defaultwithinput+'px', 'background-size': 'contain', display:'none'} }),
				this.text = el('div.image-hover-text', '')
			]
		);
		mount(parent, this.el);
		if (assetoption.url) this.setValue(assetoption.url);
	}


	setValue (url:string, frompicker?:any) {
		let thumbnail = this._setValue(url, frompicker);
		if (url !== undefined && url !== null) {
			// Asset not loaded before or not currently loading
			let image:string;
			if (!thumbnail) image = url.substr(url.lastIndexOf('/') + 1);
			else image = image.substr(image.lastIndexOf('/') + 1);
			if (image.indexOf('http') != -1) {
				setStyle(this.image, {display:'block'});
				setStyle(this.text, {display:'none'});
				setAttr(this.image, {src:image});
			} else {
				setStyle(this.text, {display:'block'});
				setStyle(this.image, {display:'none'});
				this.text.textContent = image;
			}
			this.hover.textContent = 'Replace '+this.type;
		} else {
			setStyle(this.text, {display:'block'});
			this.text.textContent = 'No '+this.type;
			this.hover.textContent = 'Add '+this.type;
		}
		return this;
	}
}


/*
  +------------------------------------------------------------------------+
  | TEXT ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class ui_textassetbutton extends ui_assetinput {

	text:HTMLElement;
	hover:HTMLElement;
	label:HTMLElement;
	asseticon:HTMLElement;

	constructor(parent:HTMLElement, assetoption:asset, className:string) {
    super(assetoption);
		this.el = el('div', {class:'input-asset-text '+className, onclick:()=>{this.focus()}},
			[
				this.hover = el('div.text-hover', 'Replace'),
				this.text = el('div.text-asset-name', '')
			],
			this.asseticon = el('div.icon-'+this.type+'.text-erase-icon', {onclick:(evt)=>{this.checkErase(evt)}, onmouseenter:()=>{this.mouseEnter()}, onmouseleave:()=>{this.mouseLeave()}}, [el('span.path1'),el('span.path2'),el('span.path3')])
		);
		mount(parent, this.el);
		if (assetoption.url) this.setValue(assetoption.url);
	}

	mouseEnter () {
		if (this.url !== undefined) this.setIcon('delete');
	}

	mouseLeave () {
		this.setIcon(this.type);
	}

	setIcon (icon:string) {
		setAttr(this.asseticon, {class:'icon-'+icon+' text-erase-icon'});
	}

	setValue (url:string, frompicker?:any) {
		let thumbnail = this._setValue(url, frompicker);
		if (url !== undefined && url !== null) {
			let text:string;
			// Asset not loaded before or not currently loading
			if (!thumbnail) text = url.substr(url.lastIndexOf('/') + 1);
			else text = thumbnail;
			this.text.textContent = text;
			this.hover.textContent = 'Replace';
			setStyle(this.asseticon, {'color':colormain});
		} else {
			this.text.textContent = 'No '+this.type;
			this.hover.textContent = 'Add '+this.type;
			setStyle(this.asseticon, {'color':colorthirdgrey});
		}
		return this;
	}
}

/*
  +------------------------------------------------------------------------+
  | ASSET PICKER                                                           |
  +------------------------------------------------------------------------+
*/

// Texture which are images
export let overlayImages:Array<string> = ['albedo', 'ambient', 'specular', 'emissive', 'bump', 'opacity', 'reflectivity', 'reflection', 'particle', 'image', 'heightmap'];
export let overlayAlpha = {'albedo':false, 'ambient':false, 'specular':false, 'emissive':false, 'bump':false, 'opacity':true, 'reflectivity':false, 'reflection':false, 'particle':false, 'image':true, 'heightmap':false};

export class ui_assetpicker extends ui {
	back:HTMLElement;
	title:HTMLElement;

	constructor () {
		super();
		this.el = el('div', {id:'assetpicker', class:'picker asset-picker editor-scroll'});

		mount(document.body, this.el);
		this.hide();
		return this;
	}

	currentInput:ui_assetinput;
	setCurrentInput (input:ui_assetinput) {
		this.currentInput = input;
		this.setAssetList(input.type);
		this.show();
		this.addAssetMode = false;
		this.waitingAsset = this.type;
		this.waitingInput = this.currentInput;
	}

	assetButtons:any = {};
	assetImages:any = {};

	assetperline = 2;
	type:string;
	setAssetList (type:string) {
		this.type = type;
		this.hideAsset();
		this.checkTypeButton(type);
		// Show all assets image only if overlayImages,
		// models, videos and sounds stays appart because you can't replace a model by an image
		if (overlayImages.indexOf(type) == -1) {
			for (let i = 0; i < this.assetButtons[type].length; i++) {
				this.assetButtons[type][i].show();
			}
		} else {
			for (let i = 0; i < overlayImages.length; i++) {
		    let keytype = overlayImages[i];
				for (let i = 0; i < this.assetButtons[keytype].length; i++) {
					this.assetButtons[keytype][i].show();
				}
			}
		}
		return this;
	}

	checkTypeButton (type:string) {
		if (overlayImages.indexOf(type) == -1) {
			if (!this.assetButtons[type]) this.initAssetType(type);
		} else {
			for (let i = 0; i < overlayImages.length; i++) {
				if (!this.assetButtons[overlayImages[i]]) this.initAssetType(overlayImages[i]);
			}
		}
	}

	initAssetType (type:string) {
		this.assetButtons[type] = [];
		if (this.assetImages[type] == undefined) this.assetImages[type] = [];
		for (let i = 0; i < this.assetImages[type].length; i++) {
			let asset = this.assetImages[type][i];
			this.assetButtons[type].push(this.addButton(type, asset.url, asset.thumbnail));
		}
	}

	hideAsset () {
		for (let key in this.assetButtons) {
			for (let i = 0; i < this.assetButtons[key].length; i++) {
			   this.assetButtons[key][i].hide();
			}
		}
	}

	setAddAssetMode (type:string, callback:Function) {
		this.addAssetFunction = callback;
		this.addAssetMode = true;
		this.type = type;
		this.show();
		this.setAssetList(type);
	}

	waitingAsset:string = null;
	waitingInput:ui_assetinput;
	addWaitedAssetButton (url:string, image:string) {
		if (this.waitingAsset == null) return;
		this.checkTypeButton(this.waitingAsset);
		let asset = find(this.assetImages[this.waitingAsset], (o) => { return o.url == url; });
		if (asset == undefined) {
			this.assetButtons[this.waitingAsset].push(this.addButton(this.waitingAsset, url, image));
			this.assetImages[this.waitingAsset].push({url:url, thumbnail:image});
		}
		if (this.waitingInput) {
			this.waitingInput.setValue(url, true);
			this.waitingInput.blurEvent(); // Blur event to force push state
		}
		this.eraseCurrent();
	}

	addAssetMode = false;
	addAssetFunction:Function;
	addButton (type:string, url:string, image:string) {
		let button:ui_imagebutton|ui_button;
		if (image.indexOf('http') != -1) {
			// If opacity we add the opacity background
			if (type == 'opacity') {
				button = new ui_imagebutton(this.el, image, 'asset-button color-default-background');
			} else {
				button = new ui_imagebutton(this.el, image, 'asset-button');
			}
		} else {
			button = new ui_button(this.el, {ui:'text', text:image}, 'asset-button');
		}

		button.on('click', () => {
			if (this.addAssetMode) this.addAssetFunction(url);
			else this.currentInput.setValue(url, true);
			this.hidePicker();
			this.eraseCurrent();
		});
		let deletebutton = new ui_button(button.el, {ui:'icon', text:'delete'}, 'delete-asset-button');
		deletebutton.on('click', (e) => {
			e.stopPropagation();
			this.deleteAsset(button, type, image);
		});
		return button;
	}

	onAssetDeleted:Function;
	deleteAsset (button:ui_imagebutton|ui_button, type:string, key:string) {
		let index = this.assetButtons[type].indexOf(button);
		if (index != -1) this.assetButtons[type].splice(index, 1);
		if (this.onAssetDeleted) this.onAssetDeleted(key)
		if (this.currentInput) {
			if (key == this.currentInput.url) this.currentInput.setValue(undefined, true);
		}
		remove(this.assetImages[type], (n) => {
		  return n.url == key;
		});
		button.destroy();
		this.setAssetList(type);
	}

	eraseCurrent () {
		this.currentInput = undefined;
		this.waitingInput = null;
		this.waitingAsset = null;
	}

	hidePicker () {
		this.hide();
		this.currentInput = undefined;
	}
}

export let assetpicker = new ui_assetpicker();
