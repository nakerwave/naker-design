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
  | CHECKBOX                                                               |
  +------------------------------------------------------------------------+
*/
var Checkbox = /** @class */ (function (_super) {
    __extends(Checkbox, _super);
    function Checkbox(parent, label, checked) {
        var _this = _super.call(this, parent, label) || this;
        _this.inputEvent = {
            change: 'click',
            focus: 'mousedown',
            blur: 'mouseup',
        };
        var key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        var div = el('div.main-checkbox.input-parameter', [
            _this.el = el('input.checkbox', { type: 'checkbox', checked: checked, id: 'myCheckbox' + key }),
            el('label.checkbox', { for: 'myCheckbox' + key })
        ]);
        mount(_this.parent, div);
        return _this;
    }
    Checkbox.prototype.setValue = function (checked) {
        if (checked == undefined)
            return setAttr(this.el, { checked: false });
        setAttr(this.el, { checked: checked });
    };
    Checkbox.prototype.on = function (event, funct) {
        var _this = this;
        this.el.addEventListener(this.inputEvent[event], function (evt) {
            funct(evt.target.checked, _this);
        });
        return this;
    };
    return Checkbox;
}(Input));
export { Checkbox };
//# sourceMappingURL=checkbox.js.map