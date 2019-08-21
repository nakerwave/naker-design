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
import { el, mount, setChildren } from 'redom';
var ui_button = /** @class */ (function (_super) {
    __extends(ui_button, _super);
    function ui_button(parent, textnode, className) {
        var _this = _super.call(this, parent) || this;
        if (!className)
            className = 'siimple-btn siimple-btn--primary siimple-btn--fluid input-button';
        _this.textnode = textnode;
        if (textnode.ui == 'text') {
            _this.el = el('div', { class: className }, textnode.text);
            mount(_this.parent, _this.el);
        }
        else if (textnode.ui == 'icon') {
            _this.el = el('div', { class: className + ' icon-' + textnode.text }, [el('span.path1'), el('span.path2'), el('span.path3')]);
            mount(_this.parent, _this.el);
        }
        else if (textnode.ui == 'image') {
            _this.el = el('div', { class: className }, el('img', { src: textnode.text }));
            mount(_this.parent, _this.el);
        }
        return _this;
    }
    ui_button.prototype.setText = function (text) {
        this.el.textContent = text;
    };
    return ui_button;
}(ui_input));
export { ui_button };
/*
  +------------------------------------------------------------------------+
  | IMAGE BUTTON                                                           |
  +------------------------------------------------------------------------+
*/
var ui_imagebutton = /** @class */ (function (_super) {
    __extends(ui_imagebutton, _super);
    function ui_imagebutton(parent, imageurl, className) {
        var _this = _super.call(this, parent) || this;
        if (!className)
            className = 'siimple-btn siimple-btn--primary siimple-btn--fluid input-button';
        _this.el = el('div', { class: className });
        mount(_this.parent, _this.el);
        _this.setImage(imageurl);
        return _this;
    }
    ui_imagebutton.prototype.setImage = function (imageurl) {
        this.image = el('img', { src: imageurl, style: { width: '100%', height: '100%', 'object-fit': 'contain' } });
        setChildren(this.el, [this.image]);
    };
    return ui_imagebutton;
}(ui_input));
export { ui_imagebutton };
//# sourceMappingURL=button.js.map