
import { Input, inputEvents } from './input';

import { el, mount, setAttr, setStyle } from 'redom';
import { ChangeEffectInput, textoption } from './text';

/*
  +------------------------------------------------------------------------+
  | PARAGRAPH INPUT                                                        |
  +------------------------------------------------------------------------+
*/

export class ParagraphInput extends ChangeEffectInput<string> {
    value: string;
    max = 300;

    constructor(parent: HTMLElement, label: string, textoptions: textoption, className?: string) {
        super(parent, label);
        if (this.label) setAttr(this.label, { class: 'input-label input-label-paragraph' });
        if (!className) className = 'input-paragraph input-large-width editor-scroll';
        if (!textoptions.placeholder) textoptions.placeholder = '';
        this.el = el('textarea', { class: className, maxlength: this.max });
        mount(this.parent, this.el);
        setAttr(this.el, { placeholder: textoptions.value.toString() });
        this.value = textoptions.value.toString();
        this.setEvents();
        this.setCount();
    }

    count: any;
    setCount() {
        this.count = el('div', { class: 'input-count' });
        mount(this.el.parentNode, this.count);
    }

    setValue(value: string) {
        if (value == undefined) return setAttr(this.el, { value: '' });
        if (value == this.el.value) return this;
        this.value = value.toString();
        setAttr(this.el, { value: value });
        this.changedEffect();
        this.count.textContent = this.value.length + '/' + this.max;
        return this;
    }

    setPlaceholder(text: string) {
        setAttr(this.el, { value: '' });
        setAttr(this.el, { placeholder: text.toString() });
    }

    setEvents() {
        this.el.addEventListener('input', (evt) => {
            this.value = evt.target.value;
            this.count.textContent = this.value.length + '/' + this.max;
        });
        this.el.addEventListener("keyup", (evt) => {
            event.preventDefault();
            if (evt.keyCode === 13) {
                this.value = evt.target.value;
                for (let i = 0; i < this.enterkeyFunctions.length; i++) {
                    this.enterkeyFunctions[i](this.value, this, evt);
                }
            }
        });
    }

    inputEvent: inputEvents = {
        change: 'input',
        input: 'input',
        focus: 'focus',
        blur: 'blur',
        click: 'click',
        enterkey: 'enterkey',
    };
    enterkeyFunctions: Array<Function> = [];
    on(event: string, funct: Function) {
        if (event == 'enterkey') this.enterkeyFunctions.push(funct);
        this.el.addEventListener(this.inputEvent[event], (evt) => {
            funct(evt.target.value, this, evt);
        });
        if (event == 'click') {
            this.el.addEventListener('contextmenu', (evt) => {
                evt.preventDefault();
                funct(evt.target.value, this, evt);
            }, false);
        }
        return this;
    }
}