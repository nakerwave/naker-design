var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { defaultwithinput, ui_input } from '../Inputs/input';
import { ui_imagebutton, ui_button } from '../Inputs/button';
import { ui } from '../Layers/common';
import { el, mount, setAttr, setStyle } from 'redom';
import find from 'lodash/find';
import remove from 'lodash/remove';
;
;
var ui_assetinput = /** @class */ (function (_super) {
    __extends(ui_assetinput, _super);
    function ui_assetinput(parent, label, assetoption) {
        var _this = _super.call(this, parent, label) || this;
        _this.events = {};
        _this.url = assetoption.url;
        _this.type = assetoption.type;
        return _this;
    }
    ui_assetinput.prototype.getThumbnail = function (url) {
        var asset = find(assetpicker.assetImages[this.type], function (o) { return o.url == url; });
        if (asset)
            return asset.thumbnail;
        else
            return url;
    };
    ui_assetinput.prototype.setValue = function (url, frompicker) {
        this._setValue(url, frompicker);
    };
    ui_assetinput.prototype._setValue = function (url, frompicker) {
        this.url = url;
        if (this.events.change && frompicker)
            this.events.change(url);
        var thumbnail = this.getThumbnail(url);
        return thumbnail;
    };
    ui_assetinput.prototype.focus = function () {
        this.starturl = this.url;
        if (this.events.focus)
            this.events.focus(this.url, this);
        assetpicker.setCurrentInput(this);
    };
    ui_assetinput.prototype.blurEvent = function () {
        if (this.events.blur && this.starturl != this.url)
            this.events.blur(this.url, this);
        // In order to avoid waitedAsset changing last selected texture
        assetpicker.currentInput = undefined;
    };
    ui_assetinput.prototype.on = function (event, funct) {
        this.events[event] = funct;
        return this;
    };
    ui_assetinput.prototype.checkErase = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        if (this.url !== undefined)
            this.setValue(undefined, true);
        else
            this.focus();
    };
    return ui_assetinput;
}(ui_input));
export { ui_assetinput };
/*
  +------------------------------------------------------------------------+
  | ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/
var ui_assetbutton = /** @class */ (function (_super) {
    __extends(ui_assetbutton, _super);
    function ui_assetbutton(parent, label, assetoption) {
        var _this = _super.call(this, parent, label, assetoption) || this;
        _this.el = el('div.input-parameter', [
            _this.assetbutton = el('div.picker-button', { onclick: function () { _this.focus(); } }, [
                _this.image = el('img', { src: '', style: { width: '100%', height: '100%', display: 'none' } }),
                _this.text = el('div', { style: { width: '100%', height: '100%', display: 'none', 'overflow': 'hidden' } })
            ]),
            _this.asseticon = el('div.icon-texture.erase-icon', { onclick: function (evt) { _this.checkErase(evt); }, onmouseenter: function () { _this.mouseEnter(); }, onmouseleave: function () { _this.mouseLeave(); } }, [el('span.path1'), el('span.path2'), el('span.path3')])
        ]);
        mount(_this.parent, _this.el);
        if (assetoption.url)
            _this.setValue(assetoption.url);
        return _this;
    }
    ui_assetbutton.prototype.setValue = function (url, frompicker) {
        if (url !== undefined && url !== null) {
            var image = url;
            var asset = find(assetpicker.assetImages[this.type], function (o) { return o.url == url; });
            if (asset)
                image = asset.thumbnail;
            if (image.indexOf('http') != -1) {
                setStyle(this.image, { display: 'block' });
                setStyle(this.text, { display: 'none' });
                setAttr(this.image, { src: image });
            }
            else {
                setStyle(this.text, { display: 'block' });
                setStyle(this.image, { display: 'none' });
                this.text.textContent = image;
            }
            // setStyle(this.asseticon, {'color':colormain});
        }
        else {
            this.erase(frompicker);
        }
        this.url = url;
        if (this.events.change && frompicker)
            this.events.change(url);
        return this;
    };
    ui_assetbutton.prototype.mouseEnter = function () {
        if (this.url !== undefined)
            this.setIcon('delete');
    };
    ui_assetbutton.prototype.mouseLeave = function () {
        this.setIcon('texture');
    };
    ui_assetbutton.prototype.setIcon = function (icon) {
        setAttr(this.asseticon, { class: 'icon-' + icon + ' erase-icon' });
    };
    ui_assetbutton.prototype.erase = function (frompicker) {
        setStyle(this.image, { display: 'none' });
        setStyle(this.text, { display: 'none' });
        // setStyle(this.asseticon, {'color':colorthirdgrey});
        if (this.events.change && frompicker)
            this.events.change(undefined);
        if (frompicker)
            this.blurEvent();
    };
    return ui_assetbutton;
}(ui_assetinput));
export { ui_assetbutton };
/*
  +------------------------------------------------------------------------+
  | IMAGE ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/
var ui_imageassetbutton = /** @class */ (function (_super) {
    __extends(ui_imageassetbutton, _super);
    function ui_imageassetbutton(parent, label, assetoption) {
        var _this = _super.call(this, parent, label, assetoption) || this;
        _this.el = el('div.input-asset-image.input-parameter', { class: '', onclick: function () { _this.focus(); } }, [
            _this.hover = el('div.image-hover', el('div.image-hover-text', 'Replace ' + _this.type)),
            _this.image = el('img', { src: '', style: { width: defaultwithinput + 'px', 'background-size': 'contain', display: 'none' } }),
            _this.text = el('div.image-hover-text', '')
        ]);
        mount(_this.parent, _this.el);
        if (assetoption.url)
            _this.setValue(assetoption.url);
        return _this;
    }
    ui_imageassetbutton.prototype.setValue = function (url, frompicker) {
        var thumbnail = this._setValue(url, frompicker);
        if (url !== undefined && url !== null) {
            // Asset not loaded before or not currently loading
            var image = void 0;
            if (!thumbnail)
                image = url;
            else
                image = thumbnail;
            if (image.indexOf('http') != -1) {
                setStyle(this.image, { display: 'block' });
                setStyle(this.text, { display: 'none' });
                setAttr(this.image, { src: image });
            }
            else {
                setStyle(this.text, { display: 'block' });
                setStyle(this.image, { display: 'none' });
                this.text.textContent = url.substr(url.lastIndexOf('/') + 1);
            }
            this.hover.textContent = 'Replace ' + this.type;
        }
        else {
            setStyle(this.text, { display: 'block' });
            this.text.textContent = 'No ' + this.type;
            this.hover.textContent = 'Add ' + this.type;
        }
        return this;
    };
    return ui_imageassetbutton;
}(ui_assetinput));
export { ui_imageassetbutton };
/*
  +------------------------------------------------------------------------+
  | TEXT ASSET BUTTON                                                           |
  +------------------------------------------------------------------------+
*/
var ui_textassetbutton = /** @class */ (function (_super) {
    __extends(ui_textassetbutton, _super);
    function ui_textassetbutton(parent, label, assetoption) {
        var _this = _super.call(this, parent, label, assetoption) || this;
        _this.el = el('div.input-asset-text.input-parameter', { onclick: function () { _this.focus(); } }, [
            _this.hover = el('div.text-hover', 'Replace'),
            _this.text = el('div.text-asset-name', '')
        ], _this.asseticon = el('div.icon-' + _this.type + '.text-erase-icon', { onclick: function (evt) { _this.checkErase(evt); }, onmouseenter: function () { _this.mouseEnter(); }, onmouseleave: function () { _this.mouseLeave(); } }, [el('span.path1'), el('span.path2'), el('span.path3')]));
        mount(_this.parent, _this.el);
        if (assetoption.url)
            _this.setValue(assetoption.url);
        return _this;
    }
    ui_textassetbutton.prototype.mouseEnter = function () {
        if (this.url !== undefined)
            this.setIcon('delete');
    };
    ui_textassetbutton.prototype.mouseLeave = function () {
        this.setIcon(this.type);
    };
    ui_textassetbutton.prototype.setIcon = function (icon) {
        setAttr(this.asseticon, { class: 'icon-' + icon + ' text-erase-icon' });
    };
    ui_textassetbutton.prototype.setValue = function (url, frompicker) {
        var thumbnail = this._setValue(url, frompicker);
        if (url !== undefined && url !== null) {
            var text = void 0;
            // Asset not loaded before or not currently loading
            if (!thumbnail)
                text = url.substr(url.lastIndexOf('/') + 1);
            else
                text = thumbnail;
            this.text.textContent = text;
            this.hover.textContent = 'Replace';
            // setStyle(this.asseticon, {'color':colormain});
        }
        else {
            this.text.textContent = 'No ' + this.type;
            this.hover.textContent = 'Add ' + this.type;
            // setStyle(this.asseticon, {'color':colorthirdgrey});
        }
        return this;
    };
    return ui_textassetbutton;
}(ui_assetinput));
export { ui_textassetbutton };
/*
  +------------------------------------------------------------------------+
  | ASSET PICKER                                                           |
  +------------------------------------------------------------------------+
*/
// Texture which are images
export var overlayImages = ['albedo', 'ambient', 'specular', 'emissive', 'bump', 'opacity', 'reflectivity', 'reflection', 'particle', 'image', 'heightmap'];
export var overlayAlpha = { 'albedo': false, 'ambient': false, 'specular': false, 'emissive': false, 'bump': false, 'opacity': true, 'reflectivity': false, 'reflection': false, 'particle': false, 'image': true, 'heightmap': false };
var ui_assetpicker = /** @class */ (function (_super) {
    __extends(ui_assetpicker, _super);
    function ui_assetpicker() {
        var _this = _super.call(this) || this;
        _this.assetButtons = {};
        _this.assetImages = {};
        _this.assetperline = 2;
        _this.waitingAsset = null;
        _this.addAssetMode = false;
        window.addEventListener('load', function () {
            _this.el = el('div', { id: 'assetpicker', class: 'picker asset-picker editor-scroll' });
            mount(document.body, _this.el);
            _this.hide();
        });
        return _this;
    }
    ui_assetpicker.prototype.setCurrentInput = function (input) {
        this.currentInput = input;
        this.setAssetList(input.type);
        this.show();
        this.addAssetMode = false;
        this.waitingAsset = this.type;
        this.waitingInput = this.currentInput;
    };
    ui_assetpicker.prototype.setAssetList = function (type) {
        this.type = type;
        this.hideAsset();
        this.checkTypeButton(type);
        // Show all assets image only if overlayImages,
        // models, videos and sounds stays appart because you can't replace a model by an image
        if (overlayImages.indexOf(type) == -1) {
            for (var i = 0; i < this.assetButtons[type].length; i++) {
                this.assetButtons[type][i].show();
            }
        }
        else {
            for (var i = 0; i < overlayImages.length; i++) {
                var keytype = overlayImages[i];
                for (var i_1 = 0; i_1 < this.assetButtons[keytype].length; i_1++) {
                    this.assetButtons[keytype][i_1].show();
                }
            }
        }
        return this;
    };
    ui_assetpicker.prototype.checkTypeButton = function (type) {
        if (overlayImages.indexOf(type) == -1) {
            if (!this.assetButtons[type])
                this.initAssetType(type);
        }
        else {
            for (var i = 0; i < overlayImages.length; i++) {
                if (!this.assetButtons[overlayImages[i]])
                    this.initAssetType(overlayImages[i]);
            }
        }
    };
    ui_assetpicker.prototype.initAssetType = function (type) {
        this.assetButtons[type] = [];
        if (this.assetImages[type] == undefined)
            this.assetImages[type] = [];
        for (var i = 0; i < this.assetImages[type].length; i++) {
            var asset = this.assetImages[type][i];
            this.assetButtons[type].push(this.addButton(type, asset.url, asset.thumbnail));
        }
    };
    ui_assetpicker.prototype.hideAsset = function () {
        for (var key in this.assetButtons) {
            for (var i = 0; i < this.assetButtons[key].length; i++) {
                this.assetButtons[key][i].hide();
            }
        }
    };
    ui_assetpicker.prototype.setAddAssetMode = function (type, callback) {
        this.addAssetFunction = callback;
        this.addAssetMode = true;
        this.type = type;
        this.show();
        this.setAssetList(type);
    };
    ui_assetpicker.prototype.addWaitedAssetButton = function (url, image) {
        if (this.waitingAsset == null)
            return;
        this.checkTypeButton(this.waitingAsset);
        var asset = find(this.assetImages[this.waitingAsset], function (o) { return o.url == url; });
        if (asset == undefined) {
            this.assetButtons[this.waitingAsset].push(this.addButton(this.waitingAsset, url, image));
            this.assetImages[this.waitingAsset].push({ url: url, thumbnail: image });
        }
        if (this.waitingInput) {
            this.waitingInput.setValue(url, true);
            this.waitingInput.blurEvent(); // Blur event to force push state
        }
        this.eraseCurrent();
    };
    ui_assetpicker.prototype.addButton = function (type, url, image) {
        var _this = this;
        var button;
        if (image.indexOf('http') != -1) {
            // If opacity we add the opacity background
            if (type == 'opacity') {
                button = new ui_imagebutton(this.el, image, 'asset-button color-default-background');
            }
            else {
                button = new ui_imagebutton(this.el, image, 'asset-button');
            }
        }
        else {
            button = new ui_button(this.el, { ui: 'text', text: image }, 'asset-button');
        }
        button.on('click', function () {
            if (_this.addAssetMode)
                _this.addAssetFunction(url);
            else
                _this.currentInput.setValue(url, true);
            _this.hidePicker();
            _this.eraseCurrent();
        });
        var deletebutton = new ui_button(button.el, { ui: 'icon', text: 'delete' }, 'delete-asset-button');
        deletebutton.on('click', function (e) {
            e.stopPropagation();
            _this.deleteAsset(button, type, image);
        });
        return button;
    };
    ui_assetpicker.prototype.deleteAsset = function (button, type, key) {
        var index = this.assetButtons[type].indexOf(button);
        if (index != -1)
            this.assetButtons[type].splice(index, 1);
        if (this.onAssetDeleted)
            this.onAssetDeleted(key);
        if (this.currentInput) {
            if (key == this.currentInput.url)
                this.currentInput.setValue(undefined, true);
        }
        remove(this.assetImages[type], function (n) {
            return n.url == key;
        });
        button.destroy();
        this.setAssetList(type);
    };
    ui_assetpicker.prototype.eraseCurrent = function () {
        this.currentInput = undefined;
        this.waitingInput = null;
        this.waitingAsset = null;
    };
    ui_assetpicker.prototype.hidePicker = function () {
        this.hide();
        this.currentInput = undefined;
    };
    return ui_assetpicker;
}(ui));
export { ui_assetpicker };
export var assetpicker = new ui_assetpicker();
//# sourceMappingURL=assetPicker.js.map