
import { Input } from './input';

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

export class Button extends Input {
    textnode: textnode;

    constructor(parent: HTMLElement, textnode: textnode, className?: string) {
        super(parent)
        if (!className) className = 'input-button button-primary';
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

    setText(text: string) {
        this.el.textContent = text;
    }
}

/*
  +------------------------------------------------------------------------+
  | IMAGE BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export class ImageButton extends Input {
    image: HTMLElement;

    constructor(parent: HTMLElement, imageurl: string, className?: string) {
        super(parent)
        if (!className) className = 'siimple-btn siimple-btn--primary siimple-btn--fluid input-button';
        this.el = el('div', { class: className });
        mount(this.parent, this.el);
        this.setImage(imageurl);
    }

    setImage(imageurl: string) {
        this.image = el('img', { src: imageurl, style: { width: '100%', height: '100%', 'object-fit': 'contain' } });
        setChildren(this.el, [this.image]);
    }
}
