
import { el, setStyle, mount } from 'redom';

/*
  +------------------------------------------------------------------------+
  | MODAL                                                                  |
  +------------------------------------------------------------------------+
*/

let modalList = [];

export class Modal {

    control: HTMLElement;
    header: HTMLElement;
    title: HTMLElement;
    description: HTMLElement;
    icon: HTMLElement;

    constructor(title: string, description?: string, clas?: string) {
        let modalclass = (clas) ? clas : '';
        // We use a form to make sure we have no autocompletion
        this.control = el('form.modal.' + modalclass, { autocomplete: "off", onsubmit: (evt) => { evt.preventDefault(); } },
            [
                el('div.modal-close.icon-close', { onclick: () => { this.backgroundClick(); } },
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                ),
                this.title = el('div.modal-title'),
                this.description = el('div.modal-description', description),
            ]
        );
        if (!title) setStyle(this.title, { display: 'none' });
        else this.title.innerHTML = title;
        if (!description) setStyle(this.description, { display: 'none' });
        setStyle(this.control, { display: 'none' });
        mount(document.body, this.control);
        this.back = el('div.modal-background', { onclick: () => { this.backgroundClick(); } });
        mount(document.body, this.back);
        modalList.push(this);
    }

    back: HTMLElement;
    backopacity = 0.7;
    onModalClose: Function;

    backgroundClick() {
        this.hide();
    }

    animInterval: any;
    animate(funct1: Function, funct2: Function) {
        clearInterval(this.animInterval);
        let i = 0;
        this.animInterval = setInterval(() => {
            let perc = Math.pow(i / 10, 2);
            funct1(perc);
            if (i == 10) {
                clearInterval(this.animInterval);
                funct2();
            }
            i++;
        }, 20);
    }

    show() {
        this._show();
    }
    _show() {
        for (let i = 0; i < modalList.length; i++) {
            setStyle(modalList[i].back, { display: 'none' });
            setStyle(modalList[i].control, { display: 'none' });
        }
        setStyle(this.back, { display: 'block', opacity: 0 });
        setStyle(this.control, { display: 'block', opacity: 0 });
        this.animate((perc) => {
            let op = perc * this.backopacity;
            setStyle(this.back, { opacity: op });
            setStyle(this.control, { opacity: op });
        }, () => {
            setStyle(this.back, { opacity: this.backopacity });
            setStyle(this.control, { opacity: 1 });
        });
    }

    hide() {
        this._hide();
    }
    _hide() {
        if (this.onModalClose) this.onModalClose();
        this.animate((perc) => {
            let op = (1 - perc) * this.backopacity;
            setStyle(this.back, { opacity: op });
            setStyle(this.control, { opacity: op });
        }, () => {
            setStyle(this.back, { display: 'none' });
            setStyle(this.control, { display: 'none' });
        });
    }
}