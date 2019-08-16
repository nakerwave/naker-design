
import { defaultwithinput, ui_input, ui_imagebutton, ui_button } from './input';
import { asset } from '../../viewer/tools/loader';
import { _system } from '../service/editintale';

import { el, mount, setAttr, setStyle } from 'redom';
import find from 'lodash/find';
import remove from 'lodash/remove';

/*
  +------------------------------------------------------------------------+
  | ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class ui_assetbutton extends ui_input {

	label:HTMLElement;
	url:string;
	type:asset["type"];
	callback:Function;
	image:any;
	text:any;
	assetbutton:any;
	asseticon:any;

	constructor(parent:any, assetoption:asset, className:string) {
    super();
		this.url = assetoption.url;
		this.type = assetoption.type;
		this.el = el('div', {class:' '+className},
			[
				this.assetbutton = el('div.picker-button', {onclick:()=>{this.focus()}},
					[
						this.image = el('img', { src: '', style: {width:'100%', height:'100%', display:'none'} }),
						this.text = el('div', { style: {width:'100%', height:'100%', display:'none', 'overflow': 'hidden'}})
					]
				),
				this.asseticon = el('div.icon-texture.erase-icon', {onclick:()=>{this.checkErase()}, onmouseenter:()=>{this.mouseEnter()}, onmouseleave:()=>{this.mouseLeave()}}, [el('span.path1'),el('span.path2'),el('span.path3')])
			]
		);
		mount(parent, this.el);
		if (assetoption.url) this.setValue(assetoption.url);
		else this.erase();
	}

	checkErase () {
		if (this.url !== undefined) this.setValue(undefined, true);
		else this.focus();
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

	erase (frompicker?:any) {
		setStyle(this.image, {display:'none'});
		setStyle(this.text, {display:'none'});
		setStyle(this.asseticon, {'color':colorthirdgrey});
		if (this.events.change && frompicker) this.events.change(undefined);
		if (frompicker) this.blurEvent();
	}

	events:any = {};
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

	on (event:string, funct:Function) {
		this.events[event] = funct;
		return this;
	}
}

/*
  +------------------------------------------------------------------------+
  | IMAGE ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class ui_imageassetbutton extends ui_input {

	url:string;
	type:asset["type"];
	callback:Function;
	image:HTMLElement;
	text:HTMLElement;
	hover:HTMLElement;
	label:HTMLElement;

	constructor(parent:any, assetoption:asset, className:string) {
    super();
		this.url = assetoption.url;
		this.type = assetoption.type;
		this.el = el('div', {class:'input-asset-image '+className, onclick:()=>{this.focus()}},
			[
				this.hover = el('div.image-hover', el('div.image-hover-text', 'Replace '+this.type)),
				this.image = el('img', { src: '', style: {width:defaultwithinput+'px', 'background-size': 'contain', display:'none'} }),
				this.text = el('div.image-hover-text', '')
			]
		);
		mount(parent, this.el);
		this.setValue(assetoption.url);
	}

	setValue (url:string, frompicker?:any, avoidloop?:boolean) {
		if (url !== undefined && url !== null) {
			// Asset not loaded before or not currently loading
			if (_system.loader.successes[this.type+url] == undefined && _system.loader[this.type][url] == undefined && !avoidloop) return this.loadAsset(url, frompicker);
			let image = url.substr(url.lastIndexOf('/') + 1);
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
			this.hover.textContent = 'Replace '+this.type;
		} else {
			setStyle(this.text, {display:'block'});
			this.text.textContent = 'No '+this.type;
			this.hover.textContent = 'Add '+this.type;
		}
		this.url = url;
		if (this.events.change && frompicker) this.events.change(url);
		return this;
	}

	loadAsset (url:string, frompicker:any) {
		_system.loader.getAsset(this.type, url, () => {
			assetpicker.waitingAsset = this.type;
			assetpicker.addWaitedAssetButton(url, url);
			this.setValue(url, frompicker, true);
		});
	}

	events:any = {};
	starturl:string;
	focus () {
		this.starturl = this.url;
		if (this.events.focus) this.events.focus(this.url, this);
		assetpicker.setCurrentInput(this);
	}

	blurEvent () {
		if (this.events.blur && this.starturl != this.url) this.events.blur(this.url, this);
	}

	on (event:string, funct:Function) {
		this.events[event] = funct;
		return this;
	}
}


/*
  +------------------------------------------------------------------------+
  | TEXT ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class ui_textassetbutton extends ui_input {

	url:string;
	type:asset["type"];
	callback:Function;
	text:HTMLElement;
	hover:HTMLElement;
	label:HTMLElement;
	asseticon:HTMLElement;

	constructor(parent:any, assetoption:asset, className:string) {
    super();
		this.url = assetoption.url;
		this.type = assetoption.type;
		this.el = el('div', {class:'input-asset-text '+className, onclick:()=>{this.focus()}},
			[
				this.hover = el('div.text-hover', 'Replace'),
				this.text = el('div.text-asset-name', '')
			],
			this.asseticon = el('div.icon-'+this.type+'.text-erase-icon', {onclick:(evt)=>{this.checkErase(evt)}, onmouseenter:()=>{this.mouseEnter()}, onmouseleave:()=>{this.mouseLeave()}}, [el('span.path1'),el('span.path2'),el('span.path3')])
		);
		mount(parent, this.el);
		this.setValue(assetoption.url);
	}

	checkErase (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		if (this.url !== undefined) this.setValue(undefined, true);
		else this.focus();
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

	setValue (url:string, frompicker?:any, avoidloop?:boolean) {
		if (url !== undefined && url !== null) {
			// Asset not loaded before or not currently loading
			if (_system.loader.successes[this.type+url] == undefined && _system.loader[this.type][url] == undefined && !avoidloop) return this.loadAsset(url, frompicker);
			let text = url.substr(url.lastIndexOf('/') + 1);
			let asset = find(assetpicker.assetImages[this.type], (o) => { return o.url == url; });
			if (asset) text = asset.thumbnail;
			this.text.textContent = text;
			this.hover.textContent = 'Replace';
			setStyle(this.asseticon, {'color':colormain});
		} else {
			this.text.textContent = 'No '+this.type;
			this.hover.textContent = 'Add '+this.type;
			setStyle(this.asseticon, {'color':colorthirdgrey});
		}
		this.url = url;
		if (this.events.change && frompicker) this.events.change(url);
		return this;
	}

	loadAsset (url:string, frompicker:any) {
		_system.loader.getAsset(this.type, url, () => {
			assetpicker.waitingAsset = this.type;
			assetpicker.addWaitedAssetButton(url, url);
			this.setValue(url, frompicker, true);
		});
	}

	events:any = {};
	starturl:string;
	focus () {
		this.starturl = this.url;
		if (this.events.focus) this.events.focus(this.url, this);
		assetpicker.setCurrentInput(this);
	}

	blurEvent () {
		if (this.events.blur && this.starturl != this.url) this.events.blur(this.url, this);
	}

	on (event:string, funct:Function) {
		this.events[event] = funct;
		return this;
	}
}

/*
  +------------------------------------------------------------------------+
  | ASSET PICKER                                                           |
  +------------------------------------------------------------------------+
*/

// Texture which are images
export let overlayImages:Array<asset["type"]> = ['albedo', 'ambient', 'specular', 'emissive', 'bump', 'opacity', 'reflectivity', 'reflection', 'particle', 'image', 'heightmap'];
export let overlayAlpha = {'albedo':false, 'ambient':false, 'specular':false, 'emissive':false, 'bump':false, 'opacity':true, 'reflectivity':false, 'reflection':false, 'particle':false, 'image':true, 'heightmap':false};

export class ui_assetpicker extends ui_input {
	back:HTMLElement;
	title:HTMLElement;

	constructor () {
		super();
		this.el = el('div', {id:'assetpicker', class:'picker asset-picker editor-scroll'});

		mount(document.body, this.el);
		this.hide();
		return this;
	}

	currentInput:ui_assetbutton|ui_imageassetbutton|ui_textassetbutton;
	setCurrentInput (input:ui_assetbutton|ui_imageassetbutton|ui_textassetbutton) {
		this.currentInput = input;
		this.setAssetList(input.type);
		this.show();
		this.addAssetMode = false;
		pickerChannel.publish('focus', this);
		this.waitingAsset = this.type;
		this.waitingInput = this.currentInput;
	}

	assetButtons:any = {};
	assetImages:any = {};
	initAllAsset (assetimage:any) {
		// Make sure we have correct type saved
		for (let key in assetimage) {
		   if (_system.loader.assetTypeList.indexOf(key) != -1) this.assetImages[key] = assetimage[key];
		}
		this.addDefaultCubeTexture();
	}

	addDefaultCubeTexture () {
		let defaultList = [
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/blenderSpecularHDR.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/blender.jpg'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/ennisSpecularHDR.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/ennis.jpg'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/garageSpecularHDR.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/garage.jpg'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/graySpecularHDR.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/grey.jpg'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/indoorSpecularHDR.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/indoor.jpg'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/nightSpecularHDR.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/night.jpg'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/day.env', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Day.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/dusk.env', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Dusk.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/environment.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/City_1.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/night_bridge_1k.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/City_2.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/shanghai_bund_1k.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/City_3.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/environment.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Field_1.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/delta_2_1k.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Field_2.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/matprev_env_Cover.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Park_1.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/tiergarten_1k.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Park_2.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/sunny_vondelpark_1k.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Park_3.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/kloofendal_48d_partly_cloudy_1k.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Hills.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/misty_pines_1k.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Misty_Pine.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/skate_park_1k.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Skate_park.png'},
			{url:'https://d2uret4ukwmuoe.cloudfront.net/hdr/fireplace_1k.dds', thumbnail:'https://d2uret4ukwmuoe.cloudfront.net/hdr/Fireplace.png'},
		];
		// Only create button so that it doesn't get saved in project
		this.initAssetType('cubetexture');
		for (let i = 0; i < defaultList.length; i++) {
			let asset = defaultList[i];
			this.assetButtons['cubetexture'].push(this.addButton('cubetexture', asset.url, asset.thumbnail));
		}
	}

	assetperline = 2;
	type:asset["type"];
	setAssetList (type:asset["type"]) {
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

	checkTypeButton (type:asset["type"]) {
		if (overlayImages.indexOf(type) == -1) {
			if (!this.assetButtons[type]) this.initAssetType(type);
		} else {
			for (let i = 0; i < overlayImages.length; i++) {
				if (!this.assetButtons[overlayImages[i]]) this.initAssetType(overlayImages[i]);
			}
		}
	}

	initAssetType (type:asset["type"]) {
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

	setAddAssetMode (type:asset["type"], callback:Function) {
		this.addAssetFunction = callback;
		this.addAssetMode = true;
		this.type = type;
		this.show();
		pickerChannel.publish('focus', this);
		this.setAssetList(type);
	}

	waitingAsset:asset["type"] = null;
	waitingInput:ui_assetbutton|ui_imageassetbutton|ui_textassetbutton;
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
	addButton (type:asset["type"], url:string, image:string) {
		let button;
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
			pickerChannel.publish('blur', this);
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

	deleteAsset (button:ui_imagebutton, type:asset["type"], key:string) {
		let index = this.assetButtons[type].indexOf(button);
		if (index != -1) this.assetButtons[type].splice(index, 1);
		// As we load asset only if needed, success can be undefined
		if (_system.loader.success[key]) {
			for (let i = 0; i < _system.loader.success[key].length; i++) {
				_system.loader.success[key][i](undefined);
			}
		}
		if (this.currentInput) {
			if (key == this.currentInput.url) this.currentInput.setValue(undefined);
		}
		delete _system.loader.success[key];
		delete _system.loader[type][key];
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
