import { unmount, setStyle } from 'redom';
var ui = /** @class */ (function () {
    function ui() {
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
    ui.prototype.on = function (event, funct) {
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
    ui.prototype.destroy = function () {
        if (this.el.parentNode)
            unmount(this.el.parentNode, this.el);
        return this;
    };
    ui.prototype.hide = function () {
        setStyle(this.el, { display: 'none' });
        return this;
    };
    ui.prototype.show = function () {
        setStyle(this.el, { display: 'block' });
        return this;
    };
    return ui;
}());
export { ui };
//# sourceMappingURL=common.js.map