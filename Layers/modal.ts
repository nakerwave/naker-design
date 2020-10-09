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
        mount(document.body, this.control);
        this.back = el('div.modal-background', { onclick: () => { this.backgroundClick(); } });
        mount(document.body, this.back);
        modalList.push(this);
        this._hide();
    }

    back: HTMLElement;
    onModalClose: Function;

    backgroundClick() {
        this.hide();
    }

    show() {
        this._show();
    }
    _show() {
        setStyle(this.control, { display: 'block' });
        for (let i = 0; i < modalList.length; i++) {
            if (modalList[i] != this) modalList[i]._hide();
        }
        setAttr(this.back, { visible: true });
        setAttr(this.control, { visible: true });
    }

    hide() {
        this._hide();
    }
    _hide() {
        setAttr(this.back, { visible: false });
        setAttr(this.control, { visible: false });
        // ! Otherwise some element in the modal can still be clickable
        // Opcity 0 is not enough
        setTimeout(() => {
            setStyle(this.control, { display: 'none' });
        }, 300);
    }
}