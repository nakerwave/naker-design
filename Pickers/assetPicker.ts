import { Input } from '../Inputs/input';
import { UI } from '../Layers/common';

import { el, mount, setAttr, setStyle, unmount } from 'redom';
import find from 'lodash/find';
import isPlainObject from 'lodash/isPlainObject';
import remove from 'lodash/remove';
import filter from 'lodash/filter';
import pick from 'lodash/pick';
import keys from 'lodash/keys';

export interface LabelData {
    image?: string,
    text?: string,
    link?: string,
}

export interface asset {
    type: 'image' | 'cubetexture' | 'model' | 'video' | 'sound' | 'light' | 'shape' | 'interaction' | 'filter' | 'camera',
    name?: string,
    url?: string,
    thumbnail?: string,
    label?: LabelData,
    removable?: boolean,
    saved?: boolean,
    button?: HTMLElement,
    option?: any,
}

export interface assetEvents {
    change?: Function,
    focus?: Function,
    blur?: Function,
}

export class BaseAssetButton extends Input<string> {
    url: string;
    type: asset['type'];
    removable = false;

    constructor(parent: HTMLElement, label: string, assetoption: asset) {
        super(parent, label);
        this.url = assetoption.url;
        this.type = assetoption.type;
        if (assetoption.removable !== undefined) this.removable = assetoption.removable;
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
            if (assetPicker.isImageString(image)) {
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

    constructor(parent: HTMLElement, label: string, assetoption: asset) {
        super(parent, label, assetoption);
        this.hideLabel();
        this.el = el('div.input-asset-image', { class: '', onclick: () => { this.focus() } },
            [
                this.hover = el('div.text-hover',
                    el('div.icon-add', [el('span.path1'), el('span.path2'), el('span.path3')]),
                ),
                this.image = el('img', { src: '' }),
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
            if (assetPicker.isImageString(image)) {
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
    asseticon: HTMLElement;

    constructor(parent: HTMLElement, label: string, assetoption: asset) {
        super(parent, label, assetoption);
        this.el = el('div.input-button.input-asset-text', { onclick: () => { this.focus() } },
            [
                this.hover = el('div.text-hover',
                    el('div.icon-add', [el('span.path1'), el('span.path2'), el('span.path3')]),
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

interface AssetEvent {
    event: 'show' | 'hide' | 'select' | 'delete',
    funct: Function,
}

// export let assetTypes: Array<string> = ['image', 'particle', 'albedo', 'ambient', 'specular', 'emissive', 'reflectivity', 'reflection', 'refraction', 'heightmap', 'cubetexture', 'bump', 'opacity', 'model', 'video', 'sound'];
// export let overlayAlpha = {'albedo':false, 'ambient':false, 'specular':false, 'emissive':false, 'bump':false, 'opacity':true, 'reflectivity':false, 'reflection':false, 'particle':false, 'image':true, 'heightmap':false};
// export let assetTypes: Array<string> = ['image', 'cubetexture', 'model', 'video', 'sound'];
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
            this.assetlist = el('div.editor-scroll.asset-scroll', { id: 'assetpicker' },
            ),
            this.fixedel = el('div.fixed-asset-part',
                el('div.modal-close.icon-close', { onclick: () => { this.hidePicker(true); } },
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                )
            )
        ]);

        this.addRemoveAssetButton();
        this.hide();
    }

    getExtension(url: string) {
        return url.substr(url.lastIndexOf('.') + 1);
    }

    getFileName(url: string) {
        return url.substr(url.lastIndexOf('/') + 1);
    }

    setClickOutside() {
        // Click outside asset picker will always hide it
        window.addEventListener("click", (e) => {
            // Is it a click outside and not on a dropzone input
            if (!this.el.contains(e.target) && !(e.target.type == 'file')) {
                if (this.shown) this.hidePicker(true);
            }
        });
    }

    addIconButton(type: asset['type'], icon: string, callback: Function) {
        let button = el('div.no-asset-button.asset-button', { onclick: () => { callback() } },
            el('div.no-asset-icon.icon-' + icon,
                [el('span.path1'), el('span.path2'), el('span.path3')]
            )
        );
        mount(this.assetlist, button);
        let newAsset = { type: type, url: icon, button: button, saved: false };
        this.thumbnails.push(newAsset);
    }

    addImageButton(type: asset['type'], image: string, callback: Function) {
        let button = el('div.no-asset-button.asset-button', { onclick: () => { callback() } },
            el('div.no-asset-icon', { style: { background: 'url(' + image + ')' } })
        );
        mount(this.assetlist, button);
        let newAsset = { type: type, url: image, button: button, saved: false };
        this.thumbnails.push(newAsset);
    }

    setParent(parent: HTMLElement) {
        mount(parent, this.el);
    }

    removeAssetButton: HTMLElement;
    addRemoveAssetButton() {
        this.removeAssetButton = el('div.no-asset-button.asset-button', { onclick: () => { this.selectAsset(null) } },
            el('div.no-asset-icon.icon-none',
                [el('span.path1'), el('span.path2'), el('span.path3')]
            )
        );
        mount(this.assetlist, this.removeAssetButton);
        this.hideRemoveAssetButton();
    }

    showRemoveAssetButton() {
        setStyle(this.removeAssetButton, { display: 'inline-block' });
    }

    hideRemoveAssetButton() {
        setStyle(this.removeAssetButton, { display: 'none' });
    }

    currentInput: BaseAssetButton;
    setCurrentInput(input: BaseAssetButton) {
        this.currentInput = input;
        this.setAssetList(input.type);
        this.addAssetMode = false;
        this.type = input.type;
        this.waitingAsset = this.type;
        this.waitingInput = this.currentInput;
        if (input.removable) this.showRemoveAssetButton();
        else this.hideRemoveAssetButton();
        this.showPicker();
    }

    addAssetPresets(assetPresets: Array<asset>) {
        for (let i = 0; i < assetPresets.length; i++) {
            const asset = assetPresets[i];
            asset.saved = false;
            asset.removable = false;
        }
        this.initThumbnails(assetPresets);
    }

    thumbnails: Array<asset> = [];
    initThumbnails(assetThumbnails: Array<asset>) {
        if (!assetThumbnails) return;
        // In previus version, we had object of arrays
        // So this is a check to correct it
        if (isPlainObject(assetThumbnails)) {
            for (let key in assetThumbnails) {
                for (let i = 0; i < assetThumbnails[key].length; i++) {
                    const asset = assetThumbnails[key][i];
                    asset.type = key;
                    if (asset.saved === undefined) asset.saved = true;
                    this.thumbnails.push(asset);
                }
            }
        } else {
            // Make sure we have correct type saved
            for (let i = 0; i < assetThumbnails.length; i++) {
                const asset = assetThumbnails[i];
                if (asset.saved === undefined) asset.saved = true;
                this.thumbnails.push(asset);
            }
        }
    }

    getSavedAssets() {
        let exportAssetKeys: asset = {
            type: null,
            url: null,
            thumbnail: null
        };

        let savedAssets: Array<asset> = [];
        for (let i = 0; i < this.thumbnails.length; i++) {
            let asset = this.thumbnails[i];
            if (asset.saved) {
                let exportAsset = pick(asset, keys(exportAssetKeys));
                savedAssets.push(exportAsset);
            }
        }
        return savedAssets;
    }

    assetperline = 2;
    type: asset['type'];
    setAssetList(type: asset['type']) {
        if (overlayImages.indexOf(type) != -1) type = 'image';
        this.type = type;
        this.hideAsset();
        this.checkAddButtonsType(type);
        let assetsType = filter(this.thumbnails, (a) => { return a.type == type });
        for (let i = 0; i < assetsType.length; i++) {
            let button = assetsType[i].button;
            setStyle(button, { display: 'inline-block' });
        }
        return this;
    }

    checkAddButtonsType(type: string) {
        let assetsType = filter(this.thumbnails, (a) => { return a.type == type });
        for (let i = 0; i < assetsType.length; i++) {
            let asset = assetsType[i];
            if (!asset.button) assetsType[i].button = this.addButton(asset);
        }
    }

    hideAsset() {
        for (let i = 0; i < this.thumbnails.length; i++) {
            let button = this.thumbnails[i].button;
            if (button) setStyle(button, { display: 'none' });
        }
    }

    setAddAssetMode(type: asset['type'], callback: Function) {
        this.addAssetFunction = callback;
        this.addAssetMode = true;
        this.type = type;
        this.setAssetList(type);
        this.showPicker();
        this.hideRemoveAssetButton();
    }

    waitingAsset: asset['type'] = null;
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

    addAsset(type: asset['type'], url: string, thumbnail: string, saved?: boolean, removable?: boolean): asset {
        if (!url) return console.error('Missing asset ' + type + ' url');
        if (saved === undefined) saved = true;
        if (removable === undefined) removable = true;
        let asset = this.getAssetByUrl(type, url);
        if (!asset) {
            //! Do not add only images or model asset won't be added for instance
            // if (this.isImageString(url)) {
            let newAsset: asset = { type: type, url: url, thumbnail: thumbnail, saved: saved, removable: removable };
            // if (this.shown) {
            let button = this.addButton(newAsset);
            newAsset.button = button;
            // }
            this.thumbnails.push(newAsset);
            return newAsset;
            // }
        } else {
            return asset;
        }
    }

    addImage(fileName: string, url: string, saved?: boolean, removable?: boolean): asset {
        let asset = this.addAsset('image', url, url, saved, removable)
        asset.name = fileName;
        return asset;
    }

    getAssetByUrl(type: asset['type'], url: string) {
        return find(this.thumbnails, (a) => {
            return a.type == type && a.url == url
        });
    }

    getAssetByName(type: asset['type'], name: string) {
        return find(this.thumbnails, (a) => { return a.type == type && a.name == name });
    }

    addAssetMode = false;
    addAssetFunction: Function;
    addButton(asset: asset) {
        if (asset.removable === undefined) asset.removable = true;
        let button = this.buildButton(asset, () => {
            this.selectAsset(asset);
        });
        this.assetlist.prepend(button);
        return button;
    }

    buildButton(asset: asset, callback: Function) {
        let image: HTMLElement;
        let thumbnail = asset.thumbnail;
        let button = el('div.asset-button', { onclick: () => { callback() } },
            // Draggable set to false or it can show drag zone
            image = el('img', { draggable: false }),
            el('div.loader-layer', { onclick: (e) => { e.stopPropagation(); e.preventDefault(); } }),
            el('div.loader-animation'),
        );

        let isImageString = this.isImageString(thumbnail);
        let isFromPoly = (thumbnail.indexOf('googleusercontent') != -1);
        let isFromClara = (thumbnail.indexOf('resources.clara.io') != -1);
        // Google content soesn't have extension
        if (isImageString || isFromPoly || isFromClara) {
            setAttr(image, { src: thumbnail });
        } else {
            let isUrl = (thumbnail.indexOf('http') != -1);
            if (isUrl) thumbnail = this.getFileName(thumbnail);
            asset.label = { text: thumbnail };
        }

        if (asset.label) {
            this.addAssetTitle(button, image, asset.label);
        }
        if (asset.removable) {
            this.addRemoveButton(button, asset);
        }
        return button;
    }

    isImageString(s: string): boolean {
        let extension = this.getExtension(s);
        let isImageUrl = (s.indexOf('http') != -1 && ['png', 'jpg', 'jpeg'].indexOf(extension) != -1);
        let isImageBase64 = (s.indexOf('base64') != -1);
        let isImageBlob = (s.indexOf('blob:') != -1);
        return isImageUrl || isImageBase64 || isImageBlob;
    }

    addAssetTitle(button: HTMLElement, imageEl: HTMLElement, labelData: LabelData) {
        if (imageEl) setAttr(imageEl, { class: 'small-image' });
        let text = labelData.text;
        let image = labelData.image;
        let hover = el('div.asset-button-title', [
            (image) ? el('img', {
                src: image, onclick: (e) => {
                    if (labelData.link) {
                        e.stopPropagation();
                        window.open(labelData.link, '_blank');
                    }
                },
            }) : null,
            (text) ? el('div.asset-text', text) : null,
        ]);
        mount(button, hover);
    }

    addRemoveButton(button: HTMLElement, asset) {
        let removebutton = el('div.delete-asset-button.icon-delete', {
            onclick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.deleteAsset(asset.type, asset.url);
            },
            onmouseover: (e) => {
                e.stopPropagation(); // Not working
            }
        }, [el('span.path1'), el('span.path2'), el('span.path3')])
        mount(button, removebutton);
    }

    selectAsset(asset: asset) {
        if (this.addAssetMode) this.addAssetFunction(asset.url);
        else if (this.currentInput) this.currentInput.setValue(asset.url, true);
        this.send('select', asset);
        this.eraseWaiting();
    }

    onAssetDeleted: Function;
    deleteAsset(type: asset['type'], url: string) {
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
        this.send('delete', asset);
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
        }, 10);
        this.send('show');

    }

    hidePicker(erase?: boolean) {
        this.shown = false;
        this.hide();
        this.currentInput = undefined;
        // Depending on where hidding comes from, we must erase waiting input or not
        // For instance if loading an asset and waiting for the success, we should not erase it
        if (erase) this.eraseWaiting();
        this.send('hide');
    }

    observers: Array<AssetEvent> = [];
    send(event: AssetEvent['event'], asset?: asset) {
        for (let i = 0; i < this.observers.length; i++) {
            let observer = this.observers[i];
            if (observer.event == event) observer.funct(asset);
        }
    }

    on(event: AssetEvent['event'], funct: Function) {
        let assetEvent = {
            event: event,
            funct: funct,
        }
        this.observers.push(assetEvent);
        return this;
    }
}

export let assetPicker = new AssetPicker();