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
import { Input } from './input';
import { el, mount, setAttr } from 'redom';
/*
  +------------------------------------------------------------------------+
  | TEXT INPUT                                                             |
  +------------------------------------------------------------------------+
*/
var TextInputinput = /** @class */ (function (_super) {
    __extends(TextInputinput, _super);
    function TextInputinput(parent, label, text, className) {
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
    TextInputinput.prototype.setValue = function (value) {
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
    TextInputinput.prototype.setPlaceholder = function (text) {
        setAttr(this.el, { value: '' });
        setAttr(this.el, { placeholder: text.toString() });
    };
    TextInputinput.prototype.setEvents = function () {
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
    TextInputinput.prototype.on = function (event, funct) {
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
    return TextInputinput;
}(Input));
export { TextInputinput };
/*
  +------------------------------------------------------------------------+
  | PARAGRAPH INPUT                                                        |
  +------------------------------------------------------------------------+
*/
var ParagraphInputinput = /** @class */ (function (_super) {
    __extends(ParagraphInputinput, _super);
    function ParagraphInputinput(parent, label, text, className) {
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
    ParagraphInputinput.prototype.setCount = function () {
        this.count = el('div', { class: 'input-count' });
        mount(this.el.parentNode, this.count);
    };
    ParagraphInputinput.prototype.setValue = function (value) {
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
    ParagraphInputinput.prototype.setPlaceholder = function (text) {
        setAttr(this.el, { value: '' });
        setAttr(this.el, { placeholder: text.toString() });
    };
    ParagraphInputinput.prototype.setEvents = function () {
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
    ParagraphInputinput.prototype.on = function (event, funct) {
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
    return ParagraphInputinput;
}(Input));
export { ParagraphInputinput };
//# sourceMappingURL=text.js.map