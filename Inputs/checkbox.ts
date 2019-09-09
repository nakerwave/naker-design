
import { Input, inputEvents } from './input';

import { el, mount, setAttr } from 'redom';

/*
  +------------------------------------------------------------------------+
  | CHECKBOX                                                               |
  +------------------------------------------------------------------------+
*/

export class CheckboxInput extends Input {

    constructor(parent: HTMLElement, label: string, checked: boolean) {
        super(parent, label)
        let key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        let div = el('div.main-checkbox.input-parameter',
            [
                this.el = el('input.checkbox', { type: 'checkbox', checked: checked, id: 'myCheckbox' + key }),
                el('label.checkbox', { for: 'myCheckbox' + key })
            ]
        );

        mount(this.parent, div);
        return this;
    }

    setValue(checked: boolean) {
        if (checked == undefined) return setAttr(this.el, { checked: false });
        setAttr(this.el, { checked: checked });
    }

    inputEvent: inputEvents = {
        change: 'click',
        focus: 'mousedown',
        blur: 'mouseup',
    };
    on(event: string, funct: Function) {
        this.el.addEventListener(this.inputEvent[event], (evt) => {
            funct(evt.target.checked, this);
        });
        return this;
    }
}
