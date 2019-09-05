
import { defaultwithinput, Input } from '../Inputs/input';
import { UI } from '../Layers/common';

import { el, mount, setAttr, setStyle, unmount } from 'redom';
import find from 'lodash/find';
import remove from 'lodash/remove';

export interface asset {
  type:string,
  url:string,
};

export interface assetEvents {
	change?:Function,
	focus?:Function,
  blur?:Function,
};

export class BaseAssetButton extends Input {
	url:string;
	type:string;

	constructor(parent:HTMLElement, label:string, assetoption:asset) {
		super(parent, label);
		this.url = assetoption.url;
		this.type = assetoption.type;
	}

	getThumbnail (url:string) {
		let asset = find(assetPicker.thumbnails[this.type], (o:asset) => { return o.url == url; });
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
		assetPicker.setCurrentInput(this);
	}

	blurEvent () {
		if (this.events.blur && this.starturl != this.url) this.events.blur(this.url, this);
		// In order to avoid waitedAsset changing last selected texture
		assetPicker.currentInput = undefined;
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

export class AssetButton extends BaseAssetButton {

	image:HTMLElement;
	text:HTMLElement;
	assetbutton:HTMLElement;
	asseticon:HTMLElement;

	constructor(parent:HTMLElement, label:string, assetoption:asset) {
        super(parent, label, assetoption);
		this.el = el('div.input-parameter',
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
		mount(this.parent, this.el);
		if (assetoption.url) this.setValue(assetoption.url);
    }

	setValue (url:string, frompicker?:any) {
		let thumbnail = this._setValue(url, frompicker);
		if (url !== undefined && url !== null) {
			let image = url;
			if (thumbnail) image = thumbnail;
			if (image.indexOf('http') != -1) {
				setStyle(this.image, {display:'block'});
				setStyle(this.text, {display:'none'});
				setAttr(this.image, {src:image});
			} else {
				setStyle(this.text, {display:'block'});
				setStyle(this.image, {display:'none'});
				this.text.textContent = image;
			}
		} else {
			setStyle(this.image, {display:'none'});
			setStyle(this.text, {display:'none'});
		}
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
}

/*
  +------------------------------------------------------------------------+
  | IMAGE ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class ImageAssetButton extends BaseAssetButton {

	image:HTMLElement;
	text:HTMLElement;
	hover:HTMLElement;
	label:HTMLElement;
	container:HTMLElement;

	constructor(parent:HTMLElement, label:string, assetoption:asset) {
        super(parent, label, assetoption);
		this.el = el('div.input-asset-image', {class:'', onclick:()=>{this.focus()}},
			[
				el('div.image-hover', 
					this.hover = el('div.image-hover-text', 'Replace '+this.type)
				),
				this.image = el('img', { src: '', style: {width:defaultwithinput+'px', 'background-size': 'contain', display:'none'} }),
				this.text = el('div.image-hover-text', '')
			]
		);
		mount(this.parent, this.el);
		if (assetoption.url) this.setValue(assetoption.url);
	}


	setValue (url:string, frompicker?:any) {
		let thumbnail = this._setValue(url, frompicker);
		if (url !== undefined && url !== null) {
			// Asset not loaded before or not currently loading
			let image:string;
			if (!thumbnail) image = url;
			else image = thumbnail;
			if (image.indexOf('http') != -1) {
				setStyle(this.image, {display:'block'});
				setStyle(this.text, {display:'none'});
				setAttr(this.image, { src: image });
			} else {
				setStyle(this.text, {display:'block'});
				setStyle(this.image, {display:'none'});
				this.text.textContent = url.substr(url.lastIndexOf('/') + 1);
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
  | TEXT ASSET BUTTON                                                      |
  +------------------------------------------------------------------------+
*/

export class TextAssetButton extends BaseAssetButton {

	text:HTMLElement;
	hover:HTMLElement;
	label:HTMLElement;
	asseticon:HTMLElement;

	constructor(parent:HTMLElement, label:string, assetoption:asset) {
    super(parent, label, assetoption);
		this.el = el('div.input-asset-text.input-parameter', {onclick:()=>{this.focus()}},
			[
				this.hover = el('div.text-hover', 'Replace'),
				this.text = el('div.text-asset-name', '')
			],
			this.asseticon = el('div.icon-'+this.type+'.text-erase-icon', {onclick:(evt)=>{this.checkErase(evt)}, onmouseenter:()=>{this.mouseEnter()}, onmouseleave:()=>{this.mouseLeave()}}, [el('span.path1'),el('span.path2'),el('span.path3')])
		);
		mount(this.parent, this.el);
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
			this.hover.textContent = 'Replace ' + this.type;
		} else {
			this.text.textContent = 'No '+this.type;
			this.hover.textContent = 'Add '+this.type;
		}
		return this;
	}
}

/*
  +------------------------------------------------------------------------+
  | ASSET PICKER                                                           |
  +------------------------------------------------------------------------+
*/

export let assetTypes: Array<string> = ['image', 'particle', 'albedo', 'ambient', 'specular', 'emissive', 'reflectivity', 'reflection', 'refraction', 'heightmap', 'cubetexture', 'bump', 'opacity', 'model', 'video', 'sound'];
// Texture which are images
export let overlayImages: Array<string> = ['albedo', 'ambient', 'specular', 'emissive', 'bump', 'opacity', 'reflectivity', 'reflection', 'particle', 'image', 'heightmap'];
export let overlayAlpha = {'albedo':false, 'ambient':false, 'specular':false, 'emissive':false, 'bump':false, 'opacity':true, 'reflectivity':false, 'reflection':false, 'particle':false, 'image':true, 'heightmap':false};

export class AssetPicker extends UI {
	back:HTMLElement;
	title:HTMLElement;

	constructor () {
		super();
        this.el = el('div.picker.asset-picker.editor-scroll', { id: 'assetpicker', onclick: () => { this.hidePicker(); }});
		this.hide();
		window.addEventListener('load', () => {
			mount(document.body, this.el);
		});
	}

	currentInput:BaseAssetButton;
	setCurrentInput (input:BaseAssetButton) {
		this.currentInput = input;
		this.setAssetList(input.type);
		this.addAssetMode = false;
		this.type = input.type;
		this.waitingAsset = this.type;
		this.waitingInput = this.currentInput;
        this.showPicker();
        this.sendToFocusListener();
    }
    
    focusListeners: Array<Function> = [];
    addFocusListener (listener:Function) {
        this.focusListeners.push(listener);
    }

    sendToFocusListener () {
        for (let i = 0; i < this.focusListeners.length; i++) {
            this.focusListeners[i](this.type);
        }
    }

	buttons:any = {};
	thumbnails:any = {};
	initThumbnails (assetThumbnails:any) {
		// Make sure we have correct type saved
		for (let key in assetThumbnails) {
			if (assetTypes.indexOf(key) != -1) this.thumbnails[key] = assetThumbnails[key];
		}
	}

	assetperline = 2;
	type:string;
	setAssetList (type:string) {
        this.type = type;
		this.hideAsset();
		this.checkTypeInitialized(type);
		// Show all assets image only if overlayImages,
		// models, videos and sounds stays appart because you can't replace a model by an image
        if (overlayImages.indexOf(type) != -1) type = 'image';
        for (let i = 0; i < this.buttons[type].length; i++) {
            setStyle(this.buttons[type][i], { display: 'block' });
        }
		return this;
	}

	checkTypeInitialized (type:string) {
		if (!this.buttons[type]) this.initAssetType(type);
	}

	initAssetType (type:string) {
		this.buttons[type] = [];
		if (this.thumbnails[type] == undefined) this.thumbnails[type] = [];
		for (let i = 0; i < this.thumbnails[type].length; i++) {
			let asset = this.thumbnails[type][i];
			this.buttons[type].push(this.addButton(type, asset.url, asset.thumbnail));
        }
	}

	hideAsset () {
		for (let key in this.buttons) {
			for (let i = 0; i < this.buttons[key].length; i++) {
			   setStyle(this.buttons[key][i], {display:'none'});
			}
		}
	}

	setAddAssetMode (type:string, callback:Function) {
		this.addAssetFunction = callback;
		this.addAssetMode = true;
		this.type = type;
		this.showPicker();
		this.setAssetList(type);
	}

	waitingAsset:string = null;
	waitingInput: BaseAssetButton;
	addWaitedAssetButton (url:string, thumbnail?:string) {
		if (this.waitingAsset == null) return;
        this.checkTypeInitialized(this.waitingAsset);
        if (!thumbnail) thumbnail = url;
		let asset = find(this.thumbnails[this.waitingAsset], (o) => { return o.url == url; });
		if (asset == undefined) {
            this.addAsset(this.waitingAsset, url, thumbnail);
		}
		if (this.waitingInput) {
			this.waitingInput.setValue(url, true);
			this.waitingInput.blurEvent(); // Blur event to force push state
		}
		this.eraseCurrent();
    }
    
    addAsset(type: string, url: string, thumbnail: string, removable?: boolean) {
        this.checkTypeInitialized(type);
        this.buttons[type].push(this.addButton(type, url, thumbnail, removable));
        this.thumbnails[type].push({ url: url, thumbnail: thumbnail });
    }

	addAssetMode = false;
	addAssetFunction:Function;
	addButton (type:string, url:string, image:string, removable?:boolean) {
		let button:HTMLElement;
		if (image.indexOf('http') != -1) {
			let remove:HTMLElement;
			button = el('div.asset-button', { onclick: () => { this.selectAsset(url) } }, [
					el('img', { src: image, style: { width: '100%', height: '100%', 'object-fit': 'contain' } }),
                    remove = el('div.delete-asset-button.icon-close', {
						onclick: (e) => {
							e.stopPropagation();
							this.deleteAsset(button, type, image);
                        },
                        onmouseover: (e) => {
                            e.stopPropagation(); // Not working
                        }
					}, [el('span.path1'), el('span.path2'), el('span.path3')])
				]

			);
			if (removable === false) unmount(button, remove);
		} else {
			button = el('div.asset-button', { onclick: () => { this.selectAsset(url) } }, image);
		}
		mount(this.el, button);
		return button;
	}

	selectAsset (url:string) {
		if (this.addAssetMode) this.addAssetFunction(url);
		else this.currentInput.setValue(url, true);
		this.eraseCurrent();
	}

	onAssetDeleted:Function;
	deleteAsset (button:HTMLElement, type:string, key:string) {
		let index = this.buttons[type].indexOf(button);
		if (index != -1) this.buttons[type].splice(index, 1);
		if (this.onAssetDeleted) this.onAssetDeleted(key)
		if (this.currentInput) {
			if (key == this.currentInput.url) this.currentInput.setValue(undefined, true);
		}
		remove(this.thumbnails[type], (n) => {
		  return n.url == key;
		});
		unmount(button.parentNode, button);
		this.setAssetList(type);
	}

	eraseCurrent () {
		this.currentInput = undefined;
		this.waitingInput = null;
		this.waitingAsset = null;
	}

	onShow:Function;
	showPicker() {
		this.show();
		if (this.onShow) this.onShow(this.type);
	}

	onHide: Function;
	hidePicker () {
		this.hide();
		this.currentInput = undefined;
		if (this.onHide) this.onHide(this.type);
	}
}

export let assetPicker = new AssetPicker();
