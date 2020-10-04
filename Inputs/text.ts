
import { Input, inputEvents } from './input';

import { el, mount, setAttr, setStyle } from 'redom';

/*
  +------------------------------------------------------------------------+
  | CHANGE EFFECT INPUT                                                    |
  +------------------------------------------------------------------------+
*/

export abstract class ChangeEffectInput<T> extends Input<T> {

    valueChangedTimeout;
    changedEffect() {
        if (this.valueChangedTimeout) clearTimeout(this.valueChangedTimeout);
        setAttr(this.el, { changed: true });
        this.valueChangedTimeout = setTimeout(() => { setAttr(this.el, { changed: false }) }, 100);
    }
}

/*
  +------------------------------------------------------------------------+
  | TEXT INPUT                                                             |
  +------------------------------------------------------------------------+
*/

export interface textoption {
    value: string,
    placeholder?:string,
    size?: number,
}

export class TextInput extends ChangeEffectInput<string> {

    value: string;

    constructor(parent: HTMLElement, label: string, textoptions: textoption, className?: string) {
        super(parent, label)
        if (!className) className = 'input-parameter input-text';
        if (!textoptions.placeholder) textoptions.placeholder = '';
        if (!textoptions.value) textoptions.value = '';
        
        this.el = el('input', { class: className });
        mount(this.parent, this.el);
        setAttr(this.el, { type: 'text', placeholder: textoptions.placeholder.toString(), onfocus: () => { this.el.select() } });
        this.value = textoptions.value.toString();
        this.setEvents();
        if (textoptions.size) this.setSize(textoptions.size);
    }

    setValue(value: string) {
        if (value == undefined) return setAttr(this.el, { value: '' });
        if (value == this.el.value) return this;
        this.value = value.toString();
        setAttr(this.el, { value: value });
        this.changedEffect();
        return this;
    }

    setSize(size: number) {
        setStyle(this.el, { width: size + 'px' });
    }

    setPlaceholder(text: string) {
        setAttr(this.el, { value: '' });
        setAttr(this.el, { placeholder: text.toString() });
    }

    setEvents() {
        this.el.addEventListener('input', (evt) => {
            this.value = evt.target.value;
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


/*
  +------------------------------------------------------------------------+
  | LINK INPUT                                                             |
  +------------------------------------------------------------------------+
*/

export interface LinkInterface {
    text?: string;
    href?: string;
}

export class LinkInput extends ChangeEffectInput<LinkInterface> {
    value: LinkInterface;
    textInput: TextInput;
    hrefInput: TextInput;

    constructor(parent: HTMLElement, label: string, linkoptions: LinkInterface, className?: string) {
        super(parent, label);
        this.textInput = new TextInput(parent, 'text', { value: linkoptions.text, size: 232 }, className);
        this.hrefInput = new TextInput(parent, 'href', { value: linkoptions.href, size: 190, placeholder: '#' }, className);
    }

    currentValue: LinkInterface;
    setValue(value: LinkInterface) {
        this.currentValue = value;
        this.textInput.setValue(value.text);
        this.hrefInput.setValue(value.href);
    }

    on(event: string, funct: Function) {
        this.textInput.on(event, (value, t, evt) => {
            this.currentValue.text = value;
            funct(this.currentValue, this, evt);
        });
        this.hrefInput.on(event, (value, t, evt) => {
            this.currentValue.href = value;
            funct(this.currentValue, this, evt);
        });
        return this;
    }
}

