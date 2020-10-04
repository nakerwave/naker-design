
import { Input, inputEvents } from './input';

import { el, mount, setAttr } from 'redom';

/*
  +------------------------------------------------------------------------+
  | CHECKBOX                                                               |
  +------------------------------------------------------------------------+
*/

// <button type="button" class="btn btn-sm btn-toggle" data - toggle="button" aria - pressed="false" autocomplete = "off" >
//     <div class="handle" > </div>
//         < /button>

export class CheckboxInput extends Input<boolean> {

    constructor(parent: HTMLElement, label: string, checked: boolean) {
        super(parent, label);
        this.currentValue
        let key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        let div = el('div.main-checkbox.input-parameter',
            this.el = el('button.btn.btn-sm.btn-toggle', {type:'button', 'aria-pressed':'false', autocomplete:'off'}, 
                el('div.handle')
            )
        );

        mount(this.parent, div);
        this.setValue(checked);
        return this;
    }

    currentValue = false;
    setValue(checked: boolean) {
        this.currentValue = checked;
        if (checked === undefined) setAttr(this.el, { checked: 'false' });
        else setAttr(this.el, { checked: checked });
    }

    inputEvent: inputEvents = {
        change: 'click',
        focus: 'mousedown',
        blur: 'mouseup',
    };
    on(event: string, funct: Function) {
        this.el.addEventListener(this.inputEvent[event], (evt) => {
            this.currentValue = !this.currentValue;
            this.setValue(this.currentValue);
            funct(this.currentValue, this);
        });
        return this;
    }
}
