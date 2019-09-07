
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

    constructor(title: string, description ? : string) {
        this.control = el('div.modal',
            this.header = el('div.modal-title-background',
                [
                    this.title = el('div.modal-title', title),
                    this.description = el('div.modal-description', description),
                ]
            )
        );
        setStyle(this.control, { display: 'none' });
        mount(document.body, this.control);
        this.back = el('div.modal-background', { onclick: () => { this.backgroundClick(); } },
            el('div.modal-close.icon-close', { onclick: () => { this.backgroundClick(); } },
                [el('span.path1'), el('span.path2'), el('span.path3')]
            ),
        );
        mount(document.body, this.back);
        modalList.push(this);
    }

    back: HTMLElement;
    backopacity = 0.7;
    onmodalclose: Function;

    backgroundClick() {
        this.hideModal();
        if (this.onmodalclose) this.onmodalclose();
    }

    animInterval: any;
    animate(funct1:Function, funct2:Function) {
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

    showModal() {
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

    hideModal() {
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