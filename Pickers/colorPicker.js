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
import { Input } from '../Inputs/input';
import { UI } from '../Layers/common';
import { el, mount, setAttr, setStyle } from 'redom';
import * as AColorPicker from 'a-color-picker';
import clone from 'lodash/clone';
var ColorButton = /** @class */ (function (_super) {
    __extends(ColorButton, _super);
    function ColorButton(parent, label, coloroption) {
        var _this = _super.call(this, parent, label) || this;
        _this.events = {};
        _this.opacity = coloroption.opacity;
        _this.el = el('div.input-parameter', [
            _this.colorbutton = el('div.picker-button.color-default-background', { onclick: function () { _this.focus(); } }, _this.colorel = el('div.color-background')),
            _this.coloricon = el('div.icon-color.erase-icon', { onclick: function () { _this.checkErase(); }, onmouseenter: function () { _this.mouseEnter(); }, onmouseleave: function () { _this.mouseLeave(); } }, [el('span.path1'), el('span.path2'), el('span.path3')])
        ]);
        mount(_this.parent, _this.el);
        if (coloroption.removable === false)
            setStyle(_this.coloricon, { display: 'none' });
        if (coloroption.color)
            _this.setValue(coloroption.color);
        return _this;
    }
    ColorButton.prototype.checkErase = function () {
        if (this.rgba !== undefined)
            this.setValue(undefined, true);
        else
            this.focus();
    };
    ColorButton.prototype.mouseEnter = function () {
        if (this.rgba !== undefined)
            this.setIcon('delete');
    };
    ColorButton.prototype.mouseLeave = function () {
        this.setIcon('color');
    };
    ColorButton.prototype.setIcon = function (icon) {
        setAttr(this.coloricon, { class: 'icon-' + icon + ' erase-icon' });
    };
    ColorButton.prototype.setValue = function (rgba, frompicker) {
        if (rgba == undefined)
            return this.erase(frompicker);
        if (rgba[0] == null)
            return this.erase(frompicker); // history change
        this.rgba = clone(rgba);
        var stringRgba = clone(rgba);
        if (rgba[3] == undefined || !this.opacity)
            stringRgba[3] = 1;
        var color = 'rgba(' + stringRgba[0] + ', ' + stringRgba[1] + ', ' + stringRgba[2] + ', ' + stringRgba[3] + ')';
        setStyle(this.colorel, { 'background-color': color });
        setAttr(this.coloricon, { active: true });
        if (this.events.change && frompicker)
            this.events.change(this.rgba);
        return this;
    };
    ColorButton.prototype.erase = function (frompicker) {
        setStyle(this.colorel, { 'background-color': 'rgba(0,0,0,0)' });
        setAttr(this.coloricon, { active: false });
        if (this.events.change && frompicker)
            this.events.change(undefined);
        if (this.events.blur && frompicker)
            this.events.blur(undefined);
    };
    ColorButton.prototype.focus = function () {
        this.startrgba = this.rgba;
        setAttr(this.colorbutton, { active: true });
        colorpicker.setCurrentInput(this);
        if (this.events.focus)
            this.events.focus(this.rgba);
    };
    ColorButton.prototype.blurEvent = function (picker) {
        if (this.events.blur && picker && this.startrgba != this.rgba)
            this.events.blur(this.rgba);
        setAttr(this.colorbutton, { active: false });
    };
    ColorButton.prototype.on = function (event, funct) {
        this.events[event] = funct;
        return this;
    };
    return ColorButton;
}(Input));
export { ColorButton };
/*
  +------------------------------------------------------------------------+
  | COLOR PICKER                                                           |
  +------------------------------------------------------------------------+
*/
var ColorPicker = /** @class */ (function (_super) {
    __extends(ColorPicker, _super);
    function ColorPicker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.palette = [];
        _this.visible = false;
        _this.currentInput = null;
        return _this;
    }
    ColorPicker.prototype.set = function (palette) {
        if (typeof palette === 'object')
            this.palette = palette;
        this.el = el('div', { id: 'colorpicker', class: 'picker color-picker' }, [
            el('div.picker-title', this.title = el('div.title-text')),
            el('div.a-color-picker-palette-background')
        ]);
        mount(document.body, this.el);
        this.picker = AColorPicker.createPicker({
            attachTo: '#colorpicker',
            color: 'green',
            showHSL: false,
            showAlpha: true,
            paletteEditable: true,
            palette: palette,
        });
        this.opacityPicker = document.querySelector('.a-color-picker-alpha');
        this.setEvent();
        this.setBack();
        this.hide();
        return this;
    };
    ColorPicker.prototype.setBack = function () {
        var _this = this;
        this.back = el('div.modal-background', { onclick: function () { _this.hidePicker(); } });
        setStyle(this.back, { cursor: 'auto', 'z-index': 199 });
        mount(document.body, this.back);
    };
    ColorPicker.prototype.hidePicker = function () {
        if (!this.visible)
            return;
        this.visible = false;
        setStyle(this.back, { display: 'none' });
        this.hide();
        this.currentInput.blurEvent(this.picker);
        this.currentInput = undefined;
    };
    ColorPicker.prototype.setEvent = function () {
        var _this = this;
        this.picker.onchange = function (picker) {
            if (_this.currentInput)
                _this.currentInput.setValue(picker.rgba, true);
        };
        this.picker.oncoloradd = function (picker, color) {
            _this.palette.push(color);
        };
        this.picker.oncolorremove = function (picker, color) {
            var index = _this.palette.indexOf(color);
            _this.palette.splice(index, 1);
        };
        window.addEventListener("resize", function () {
            if (_this.currentInput)
                _this.setPickerPosition();
        });
    };
    ColorPicker.prototype.setCurrentInput = function (input) {
        this.visible = true;
        if (input.rgba == undefined)
            input.rgba = [0, 0, 0, 1];
        var rgba = clone(input.rgba);
        if (!input.opacity)
            rgba[3] = 1;
        this.picker.rgba = rgba;
        this.currentInput = input;
        this.setPickerPosition();
        this.title.textContent = input.label.textContent;
        setStyle(this.back, { display: 'block' });
        if (input.opacity)
            setStyle(this.opacityPicker, { display: 'block' });
        else
            setStyle(this.opacityPicker, { display: 'none' });
        this.show();
    };
    ColorPicker.prototype.setPickerPosition = function () {
        var pos = this.currentInput.el.getBoundingClientRect();
        var y = Math.min(pos.top - 80, window.innerHeight - 230);
        y = Math.max(y, 0);
        setStyle(this.el, { left: pos.left - 285 + 'px', top: y + 'px' });
    };
    return ColorPicker;
}(UI));
export { ColorPicker };
export var colorPicker = new ColorPicker();
//# sourceMappingURL=colorPicker.js.map