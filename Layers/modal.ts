import { el, setStyle, mount, setAttr } from 'redom';

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

        let closeButton: HTMLElement
        // We use a form to make sure we have no autocompletion
        this.control = el('form.modal.' + modalclass, { autocomplete: "off", onsubmit: (evt) => { evt.preventDefault(); } },
            [
                el('div.modal-close.button-neumorphisme', { onclick: (() => { this.backgroundClick() }) },
                    closeButton = el('div.button-shadow')
                ),
                this.title = el('div.modal-title'),
                this.description = el('div.modal-description', description),
            ]
        );

        closeButton.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" role="img" width="20px" height="20px" fill="none"><path stroke="currentColor" stroke-width="1.5" d="M18.972 5.027L5.027 18.972m0-13.945l13.945 13.945"></path></svg>'

        if (!title) setStyle(this.title, { display: 'none' });
        else this.title.innerHTML = title;
        if (!description) setStyle(this.description, { display: 'none' });
        mount(document.body, this.control);
        this.back = el('div.modal-background', { onclick: () => { this.backgroundClick(); } });
        mount(document.body, this.back);
        modalList.push(this);
        this._hide();
    }

    addLayer(children: Array<HTMLElement> | HTMLElement, index?: number): HTMLElement {
        let newLayer = el('div.modal-layer', children);
        if (index !== undefined) {
            let beforChild = this.control.childNodes[index];
            this.control.insertBefore(newLayer, beforChild);
        } else {
            mount(this.control, newLayer);
        }
        return newLayer;
    }

    back: HTMLElement;
    onModalClose: Function;

    backgroundClick() {
        this.hide();
    }

    shown = false;
    show() {
        this._show();
    }
    _show() {
        setStyle(this.control, { display: 'block' });
        for (let i = 0; i < modalList.length; i++) {
            if (modalList[i] != this) modalList[i]._hide();
        }
        this.shown = true;
        setAttr(this.back, { visible: true });
        setAttr(this.control, { visible: true });
    }

    hide() {
        this._hide();
    }
    _hide() {
        setAttr(this.back, { visible: false });
        setAttr(this.control, { visible: false });
        //! Otherwise some element are still clickable above the rest
        this.shown = false;
        setTimeout(() => {
            if (!this.shown) setStyle(this.control, { display: 'none' });
        }, 300);
    }
}