
import { Input, inputEvents, defaultwidthinputcontainer, defaultheightinput } from './input';

import { el, mount, setAttr, setStyle, setChildren, RedomElement } from 'redom';

/*
  +------------------------------------------------------------------------+
  | RADIO                                                                  |
  +------------------------------------------------------------------------+
*/

export interface radiooption {
    value: string;
    list: Array<string>;
}

export class RadioInput extends Input {
    option: Array<string>;

    constructor(parent: HTMLElement, label: string, radiooption: radiooption) {
        super(parent, label);
        this.el = el('div.main-radio.input-parameter');
        mount(this.parent, this.el);
        setStyle(this.parent, { height: defaultheightinput * radiooption.list.length + 'px' });
        this.setInput(radiooption);
        return this;
    }

    radiobuttons: Array<RedomElement> = [];
    radionodes: Array<RedomElement> = [];
    setInput(radiooption: radiooption) {
        this.option = radiooption.list;
        for (let i = 0; i < this.option.length; i++) {
            let label = this.option[i]
            let radiobutton: RedomElement;
            let div = el('div.radio-option',
                [
                    radiobutton = el('input', { type: 'radio', id: label }),
                    el('label', { for: label })
                ]
            );

            this.radiobuttons.push(radiobutton);
            this.radionodes.push(div);
            let radiolabel = el('div', label, { class: 'radio-label' });
            mount(div, radiolabel);
            if (label == radiooption.value) setAttr(radiobutton, { checked: true });
        }
        setChildren(this.el, this.radionodes);
    }

    setValue(value: string) {
        if (value == undefined) value = this.option[0];
        for (let i = 0; i < this.option.length; i++) {
            if (value == this.option[i]) setAttr(this.radiobuttons[i], { checked: true });
            else setAttr(this.radiobuttons[i], { checked: false });
        }
    }

    inputEvent: inputEvents = {
        change: 'click',
        focus: 'mousedown',
        blur: 'mouseup',
    };
    on(event: string, funct: Function) {
        for (let i = 0; i < this.radiobuttons.length; i++) {
            ((i) => {
                this.radiobuttons[i].addEventListener(this.inputEvent[event], (evt) => {
                    funct(evt.target.id, this);
                    this.setValue(evt.target.id);
                });
            })(i)
        }
        return this;
    }
}

/*
  +------------------------------------------------------------------------+
  | RADIO ICON                                                             |
  +------------------------------------------------------------------------+
*/

export interface radioiconoption {
    value: string;
    iconperline: number;
    list: Array<string>;
    iconLink?: Object;
}

export class RadioIconInput extends Input {
    option: Array<string>;
    iconLink: Object;
    // iconperline: number;
    linenumber: number;
    row: any;

    constructor(parent: HTMLElement, label: string, radiooption: radioiconoption) {
        super(parent, label);
        this.hideLabel();
        this.option = radiooption.list;
        // this.iconperline = radiooption.iconperline;
        this.iconLink = radiooption.iconLink;
        this.linenumber = Math.ceil(radiooption.list.length / 3);
        this.el = el('div.radio')
        mount(this.parent, this.el);
        setAttr(this.parent, {class:''});
        // setStyle(this.parent, { height: (this.linenumber * defaultheightinput + 2).toString() + 'px' });
        setStyle(this.el, { height: (this.linenumber * (defaultheightinput + 5)).toString() + 'px' });
        setStyle(this.el, { 'z-index': 2, overflow: 'hidden' });
        this.setInput(label, radiooption);
        return this;
    }

    radiobuttons: Array<any> = [];
    setInput(label: string, radiooption: radioiconoption) {
        // let width = defaultwidthinputcontainer / this.iconperline;
        for (let i = 0; i < this.option.length; i++) {
            let value = this.option[i];
            let icon = (radiooption.iconLink) ? radiooption.iconLink[value] : value;
            let radiobutton = el('div.input-button.radio-icon-button.icon-' + icon,
                {
                    id: value,
                    // style: { width: width + 'px' },
                    onmouseenter: (evt: Event) => { this.label.textContent = label + ' ' + value },
                    onmouseleave: (evt: Event) => { this.label.textContent = label },
                },
                [el('span.path1'), el('span.path2'), el('span.path3')]
            );
            this.radiobuttons.push(radiobutton);
        }
        setChildren(this.el, this.radiobuttons);
        this.setValue(radiooption.value);
    }

    setValue(value: string) {
        if (value == undefined) value = this.option[0];
        for (let i = 0; i < this.option.length; i++) {
            let label = this.option[i];
            let icon = (this.iconLink) ? this.iconLink[label] : label;
            if (value == this.option[i]) setAttr(this.radiobuttons[i], { active: true });
            else setAttr(this.radiobuttons[i], { active: false });
        }
    }

    inputEvent: inputEvents = {
        change: 'click',
        focus: 'mousedown',
        blur: 'mouseup',
    };
    on(event: string, funct: Function) {
        for (let i = 0; i < this.radiobuttons.length; i++) {
            ((i) => {
                let radiobutton = this.radiobuttons[i];
                let value = radiobutton.id;
                radiobutton.addEventListener(this.inputEvent[event], (evt) => {
                    funct(value, this);
                    this.setValue(value);
                });
            })(i)
        }
        return this;
    }
}
