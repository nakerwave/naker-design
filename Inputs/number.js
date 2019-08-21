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
import { ui_input, defaultleftinput } from './input';
import { el, unmount, mount, setAttr, setStyle } from 'redom';
import merge from 'lodash/merge';
var ui_numberinput = /** @class */ (function (_super) {
    __extends(ui_numberinput, _super);
    function ui_numberinput(parent, label, number) {
        var _this = _super.call(this, parent, label) || this;
        _this.width = 40;
        _this.left = defaultleftinput;
        _this.inputEvent = {
            change: 'input',
            focus: 'focus',
            blur: 'blur',
            click: 'click',
            enterkey: 'enterkey',
        };
        _this.changeFunctions = [];
        _this.enterkeyFunctions = [];
        _this.el = el('input.siimple-input.input-parameter');
        if (number.width !== undefined)
            _this.width = number.width;
        if (number.left !== undefined)
            _this.left = number.left;
        setStyle(_this.el, { width: _this.width + 'px', left: _this.left.toString() + 'px' });
        mount(_this.parent, _this.el);
        if (number.value)
            setAttr(_this.el, { value: number.value });
        var step = (number.step) ? number.step : 0.1;
        _this.value = number.value;
        setAttr(_this.el, { type: 'number', step: step, onfocus: function () { _this.el.select(); } });
        _this.setMinMax(number);
        if (number.decimal !== undefined)
            _this.decimal = number.decimal;
        _this.setUnit(number);
        _this.setEvents();
        return _this;
    }
    ui_numberinput.prototype.setMinMax = function (number) {
        this.min = number.min;
        this.max = number.max;
        // Prevent the correct step, it can add the minimum value to the step
        // if (number.min !== undefined) setAttr(this.el, { min: number.min });
        // if (number.max !== undefined) setAttr(this.el, { max: number.max });
    };
    ui_numberinput.prototype.setUnit = function (number) {
        var _this = this;
        this.unit = el('div', { class: 'input-unit' });
        this.unit.textContent = number.unit;
        mount(this.el.parentNode, this.unit);
        this.on('focus', function () { setStyle(_this.unit, { display: 'none' }); });
        this.on('blur', function () { setStyle(_this.unit, { display: 'block' }); });
        this.updateUnit(number.unit);
    };
    ui_numberinput.prototype.updateUnit = function (unit) {
        var unitwidth = unit.length * 10;
        setStyle(this.unit, { left: (this.left + this.width - unitwidth - 2).toString() + 'px', width: unitwidth + 'px' });
        this.unit.textContent = unit;
    };
    ui_numberinput.prototype.setValue = function (value) {
        var _this = this;
        if (value == undefined)
            return setAttr(this.el, { value: 0 });
        if (value === this.el.value)
            return this;
        this.value = value;
        this.checkDecimal();
        setAttr(this.el, { value: this.value });
        setStyle(this.el, { border: '2px', color: colormain });
        setTimeout(function () { setStyle(_this.el, { border: '0px', color: colortext }); }, 200);
        return this;
    };
    ui_numberinput.prototype.checkDecimal = function () {
        if (this.value) {
            var abs = Math.abs(this.value);
            var decimal = abs - Math.floor(abs);
            if (decimal && this.decimal) {
                var highvalue = this.value * Math.pow(10, this.decimal);
                var signvalue = (this.value > 0) ? Math.floor(highvalue) : Math.ceil(highvalue);
                this.value = signvalue / Math.pow(10, this.decimal);
            }
        }
        if (!this.value && this.value !== 0)
            this.value = 0;
    };
    ui_numberinput.prototype.checkMaxMin = function () {
        var value = parseFloat(this.el.value);
        if (this.min)
            value = Math.max(this.min, value);
        if (this.max)
            value = Math.min(this.max, value);
        // Make sure value is not empty which gives a NaN
        if (!this.value && this.value !== 0)
            this.value = 0;
        // If decimal number, it can be very anoying to change the value we type
        // str.length > 2 so that we can have empty value
        var str = this.value.toString();
        if (str.indexOf('.') == -1 && str.length > 2)
            setAttr(this.el, { value: this.value });
        this.value = value;
    };
    ui_numberinput.prototype.setEvents = function () {
        var _this = this;
        this.el.addEventListener('blur', function (evt) {
            setAttr(_this.el, { value: _this.value });
        });
        this.el.addEventListener("keyup", function (evt) {
            event.preventDefault();
            if (evt.keyCode === 13) {
                _this.checkMaxMin();
                _this.checkDecimal();
                for (var i = 0; i < _this.enterkeyFunctions.length; i++) {
                    _this.enterkeyFunctions[i](_this.value, _this, evt);
                }
            }
        });
    };
    ui_numberinput.prototype.on = function (event, funct) {
        var _this = this;
        if (event == 'change')
            this.changeFunctions.push(funct);
        if (event == 'enterkey')
            this.enterkeyFunctions.push(funct);
        this.el.addEventListener(this.inputEvent[event], function (evt) {
            _this.value = parseFloat(_this.el.value);
            // Useless to check value when focus + prevent auto selection on focus
            if (event != 'focus') {
                _this.checkMaxMin();
                _this.checkDecimal();
            }
            funct(_this.value, _this, evt);
        });
        return this;
    };
    return ui_numberinput;
}(ui_input));
export { ui_numberinput };
/*
  +------------------------------------------------------------------------+
  | VECTOR                                                                 |
  +------------------------------------------------------------------------+
*/
var ui_vectorinput = /** @class */ (function (_super) {
    __extends(ui_vectorinput, _super);
    function ui_vectorinput(parent, label, numberoption) {
        var _this = _super.call(this, parent, label) || this;
        _this.numberInputs = {};
        var vectorContainer = el('div.vector-container');
        mount(_this.parent, vectorContainer);
        var i = 0;
        for (var key in { x: 0, y: 0, z: 0 }) {
            var vectoroption = merge(numberoption, { value: 0, unit: key.toUpperCase(), width: 50, left: i * 54, decimal: 2 });
            _this.numberInputs[key] = new ui_numberinput(parent, '', vectoroption);
            unmount(parent, _this.numberInputs[key].parent);
            mount(vectorContainer, _this.numberInputs[key].el);
            setAttr(_this.numberInputs[key].el, { class: 'vector-input' });
            i++;
        }
        return _this;
    }
    ui_vectorinput.prototype.on = function (event, funct) {
        var _this = this;
        for (var key in this.numberInputs) {
            (function (key) {
                _this.numberInputs[key].on(event, function (number) {
                    var change = {};
                    change[key] = number;
                    funct(change);
                });
            })(key);
        }
        return this;
    };
    return ui_vectorinput;
}(ui_input));
export { ui_vectorinput };
//# sourceMappingURL=number.js.map