
import { defaultwidthinputcontainer, Input } from '../Inputs/input';
import { UI } from '../Layers/common';

import { el, mount, setAttr, setStyle, unmount } from 'redom';
import find from 'lodash/find';
import isPlainObject from 'lodash/isPlainObject';
import remove from 'lodash/remove';
import filter from 'lodash/filter';
import pick from 'lodash/pick';
import keys from 'lodash/keys';

export interface asset {
    type: string,
    url: string,
    thumbnail?: string,
    removable?: boolean,
    saved?: boolean,
    button?: HTMLElement,
};

export interface assetEvents {
    change?: Function,
    focus?: Function,
    blur?: Function,
};

export class BaseAssetButton extends Input {
    url: string;
    type: string;

    constructor(parent: HTMLElement, label: string, assetoption: asset) {
        super(parent, label);
        this.url = assetoption.url;
        this.type = assetoption.type;
    }

    getThumbnail(url: string) {
        let asset = find(assetPicker.thumbnails, (o: asset) => { return o.type == this.type && o.url == url; });
        if (asset) return asset.thumbnail;
        else return url;
    }

    setValue(url: string, frompicker: boolean) {
        this._setValue(url, frompicker);
    }

    _setValue(url: string, frompicker: boolean) {
        this.url = url;
        if (this.events.change && frompicker) this.events.change(url);
        let thumbnail = this.getThumbnail(url);
        return thumbnail;
    }

    events: assetEvents = {};
    starturl: string;
    focus() {
        this.starturl = this.url;
        if (this.events.focus) this.events.focus(this.url, this);
        assetPicker.setCurrentInput(this);
    }

    blurEvent(force?: boolean) {
        if (this.events.blur && (this.starturl != this.url || force)) this.events.blur(this.url, this);
        // In order to avoid waitedAsset changing last selected texture
        assetPicker.currentInput = undefined;
    }

    on(event: 'focus' | 'blur' | 'change', funct: Function) {
        this.events[event] = funct;
        return this;
    }

    checkErase(evt: Event) {
        evt.stopPropagation();
        evt.preventDefault();
        if (this.url !== undefined) {
            this.setValue(undefined, true);
            this.blurEvent(true);
        } else {
            this.focus();
        }
    }
}

/*
  +------------------------------------------------------------------------+
  | ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class AssetButton extends BaseAssetButton {

    image: HTMLElement;
    text: HTMLElement;
    assetbutton: HTMLElement;
    asseticon: HTMLElement;

    constructor(parent: HTMLElement, label: string, assetoption: asset) {
        super(parent, label, assetoption);
        this.el = el('div.input-parameter',
            [
                this.assetbutton = el('div.picker-button', { onclick: () => { this.focus() } },
                    [
                        this.image = el('img', { src: '', style: { width: '100%', height: '100%', display: 'none' } }),
                        this.text = el('div', { style: { width: '100%', height: '100%', display: 'none', 'overflow': 'hidden' } })
                    ]
                ),
                this.asseticon = el('div.icon-texture.erase-icon', { onclick: (evt) => { this.checkErase(evt) }, onmouseenter: () => { this.mouseEnter() }, onmouseleave: () => { this.mouseLeave() } }, [el('span.path1'), el('span.path2'), el('span.path3')])
            ]
        );
        mount(this.parent, this.el);
        if (assetoption.url) this.setValue(assetoption.url);
    }

    setValue(url: string, frompicker?: any) {
        let thumbnail = this._setValue(url, frompicker);
        if (url !== undefined && url !== null) {
            setAttr(this.asseticon, { active: "true" });
            let image = url;
            if (thumbnail) image = thumbnail;
            if (image.indexOf('http') != -1) {
                setStyle(this.image, { display: 'block' });
                setStyle(this.text, { display: 'none' });
                setAttr(this.image, { src: image });
            } else {
                setStyle(this.text, { display: 'block' });
                setStyle(this.image, { display: 'none' });
                this.text.textContent = image;
            }
        } else {
            setAttr(this.asseticon, { active: "false" });
            setStyle(this.image, { display: 'none' });
            setStyle(this.text, { display: 'none' });
        }
        return this;
    }

    mouseEnter() {
        if (this.url !== undefined) this.setIcon('delete');
    }

    mouseLeave() {
        this.setIcon('texture');
    }

    setIcon(icon: string) {
        setAttr(this.asseticon, { class: 'icon-' + icon + ' erase-icon' });
    }
}

/*
  +------------------------------------------------------------------------+
  | IMAGE ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class ImageAssetButton extends BaseAssetButton {

    image: HTMLElement;
    text: HTMLElement;
    textDisplay: HTMLElement;
    hover: HTMLElement;
    label: HTMLElement;
    container: HTMLElement;

    constructor(parent: HTMLElement, label: string, assetoption: asset) {
        super(parent, label, assetoption);
        this.hideLabel();
        this.el = el('div.input-asset-image', { class: '', onclick: () => { this.focus() } },
            [
                this.hover = el('div.text-hover.icon-add',
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                ),
                this.image = el('img', { src: '', style: { width: defaultwidthinputcontainer + 'px', 'background-size': 'contain', display: 'none' } }),
                this.textDisplay = el('div.image-text-container',
                    this.text = el('div.image-hover-text', '')
                ),
            ]
        );
        mount(this.parent, this.el);
        if (assetoption.url) this.setValue(assetoption.url);
    }


    setValue(url: string, frompicker?: any) {
        let thumbnail = this._setValue(url, frompicker);
        if (url !== undefined && url !== null) {
            // Asset not loaded before or not currently loading
            let image: string;
            if (!thumbnail) image = url;
            else image = thumbnail;
            if (image.indexOf('http') != -1) {
                setStyle(this.image, { display: 'block' });
                setStyle(this.textDisplay, { display: 'none' });
                setAttr(this.image, { src: image });
            } else {
                setStyle(this.textDisplay, { display: 'block' });
                setStyle(this.image, { display: 'none' });
                this.text.textContent = url.substr(url.lastIndexOf('/') + 1);
            }
            setAttr(this.hover, { empty: false });
        } else {
            setStyle(this.textDisplay, { display: 'block' });
            setStyle(this.image, { display: 'none' });
            setAttr(this.hover, { empty: true });
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

    text: HTMLElement;
    hover: HTMLElement;
    label: HTMLElement;
    asseticon: HTMLElement;

    constructor(parent: HTMLElement, label: string, assetoption: asset) {
        super(parent, label, assetoption);
        this.el = el('div.input-button.input-asset-text', { onclick: () => { this.focus() } },
            [
                this.hover = el('div.text-hover.icon-add', 
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                ),
                this.text = el('div.text-asset-name', '')
            ],
        );
        mount(this.parent, this.el);
        if (assetoption.url) this.setValue(assetoption.url);
    }

    setValue(url: string, frompicker?: any) {
        let thumbnail = this._setValue(url, frompicker);
        if (url !== undefined && url !== null) {
            let text: string;
            // Asset not loaded before or not currently loading
            if (!thumbnail) text = url.substr(url.lastIndexOf('/') + 1);
            else text = thumbnail;
            this.text.textContent = text;
            setAttr(this.hover, { empty: false });
        } else {
            setAttr(this.hover, { empty: true });
        }
        return this;
    }
}

/*
  +------------------------------------------------------------------------+
  | ASSET PICKER                                                           |
  +------------------------------------------------------------------------+
*/

// export let assetTypes: Array<string> = ['image', 'particle', 'albedo', 'ambient', 'specular', 'emissive', 'reflectivity', 'reflection', 'refraction', 'heightmap', 'cubetexture', 'bump', 'opacity', 'model', 'video', 'sound'];
// export let overlayAlpha = {'albedo':false, 'ambient':false, 'specular':false, 'emissive':false, 'bump':false, 'opacity':true, 'reflectivity':false, 'reflection':false, 'particle':false, 'image':true, 'heightmap':false};
export let assetTypes: Array<string> = ['image', 'cubetexture', 'model', 'video', 'sound'];
// Texture which are images
export let overlayImages: Array<string> = ['albedo', 'ambient', 'specular', 'emissive', 'bump', 'opacity', 'reflectivity', 'reflection', 'particle', 'image', 'heightmap'];

export class AssetPicker extends UI {
    back: HTMLElement;
    title: HTMLElement;
    fixedel: HTMLElement;
    assetlist: HTMLElement;

    constructor() {
        super();
        this.el = el('div.asset-picker', [
            this.assetlist = el('div.editor-scroll.asset-scroll', { id: 'assetpicker', onclick: (evt) => { evt.stopPropagation(); this.hidePicker(true); } }, 
            ),
            this.fixedel = el('div.fixed-asset-part', 
                el('div.modal-close.icon-close', { onclick: () => { this.hidePicker(true); } },
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                )
            ) 
        ]);
        this.hide();

        // Click outside asset picker will always hide it
        window.addEventListener("click", (e) => {
            // Is it a click outside and not on a dropzone input
            if (!this.el.contains(e.target) && !(e.target.type == 'file')) {
                if (this.shown) this.hidePicker(true);
            }
        });

        this.setEvents();
    }
    
    setEvents() {
        this.el.addEventListener('dragover', () => {
            this.sendToDragListener('start')
        });
    
        this.el.addEventListener('dragenter', () => {
            this.sendToDragListener('start')
        });
    
        this.el.addEventListener('dragleave', () => {
            this.sendToDragListener('end')
        });
    
        this.el.addEventListener('dragend', () => {
            this.sendToDragListener('end')
        });
    }
    
    setParent(parent: HTMLElement) {
        mount(parent, this.el);
    }

    addNoAssetButton () {
        let button = el('div.no-asset-button.asset-button', { onclick: () => { this.selectAsset(null) } },
            el('div.no-asset-icon.icon-none',
                [el('span.path1'), el('span.path2'), el('span.path3')]
            )
        );
        mount(this.assetlist, button);
    }

    currentInput: BaseAssetButton;
    setCurrentInput(input: BaseAssetButton) {
        this.currentInput = input;        
        this.setAssetList(input.type);
        this.addAssetMode = false;
        this.type = input.type;
        this.waitingAsset = this.type;
        this.waitingInput = this.currentInput;
        this.showPicker();
    }

    focusListeners: Array<Function> = [];
    blurListeners: Array<Function> = [];
    dragListeners: Array<Function> = [];
    on(event:'focus'|'blur'|'drag', listener: Function) {
        if (event == 'focus') this.focusListeners.push(listener);
        if (event == 'blur') this.blurListeners.push(listener);
        if (event == 'drag') this.dragListeners.push(listener);
        return this;
    }

    sendToFocusListener() {
        for (let i = 0; i < this.focusListeners.length; i++) {
            this.focusListeners[i](this.type);
        }
    }

    sendToBlurListener() {
        for (let i = 0; i < this.blurListeners.length; i++) {
            this.blurListeners[i](this.type);
        }
    }

    sendToDragListener(event:'start'|'end') {
        for (let i = 0; i < this.dragListeners.length; i++) {
            this.dragListeners[i](this.type, event);
        }
    }

    thumbnails: Array<asset> = [];
    initThumbnails(assetThumbnails: Array<asset>) {
        if (!assetThumbnails) return;
        // In previus version, we had object of arrays
        // So this is a check to correct it
        if (isPlainObject(assetThumbnails)) {
            for (let key in assetThumbnails) {
                if (assetTypes.indexOf(key) != -1) {
                    for (let i = 0; i < assetThumbnails[key].length; i++) {
                        const asset = assetThumbnails[key][i];
                        asset.type = key;
                        if (assetTypes.indexOf(asset.type) != -1 && asset.url && asset.url.indexOf('http') != -1) {
                            if (asset.saved === undefined) asset.saved = true;
                            this.thumbnails.push(asset);
                        }
                    }
                }
            }
        } else {
            // Make sure we have correct type saved
            for (let i = 0; i < assetThumbnails.length; i++) {
                const asset = assetThumbnails[i];
                if (assetTypes.indexOf(asset.type) != -1 && asset.url && asset.url.indexOf('http') != -1) {
                    if (asset.saved === undefined) asset.saved = true;
                    this.thumbnails.push(asset);
                }
            }
        }
    }

    getSavedAssets() {
        let exportAssetKeys:asset = {
            type: null,
            url: null,
            thumbnail: null
        };

        let savedAssets: Array < asset > = [];
        for (let i = 0; i < this.thumbnails.length; i++) {
            let asset = this.thumbnails[i];
            if (asset.saved && asset.url.indexOf('http') != -1) {
                let exportAsset = pick(asset, keys(exportAssetKeys));
                savedAssets.push(exportAsset);
            }
        }
        return savedAssets;
    }

    assetperline = 2;
    type: string;
    setAssetList(type: string) {
        if (overlayImages.indexOf(type) != -1) type = 'image';
        this.type = type;
        this.hideAsset();
        this.checkAddButtonsType(type);

        let assetsType = filter(this.thumbnails, (a) => { return a.type == type });
        for (let i = 0; i < assetsType.length; i++) {
            let button = assetsType[i].button;
            setStyle(button, { display: 'block' });
        }
        return this;
    }

    checkAddButtonsType(type: string) {
        let assetsType = filter(this.thumbnails, (a) => { return a.type == type });
        for (let i = 0; i < assetsType.length; i++) {
            let asset = assetsType[i];
            if (!asset.button) assetsType[i].button = this.addButton(type, asset.url, asset.thumbnail, asset.removable);
        }
    }

    hideAsset() {
        for (let i = 0; i < this.thumbnails.length; i++) {
            let button = this.thumbnails[i].button;
            if (button) setStyle(button, { display: 'none' });
        }
    }

    setAddAssetMode(type: string, callback: Function) {
        this.addAssetFunction = callback;
        this.addAssetMode = true;
        this.type = type;
        this.setAssetList(type);
        this.showPicker();
    }

    waitingAsset: string = null;
    waitingInput: BaseAssetButton;
    addWaitedAssetButton(url: string, thumbnail?: string) {
        if (this.waitingAsset == null) return;
        this.checkAddButtonsType(this.waitingAsset);
        if (!thumbnail) thumbnail = url;
        let asset = find(this.thumbnails, (o) => { return o.type == this.waitingAsset && o.url == url; });
        if (asset == undefined) {
            this.addAsset(this.waitingAsset, url, thumbnail);
        }
        if (this.waitingInput) {
            this.waitingInput.setValue(url, true);
            this.waitingInput.blurEvent(); // Blur event to force push state
        }
        this.eraseWaiting();
    }

    addAsset(type: string, url: string, thumbnail: string, saved?: boolean, removable?: boolean) {
        if (!url) return console.error('Missing asset '+type+' url');
        if (saved === undefined) saved = true;
        if (removable === undefined) removable = true;
        let asset = find(this.thumbnails, (a) => { return a.type == type && a.url == url });
        if (!asset) {
            if (assetTypes.indexOf(type) != -1 && url.indexOf('http') != -1) {
                let newAsset:asset = { type: type, url: url, thumbnail: thumbnail, saved: saved, removable: removable };
                if (this.shown) {
                    let button = this.addButton(type, url, thumbnail, removable);
                    newAsset.button = button;
                }
                this.thumbnails.push(newAsset);
            }
        }
    }

    addAssetMode = false;
    addAssetFunction: Function;
    addButton(type: string, url: string, image: string, removable: boolean) {
        if (removable === undefined) removable = true;
        let button: HTMLElement;
        if (image.indexOf('http') != -1) {
            button = el('div.asset-button', { onclick: () => { this.selectAsset(url) } }, 
                // Draggable set to false or it can show drag zone
                el('img', { draggable: false, src: image, style: { width: '100%', height: '100%', 'object-fit': 'contain' } }),
            );
        } else {
            button = el('div.asset-button', { onclick: () => { this.selectAsset(url) } }, [
                el('div.asset-text', image),
                el('div.backicon.icon-' + type,
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                ),
            ]);
        }
        
        if (removable) {
            let removebutton = el('div.delete-asset-button.icon-close', {
                onclick: (e) => {
                    e.stopPropagation();
                    this.deleteAsset(type, url);
                },
                onmouseover: (e) => {
                    e.stopPropagation(); // Not working
                }
            }, [el('span.path1'), el('span.path2'), el('span.path3')])
            mount(button, removebutton);
        }
        mount(this.assetlist, button);
        return button;
    }

    selectAsset(url: string) {
        if (this.addAssetMode) this.addAssetFunction(url);
        else if (this.currentInput) this.currentInput.setValue(url, true);
        this.eraseWaiting();
    }

    onAssetDeleted: Function;
    deleteAsset(type: string, url: string) {
        let asset = find(this.thumbnails, (o) => { return o.type == type && o.url == url; });
        if (asset) {
            let button = asset.button;
            unmount(button.parentNode, button);
        }
        if (this.onAssetDeleted) this.onAssetDeleted(url)
        if (this.currentInput) {
            if (url == this.currentInput.url) this.currentInput.setValue(undefined, true);
        }
        remove(this.thumbnails, (n) => { return n.type == type && n.url == url; });
        this.setAssetList(type);
    }

    eraseWaiting() {
        this.currentInput = undefined;
        this.waitingInput = null;
        this.waitingAsset = null;
    }

    shown = false;
    showPicker() {
        // For click outside
        // If no timeout, window click is triggered and picker is always hidden
        setTimeout(() => {
            this.shown = true;
            this.show();
            this.sendToFocusListener();
        }, 10);
    }

    hidePicker(erase?:boolean) {
        this.shown = false;
        this.hide();
        this.currentInput = undefined;
        this.sendToBlurListener();
        // Depending on where hidding comes from, we must erase waiting input or not
        // For instance if loading an asset and waiting for the success, we should not erase it
        if (erase) this.eraseWaiting();
    }
}

export let assetPicker = new AssetPicker();