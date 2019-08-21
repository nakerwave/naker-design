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
// import { undo } from '../service/undo';
import { ui_button } from '../Inputs/button';
import { ui_textinput, ui_paragraphinput } from '../Inputs/text';
import { ui_numberinput, ui_vectorinput } from '../Inputs/number';
import { ui_checkbox } from '../Inputs/checkbox';
import { ui_slider } from '../Inputs/slider';
import { ui_radio, ui_radioicon } from '../Inputs/radio';
import { ui_select } from '../Inputs/select';
import { ui_colorbutton } from '../Pickers/colorPicker';
import { ui_assetbutton, ui_imageassetbutton, ui_textassetbutton } from '../Pickers/assetPicker';
import { el, mount, unmount, setStyle, setAttr } from 'redom';
/*
  +------------------------------------------------------------------------+
  | MAIN MANAGER                                                           |
  +------------------------------------------------------------------------+
*/
var ui_manager = /** @class */ (function () {
    function ui_manager(parent) {
        this.el = el('div.parameter-group');
        mount(parent, this.el);
    }
    ui_manager.prototype.addText = function (text, className) {
        var textNode = el('div', { class: className }, text);
        mount(this.el, textNode);
        return textNode;
    };
    ui_manager.prototype.addLink = function (text, link, className) {
        var linkNode = el('a', { class: className, 'href': link, 'target': '_blank' }, text);
        mount(this.el, linkNode);
        return linkNode;
    };
    ui_manager.prototype.addIcon = function (icon, className) {
        var iconNode = el('div', { class: className + ' icon-' + icon }, [el('span.path1'), el('span.path2'), el('span.path3')]);
        mount(this.el, iconNode);
        return iconNode;
    };
    ui_manager.prototype.addButton = function (textnode, callback) {
        var button = new ui_button(this.el, textnode);
        button.on('click', function (text) {
            callback(text);
            // undo.pushState();
        });
        return button;
    };
    ui_manager.prototype.addTextInput = function (label, text, callback) {
        var textInput = new ui_textinput(this.el, label, text);
        // textInput.on('blur', (text) => {
        //   undo.pushState();
        // });
        textInput.on('change', function (text) {
            callback(text);
        });
        return textInput;
    };
    ui_manager.prototype.addParagraphInput = function (label, paragraph, callback) {
        var paragraphInput = new ui_paragraphinput(this.el, label, paragraph);
        // paragraphInput.on('blur', (paragraph) => {
        //   undo.pushState();
        // });
        paragraphInput.on('change', function (paragraph) {
            callback(paragraph);
        });
        return paragraphInput;
    };
    ui_manager.prototype.addColorInput = function (label, coloroption, callback) {
        var colorInput = new ui_colorbutton(this.el, label, coloroption);
        colorInput.on('change', function (rgba) {
            callback(rgba);
        });
        // colorInput.on('blur', (rgba) => {
        //   undo.pushState();
        // });
        return colorInput;
    };
    ui_manager.prototype.addAssetInput = function (label, asset, callback) {
        var assetInput = new ui_assetbutton(this.el, label, asset);
        assetInput.on('change', function (url) {
            callback(url);
        });
        // assetInput.on('blur', (url) => {
        //   undo.pushState();
        // });
        return assetInput;
    };
    ui_manager.prototype.addImageAssetInput = function (label, asset, callback) {
        var imageAssetInput = new ui_imageassetbutton(this.el, label, asset);
        imageAssetInput.on('change', function (url) {
            callback(url);
        });
        // imageAssetInput.on('blur', (url) => {
        //   undo.pushState();
        // });
        return imageAssetInput;
    };
    ui_manager.prototype.addTextAssetInput = function (label, asset, callback) {
        var textAssetInput = new ui_textassetbutton(this.el, label, asset);
        textAssetInput.on('change', function (url) {
            callback(url);
        });
        // textAssetInput.on('blur', (url) => {
        //   undo.pushState();
        // });
        return textAssetInput;
    };
    ui_manager.prototype.addColorAndAssetInput = function (label, coloroption, asset, callback) {
        var colorInput = new ui_colorbutton(this.el, label, coloroption);
        setAttr(colorInput, { class: 'input-parameter-first' });
        colorInput.on('change', function (rgba) {
            callback('color', rgba);
        });
        // colorInput.on('blur', (rgba) => {
        //   undo.pushState();
        // });
        // let assetInput = inputContainer.addAssetButton(asset, 'input-parameter-second');
        // assetInput.on('change', (url) => {
        //   callback('asset', url);
        // });
        // assetInput.on('blur', (url) => {
        //   undo.pushState();
        // });
        // return {color:colorInput, asset:assetInput};
    };
    ui_manager.prototype.addCheckBox = function (label, checked, callback) {
        var checkboxInput = new ui_checkbox(this.el, label, checked);
        checkboxInput.on('change', function (checked) {
            callback(checked);
            // undo.pushState();
        });
        return checkboxInput;
    };
    ui_manager.prototype.addSlider = function (label, slideroption, callback) {
        var sliderInput = new ui_slider(this.el, label, slideroption);
        sliderInput.on('change', function (value) {
            callback(value);
        });
        // sliderInput.on('blur', (value) => {
        //   undo.pushState();
        // });
        return sliderInput;
    };
    ui_manager.prototype.addRadio = function (label, radiooption, callback) {
        var radioInput = new ui_radio(this.el, label, radiooption);
        radioInput.on('change', function (value) {
            callback(value);
            // PushState in change because blur is called before change and it won't be saved
            // undo.pushState();
        });
        return radioInput;
    };
    ui_manager.prototype.addRadioIcon = function (label, radiooption, callback) {
        var radioInput = new ui_radioicon(this.el, label, radiooption);
        radioInput.on('change', function (value) {
            callback(value);
            // PushState in change event because blur is called before change and it won't be saved
            // undo.pushState();
        });
        return radioInput;
    };
    ui_manager.prototype.addSelect = function (label, selectoption, callback) {
        var selectInput = new ui_select(this.el, label, selectoption);
        selectInput.on('change', function (value) {
            callback(value);
            // undo.pushState();
        });
        return selectInput;
    };
    ui_manager.prototype.addNumberInput = function (label, numberoption, callback) {
        var numberInput = new ui_numberinput(this.el, label, numberoption);
        numberInput.on('change', function (text) {
            callback(text);
        });
        // numberInput.on('blur', (text) => {
        //   undo.pushState();
        // });
        return numberInput;
    };
    ui_manager.prototype.addVectorInput = function (label, numberoption, callback) {
        var vectorInput = new ui_vectorinput(this.el, label, numberoption);
        vectorInput.on('change', function (change) {
            callback(change);
        });
        // vectorInput.on('blur', () => {
        //   undo.pushState();
        // });
        return vectorInput;
    };
    return ui_manager;
}());
export { ui_manager };
/*
  +------------------------------------------------------------------------+
  | DESIGN MANAGER                                                         |
  +------------------------------------------------------------------------+
*/
var floatingManager = /** @class */ (function (_super) {
    __extends(floatingManager, _super);
    function floatingManager(title, expandable) {
        var _this = _super.call(this, layerRight) || this;
        _this.expanded = true;
        if (title)
            _this.addTitle(title);
        if (expandable === false) {
            unmount(_this.titleParent, _this.expand);
            if (title)
                setStyle(_this.title, { left: '3px' });
        }
        return _this;
    }
    floatingManager.prototype.addTitle = function (title) {
        var _this = this;
        this.titleParent = el('div.parameter-title', this.title = el('div.title-text', title), this.expand = el('div.title-expand.icon-expand', { onclick: function () { _this.switch(); } }, [el('span.path1'), el('span.path2'), el('span.path3')]));
        mount(this.el, this.titleParent);
    };
    floatingManager.prototype.addSubTitle = function (title) {
        var textNode = el('div.parameter-subtitle', title);
        mount(this.el, textNode);
    };
    floatingManager.prototype.switch = function () {
        if (this.expanded) {
            this.expanded = false;
            setStyle(this.el, { height: '25px' });
            setStyle(this.expand, { transform: 'rotateZ(0deg)' });
        }
        else {
            this.expanded = true;
            setStyle(this.el, { height: 'auto' });
            setStyle(this.expand, { transform: 'rotateZ(90deg)' });
        }
    };
    floatingManager.prototype.freezeInput = function (input, bool) {
        if (bool)
            setStyle(input.el, { display: 'none' });
        else
            setStyle(input.el, { display: 'block' });
        if (input.unit) {
            if (bool)
                setStyle(input.unit, { display: 'none' });
            else
                setStyle(input.unit, { display: 'block' });
        }
    };
    return floatingManager;
}(ui_manager));
export { floatingManager };
/*
  +------------------------------------------------------------------------+
  | PARENT DESIGN MANAGER                                                  |
  +------------------------------------------------------------------------+
*/
export var layerLeft = el('div.layer-left.presets-container.editor-scroll');
/*
  +------------------------------------------------------------------------+
  | PARENT PARAMETER MANAGER                                               |
  +------------------------------------------------------------------------+
*/
export var layerRight = el('div.layer-right.parameter-container.editor-scroll');
window.addEventListener('load', function () {
    mount(document.body, layerLeft);
    mount(document.body, layerRight);
});
//# sourceMappingURL=layer.js.map