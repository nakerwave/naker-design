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
import { ui_input } from './input';
import { el, mount, setAttr } from 'redom';
/*
  +------------------------------------------------------------------------+
  | TEXT INPUT                                                             |
  +------------------------------------------------------------------------+
*/
var ui_textinput = /** @class */ (function (_super) {
    __extends(ui_textinput, _super);
    function ui_textinput(parent, label, text, className) {
        var _this = _super.call(this, parent, label) || this;
        _this.inputEvent = {
            change: 'change',
            input: 'input',
            focus: 'focus',
            blur: 'blur',
            click: 'click',
            enterkey: 'enterkey',
        };
        _this.changeFunctions = [];
        _this.enterkeyFunctions = [];
        if (!className)
            className = 'input-parameter input-text';
        _this.el = el('input', { class: 'siimple-input ' + className });
        mount(_this.parent, _this.el);
        setAttr(_this.el, { type: 'text', placeholder: text.toString(), onfocus: function () { _this.el.select(); } });
        _this.value = text.toString();
        _this.setEvents();
        return _this;
    }
    ui_textinput.prototype.setValue = function (value) {
        var _this = this;
        if (value == undefined)
            return setAttr(this.el, { value: '' });
        if (value == this.el.value)
            return this;
        this.value = value.toString();
        setAttr(this.el, { value: value });
        setAttr(this.el, { changed: true });
        setTimeout(function () { setAttr(_this.el, { changed: false }); }, 200);
        return this;
    };
    ui_textinput.prototype.setPlaceholder = function (text) {
        setAttr(this.el, { value: '' });
        setAttr(this.el, { placeholder: text.toString() });
    };
    ui_textinput.prototype.setEvents = function () {
        var _this = this;
        this.el.addEventListener('input', function (evt) {
            _this.value = evt.target.value;
        });
        this.el.addEventListener("keyup", function (evt) {
            event.preventDefault();
            if (evt.keyCode === 13) {
                _this.value = evt.target.value;
                for (var i = 0; i < _this.enterkeyFunctions.length; i++) {
                    _this.enterkeyFunctions[i](_this.value, _this, evt);
                }
            }
        });
    };
    ui_textinput.prototype.on = function (event, funct) {
        var _this = this;
        if (event == 'change')
            this.changeFunctions.push(funct);
        if (event == 'enterkey')
            this.enterkeyFunctions.push(funct);
        this.el.addEventListener(this.inputEvent[event], function (evt) {
            funct(evt.target.value, _this, evt);
        });
        if (event == 'click') {
            this.el.addEventListener('contextmenu', function (evt) {
                evt.preventDefault();
                funct(evt.target.value, _this, evt);
            }, false);
        }
        return this;
    };
    return ui_textinput;
}(ui_input));
export { ui_textinput };
/*
  +------------------------------------------------------------------------+
  | PARAGRAPH INPUT                                                        |
  +------------------------------------------------------------------------+
*/
var ui_paragraphinput = /** @class */ (function (_super) {
    __extends(ui_paragraphinput, _super);
    function ui_paragraphinput(parent, label, text, className) {
        var _this = _super.call(this, parent, label) || this;
        _this.max = 300;
        _this.inputEvent = {
            change: 'change',
            input: 'input',
            focus: 'focus',
            blur: 'blur',
            click: 'click',
            enterkey: 'enterkey',
        };
        _this.changeFunctions = [];
        _this.enterkeyFunctions = [];
        setAttr(_this.label, { class: 'input-label input-label-paragraph' });
        if (!className)
            className = 'input-paragraph editor-scroll';
        _this.el = el('textarea', { class: 'siimple-input ' + className, maxlength: _this.max });
        mount(_this.parent, _this.el);
        setAttr(_this.el, { placeholder: text.toString() });
        _this.value = text.toString();
        _this.setEvents();
        _this.setCount();
        return _this;
    }
    ui_paragraphinput.prototype.setCount = function () {
        this.count = el('div', { class: 'input-count' });
        mount(this.el.parentNode, this.count);
    };
    ui_paragraphinput.prototype.setValue = function (value) {
        var _this = this;
        if (value == undefined)
            return setAttr(this.el, { value: '' });
        if (value == this.el.value)
            return this;
        this.value = value.toString();
        setAttr(this.el, { value: value });
        setAttr(this.el, { changed: true });
        setTimeout(function () { setAttr(_this.el, { changed: false }); }, 200);
        this.count.textContent = this.value.length + '/' + this.max;
        return this;
    };
    ui_paragraphinput.prototype.setPlaceholder = function (text) {
        setAttr(this.el, { value: '' });
        setAttr(this.el, { placeholder: text.toString() });
    };
    ui_paragraphinput.prototype.setEvents = function () {
        var _this = this;
        this.el.addEventListener('input', function (evt) {
            _this.value = evt.target.value;
            _this.count.textContent = _this.value.length + '/' + _this.max;
        });
        this.el.addEventListener("keyup", function (evt) {
            event.preventDefault();
            if (evt.keyCode === 13) {
                _this.value = evt.target.value;
                for (var i = 0; i < _this.enterkeyFunctions.length; i++) {
                    _this.enterkeyFunctions[i](_this.value, _this, evt);
                }
            }
        });
    };
    ui_paragraphinput.prototype.on = function (event, funct) {
        var _this = this;
        if (event == 'change')
            this.changeFunctions.push(funct);
        if (event == 'enterkey')
            this.enterkeyFunctions.push(funct);
        this.el.addEventListener(this.inputEvent[event], function (evt) {
            funct(evt.target.value, _this, evt);
        });
        if (event == 'click') {
            this.el.addEventListener('contextmenu', function (evt) {
                evt.preventDefault();
                funct(evt.target.value, _this, evt);
            }, false);
        }
        return this;
    };
    return ui_paragraphinput;
}(ui_input));
export { ui_paragraphinput };
//# sourceMappingURL=text.js.map