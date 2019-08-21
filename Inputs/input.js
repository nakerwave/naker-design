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
import { UI } from '../Layers/common';
import { el, mount } from 'redom';
export var defaultwithinput = 108;
export var defaultleftinput = 204;
var Input = /** @class */ (function (_super) {
    __extends(Input, _super);
    function Input(container, label) {
        var _this = _super.call(this) || this;
        _this.parent = el('div.input-container');
        if (label) {
            _this.label = el('div.input-label', label);
            mount(_this.parent, _this.label);
        }
        mount(container, _this.parent);
        return _this;
    }
    return Input;
}(UI));
export { Input };
//# sourceMappingURL=input.js.map