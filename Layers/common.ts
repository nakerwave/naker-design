
import { unmount, setStyle } from 'redom';

export interface elementEvents {
    change?: string,
    focus?: string,
    blur?: string,
    input?: string,
    click?: string,
    enterkey?: string,
    down?: string,
    up?: string,
    enter?: string,
    leave?: string,
    move?: string,
    dblclick?: string,
}

export class UI {

    el: HTMLElement;

    renameEvent: elementEvents = {
        click: 'click',
        down: 'mousedown',
        up: 'mouseup',
        enter: 'mouseenter',
        leave: 'mouseleave',
        move: 'mousemove',
        dblclick: "dblclick",
    }

    on(event: string, funct: Function) {
        let nodeevent = this.renameEvent[event];
        this.el.addEventListener(nodeevent, (evt) => {
            funct(evt, this);
        });
        if (event == 'click') setStyle(this.el, { cursor: 'pointer' });
        return this;
    }

    // TODO delete all eventlistenner properly
    destroy() {
        if (this.el.parentNode) unmount(this.el.parentNode, this.el);
        return this;
    }

    hide() {
        setStyle(this.el, { display: 'none' });
        return this;
    }

    show() {
        setStyle(this.el, { display: 'block' });
        return this;
    }
}
