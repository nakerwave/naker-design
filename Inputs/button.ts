
import { Input, inputEvents } from './input';

import { el, mount, setChildren } from 'redom';

/*
+------------------------------------------------------------------------+
| BUTTON                                                                 |
+------------------------------------------------------------------------+
*/

export interface textnode {
    ui: string;
    text: string;
}

export class Button extends Input<any> {
    textnode: textnode;

    constructor(parent: HTMLElement, textnode: textnode, className?: string) {
        super(parent, textnode.text)
        this.hideLabel();
        if (!className) className = 'input-button input-button-center button-primary';
        this.textnode = textnode;
        if (textnode.ui == 'text') {
            this.el = el('div', { class: className }, textnode.text);
            mount(this.parent, this.el);
        } else if (textnode.ui == 'icon') {
            this.el = el('div', { class: className + ' icon-' + textnode.text }, [el('span.path1'), el('span.path2'), el('span.path3')]);
            mount(this.parent, this.el);
        } else if (textnode.ui == 'image') {
            this.el = el('div', { class: className },
                el('img', { src: textnode.text })
            );
            mount(this.parent, this.el);
        }
    }

    setValue() {

    }

    inputEvent: inputEvents = {
        click: 'click',
    };
    on(event: string, funct: Function) {
        this.el.addEventListener(this.inputEvent[event], (evt) => {
            funct(evt.target.value, this, evt);
        });
        return this;
    }

    setText(text: string) {
        this.el.textContent = text;
    }
}

/*
  +------------------------------------------------------------------------+
  | IMAGE BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class ImageButton extends Input<any> {
    image: HTMLElement;

    constructor(parent: HTMLElement, label:string, imageurl: string, className?: string) {
        super(parent, label);
        this.hideLabel();
        if (!className) className = 'input-button';
        this.el = el('div', { class: className });
        mount(this.parent, this.el);
        this.setImage(imageurl);
    }

    setValue(url: string) {
        this.setImage(url)
    }

    inputEvent: inputEvents = {
        click: 'click',
    };
    on(event: string, funct: Function) {
        this.el.addEventListener(this.inputEvent[event], (evt) => {
            funct(evt.target.value, this, evt);
        });
        return this;
    }

    setImage(url: string) {
        this.image = el('img', { src: url, style: { width: '100%', height: '100%', 'object-fit': 'contain' } });
        setChildren(this.el, [this.image]);
    }
}
