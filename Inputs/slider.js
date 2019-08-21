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
import noUiSlider from 'nouislider';
var ui_slider = /** @class */ (function (_super) {
    __extends(ui_slider, _super);
    function ui_slider(parent, label, slideroption) {
        var _this = _super.call(this, parent, label) || this;
        _this.step = 0.01;
        _this.curve = 'linear';
        _this.inputEvent = {
            change: 'update',
            focus: 'start',
            blur: 'end',
        };
        _this.numberInputEvent = {
            change: 'input',
            focus: 'focus',
            blur: 'blur',
        };
        setAttr(_this.parent, { class: 'input-container input-container-big' });
        _this.el = parent;
        _this.defaultValue = slideroption.value;
        _this.min = slideroption.min;
        _this.max = slideroption.max;
        if (slideroption.step)
            _this.step = slideroption.step;
        if (slideroption.curve)
            _this.curve = slideroption.curve;
        var value = _this.checkAccuracy(slideroption.value);
        _this.formerValue = value;
        _this.createSlider(_this.parent, value);
        _this.number = el('input.rangenumber.input-parameter', { type: 'number', value: value, min: _this.min, max: _this.max, step: _this.step });
        mount(_this.parent, _this.number);
        return _this;
    }
    ui_slider.prototype.createSlider = function (parent, value) {
        this.noUiSlider = noUiSlider.create(parent, {
            range: { 'min': this.min, 'max': this.max },
            step: this.step,
            start: [value],
            connect: 'lower',
        });
    };
    ui_slider.prototype.setValue = function (value) {
        if (value == undefined) {
            setAttr(this.number, { value: this.defaultValue });
            this.noUiSlider.set([this.defaultValue]);
        }
        else {
            value = this.checkAccuracy(value);
            setAttr(this.number, { value: value });
            var slidervalue = this.checkNumberCurve(value);
            this.noUiSlider.set([slidervalue], false);
        }
        this.formerValue = value;
    };
    ui_slider.prototype.checkSliderCurve = function (value) {
        if (this.curve == 'linear') {
            return value;
        }
        else if (this.curve == 'logarithmic') {
            var newvalue = parseFloat(value);
            newvalue = Math.pow(newvalue, 2) / this.max;
            newvalue = this.checkAccuracy(newvalue);
            return newvalue.toString();
        }
    };
    ui_slider.prototype.checkNumberCurve = function (value) {
        if (this.curve == 'linear') {
            return value;
        }
        else if (this.curve == 'logarithmic') {
            var newvalue = parseFloat(value);
            newvalue = Math.pow(newvalue * this.max, 1 / 2);
            return newvalue.toString();
        }
    };
    ui_slider.prototype.checkMaxMin = function (value) {
        var newvalue = parseFloat(value);
        if (this.min)
            newvalue = Math.max(this.min, newvalue);
        if (this.max)
            newvalue = Math.min(this.max, newvalue);
        // Make sure value is not empty which gives a NaN
        if (!newvalue && newvalue !== 0)
            newvalue = 0;
        // If decimal number, it can be very anoying to change the value we type
        var str = value.toString();
        if (str.indexOf('.') == -1)
            return newvalue;
        else
            return value;
    };
    ui_slider.prototype.checkAccuracy = function (value) {
        var accuracy = 1 / this.step;
        return Math.round(value * accuracy) / accuracy;
    };
    ui_slider.prototype.on = function (event, funct) {
        var _this = this;
        this.noUiSlider.on(this.inputEvent[event], function (values, handle) {
            var value = values[0];
            value = _this.checkAccuracy(value);
            if (value == _this.formerValue)
                return;
            _this.formerValue = value;
            value = _this.checkSliderCurve(value);
            setAttr(_this.number, { value: value });
            funct(parseFloat(value), _this);
        });
        this.number.addEventListener(this.numberInputEvent[event], function (evt) {
            var value = _this.checkMaxMin(evt.target.value);
            value = _this.checkAccuracy(value);
            if (value == _this.formerValue)
                return;
            _this.formerValue = value;
            setAttr(_this.number, { value: value });
            var slidervalue = _this.checkNumberCurve(value);
            _this.noUiSlider.set([slidervalue]);
            funct(parseFloat(value), _this);
        });
        return this;
    };
    return ui_slider;
}(ui_input));
export { ui_slider };
//# sourceMappingURL=slider.js.map