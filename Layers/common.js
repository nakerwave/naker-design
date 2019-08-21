import { unmount, setStyle } from 'redom';
var UI = /** @class */ (function () {
    function UI() {
        this.renameEvent = {
            click: 'click',
            down: 'mousedown',
            up: 'mouseup',
            enter: 'mouseenter',
            leave: 'mouseleave',
            move: 'mousemove',
            dblclick: "dblclick",
        };
    }
    UI.prototype.on = function (event, funct) {
        var _this = this;
        var nodeevent = this.renameEvent[event];
        this.el.addEventListener(nodeevent, function (evt) {
            funct(evt, _this);
        });
        if (event == 'click')
            setStyle(this.el, { cursor: 'pointer' });
        return this;
    };
    // TODO delete all eventlistenner properly
    UI.prototype.destroy = function () {
        if (this.el.parentNode)
            unmount(this.el.parentNode, this.el);
        return this;
    };
    UI.prototype.hide = function () {
        setStyle(this.el, { display: 'none' });
        return this;
    };
    UI.prototype.show = function () {
        setStyle(this.el, { display: 'block' });
        return this;
    };
    return UI;
}());
export { UI };
//# sourceMappingURL=common.js.map