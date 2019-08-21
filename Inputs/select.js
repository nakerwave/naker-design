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
import { el, mount } from 'redom';
import Suggestions from 'suggestions';
var SelectInput = /** @class */ (function (_super) {
    __extends(SelectInput, _super);
    function SelectInput(parent, label, selectoption) {
        var _this = _super.call(this, parent, label) || this;
        _this.selectlabels = [];
        _this.inputEvent = {
            change: 'input',
            focus: 'mousedown',
            blur: 'blur',
        };
        _this.changeFunctions = [];
        _this.blurFunctions = [];
        _this.el = el('div.select.siimple-select.input-parameter');
        mount(_this.parent, _this.el);
        _this.el.textContent = selectoption.value;
        _this.setInput(selectoption);
        _this.setEvents();
        return _this;
    }
    SelectInput.prototype.setInput = function (selectoption) {
        var _this = this;
        // We trick the suggestion library to be able to use it as select list
        // Classic select style not really beautiful and customizable
        this.suggestion = new Suggestions(this.el, [], {
            minLength: 0
        });
        this.suggestion.handleInputChange = function () { };
        this.setOptions(selectoption.list);
        this.list.handleMouseUp = function (item) {
            _this.list.hide();
            _this.setValue(item.string);
            for (var i = 0; i < _this.changeFunctions.length; i++) {
                _this.changeFunctions[i](item.string, _this);
            }
        };
    };
    SelectInput.prototype.setOptions = function (options) {
        this.options = options;
        this.suggestion.update(options);
        this.list = this.suggestion.list;
        this.list.clear();
        for (var i = 0; i < options.length; i++) {
            this.list.add({ string: options[i] });
        }
        this.list.draw();
        this.list.hide();
    };
    SelectInput.prototype.setEvents = function () {
        var _this = this;
        this.on('focus', function () {
            _this.list.show();
        });
        this.on('blur', function () {
            _this.list.hide();
        });
        document.addEventListener('click', function (e) {
            if (e.target !== _this.el)
                _this.blur();
        });
    };
    SelectInput.prototype.blur = function () {
        for (var i = 0; i < this.blurFunctions.length; i++) {
            this.blurFunctions[i](this.value, this);
        }
    };
    SelectInput.prototype.setValue = function (value) {
        if (value == undefined)
            value = '';
        this.value = value;
        this.el.textContent = value;
    };
    SelectInput.prototype.on = function (event, funct) {
        var _this = this;
        if (event == 'change')
            this.changeFunctions.push(funct);
        if (event == 'blur')
            this.blurFunctions.push(funct);
        this.el.addEventListener(this.inputEvent[event], function (evt) {
            funct(evt.target.value, _this);
        });
        return this;
    };
    return SelectInput;
}(Input));
export { SelectInput };
//# sourceMappingURL=select.js.map