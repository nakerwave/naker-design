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
import { Input, defaultwithinput } from './input';
import { el, mount, setAttr, setStyle, setChildren } from 'redom';
var RadioInput = /** @class */ (function (_super) {
    __extends(RadioInput, _super);
    function RadioInput(parent, label, radiooption) {
        var _this = _super.call(this, parent, label) || this;
        _this.radiobuttons = [];
        _this.radionodes = [];
        _this.inputEvent = {
            change: 'click',
            focus: 'mousedown',
            blur: 'mouseup',
        };
        _this.el = el('div.main-radio.input-parameter');
        mount(_this.parent, _this.el);
        setStyle(_this.parent, { height: 22 * radiooption.list.length + 'px' });
        _this.setInput(radiooption);
        return _this;
    }
    RadioInput.prototype.setInput = function (radiooption) {
        this.option = radiooption.list;
        for (var i = 0; i < this.option.length; i++) {
            var label = this.option[i];
            var radiobutton = void 0;
            var div = el('div.radio-option', [
                radiobutton = el('input', { type: 'radio', id: label }),
                el('label', { for: label })
            ]);
            this.radiobuttons.push(radiobutton);
            this.radionodes.push(div);
            var radiolabel = el('div', label, { class: 'radio-label' });
            mount(div, radiolabel);
            if (label == radiooption.value)
                setAttr(radiobutton, { checked: true });
        }
        setChildren(this.el, this.radionodes);
    };
    RadioInput.prototype.setValue = function (value) {
        if (value == undefined)
            value = this.option[0];
        for (var i = 0; i < this.option.length; i++) {
            if (value == this.option[i])
                setAttr(this.radiobuttons[i], { checked: true });
            else
                setAttr(this.radiobuttons[i], { checked: false });
        }
    };
    RadioInput.prototype.on = function (event, funct) {
        var _this = this;
        for (var i = 0; i < this.radiobuttons.length; i++) {
            (function (i) {
                _this.radiobuttons[i].addEventListener(_this.inputEvent[event], function (evt) {
                    funct(evt.target.id, _this);
                    _this.setValue(evt.target.id);
                });
            })(i);
        }
        return this;
    };
    return RadioInput;
}(Input));
export { RadioInput };
var RadioIconInput = /** @class */ (function (_super) {
    __extends(RadioIconInput, _super);
    function RadioIconInput(parent, label, radiooption) {
        var _this = _super.call(this, parent, label) || this;
        _this.radiobuttons = [];
        _this.inputEvent = {
            change: 'click',
            focus: 'mousedown',
            blur: 'mouseup',
        };
        _this.option = radiooption.list;
        _this.iconperline = radiooption.iconperline;
        _this.linenumber = Math.ceil(radiooption.list.length / radiooption.iconperline);
        _this.el = el('div.radio.input-parameter');
        mount(_this.parent, _this.el);
        setStyle(_this.parent, { height: (_this.linenumber * 22 + 2).toString() + 'px' });
        setStyle(_this.el, { height: (_this.linenumber * 22).toString() + 'px' });
        setStyle(_this.el, { 'z-index': 2, overflow: 'hidden' });
        _this.setInput(label, radiooption);
        return _this;
    }
    RadioIconInput.prototype.setInput = function (label, radiooption) {
        var _this = this;
        var width = defaultwithinput / this.iconperline;
        var _loop_1 = function (i) {
            var value = this_1.option[i];
            var radiobutton = el('div.radio-icon-button.icon-' + value, {
                id: value,
                style: { width: width + 'px' },
                onmouseenter: function (evt) { _this.label.textContent = label + ' ' + value; },
                onmouseleave: function (evt) { _this.label.textContent = label; },
            }, [el('span.path1'), el('span.path2'), el('span.path3')]);
            this_1.radiobuttons.push(radiobutton);
        };
        var this_1 = this;
        for (var i = 0; i < this.option.length; i++) {
            _loop_1(i);
        }
        setChildren(this.el, this.radiobuttons);
        this.setValue(radiooption.value);
    };
    RadioIconInput.prototype.setValue = function (value) {
        if (value == undefined)
            value = this.option[0];
        for (var i = 0; i < this.option.length; i++) {
            var label = this.option[i];
            if (value == this.option[i])
                setAttr(this.radiobuttons[i], { class: 'radio-icon-button radio-selected icon-' + label });
            else
                setAttr(this.radiobuttons[i], { class: 'radio-icon-button icon-' + label });
        }
    };
    RadioIconInput.prototype.on = function (event, funct) {
        var _this = this;
        for (var i = 0; i < this.radiobuttons.length; i++) {
            (function (i) {
                var radiobutton = _this.radiobuttons[i];
                var value = radiobutton.id;
                radiobutton.addEventListener(_this.inputEvent[event], function (evt) {
                    funct(value, _this);
                    _this.setValue(value);
                });
            })(i);
        }
        return this;
    };
    return RadioIconInput;
}(Input));
export { RadioIconInput };
//# sourceMappingURL=radio.js.map