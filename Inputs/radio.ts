
import { Input, inputEvents, heightinput } from './input';

import { el, mount, setAttr, setStyle, setChildren } from 'redom';

/*
  +------------------------------------------------------------------------+
  | RADIO                                                                  |
  +------------------------------------------------------------------------+
*/

export interface radiooption {
    value: string;
    list: Array<string>;
}

export class RadioInput extends Input<string> {
    option: Array<string>;

    constructor(parent: HTMLElement, label: string, radiooption: radiooption) {
        super(parent, label);
        this.el = el('div.main-radio.input-parameter');
        mount(this.parent, this.el);
        setStyle(this.parent, { height: heightinput * radiooption.list.length + 'px' });
        this.setInput(label, radiooption);
        return this;
    }

    radiobuttons: Array<HTMLElement> = [];
    radionodes: Array<HTMLElement> = [];
    setInput(label:string, radiooption: radiooption) {
        this.option = radiooption.list;
        for (let i = 0; i < this.option.length; i++) {
            let option = this.option[i];
            let radiobutton: HTMLElement;
            let div = el('div.radio-option',
                [
                    radiobutton = el('input', { type: 'radio', id: label + '_' + option }),
                    el('label', { for: label + '_' + option })
                ]
            );
            this.radiobuttons.push(radiobutton);
            this.radionodes.push(div);
            let radiolabel = el('div', option, { class: 'radio-label' });
            mount(div, radiolabel);
            if (option == radiooption.value) setAttr(radiobutton, { checked: true });
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
            this.radiobuttons[i].addEventListener(this.inputEvent[event], (evt) => {
                let id = evt.target.id;
                let value = id.split('_')[1];
                funct(value, this);
                this.setValue(value);
            });
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
    tooltip: boolean;
    list: Array<string>;
    iconLink?: Object;
    tooltipLink?: Object;
}

export class RadioIconInput extends Input<string> {
    option: Array<string>;
    iconLink: Object;
    tooltipLink: Object;
    // iconperline: number;
    linenumber: number;
    row: any;

    constructor(parent: HTMLElement, label: string, radiooption: radioiconoption) {
        super(parent, label);
        this.hideLabel();
        this.option = radiooption.list;
        // this.iconperline = radiooption.iconperline;
        this.iconLink = radiooption.iconLink;
        this.tooltipLink = radiooption.tooltipLink;
        this.linenumber = Math.ceil(radiooption.list.length / 3);
        this.el = el('div.radio')
        mount(this.parent, this.el);
        setAttr(this.parent, {class:''});
        // setStyle(this.parent, { height: (this.linenumber * heightinput + 2).toString() + 'px' });
        setStyle(this.el, { height: (30 + this.linenumber * (heightinput + 5)).toString() + 'px' });
        setStyle(this.el, { 'z-index': 2 });
        this.setInput(radiooption);
        return this;
    }

    radiobuttons: Array<any> = [];
    setInput(radiooption: radioiconoption) {
        for (let i = 0; i < this.option.length; i++) {
            let value = this.option[i];
            let icon = (radiooption.iconLink && radiooption.iconLink[value]) ? radiooption.iconLink[value] : value;
            let radiobutton = el('div.input-button.radio-button',
            {
                id: value,
                // style: { width: width + 'px' },
                // onmouseenter: (evt: Event) => { this.label.textContent = value },
                    // onmouseleave: (evt: Event) => { this.label.textContent = label },
                },
                el('div.input-button-icon.icon-' + icon, 
                [el('span.path1'), el('span.path2'), el('span.path3')]
                )
            );
            let tooltip = (radiooption.tooltipLink && radiooption.tooltipLink[value]) ? radiooption.tooltipLink[value] : value;
            if (radiooption.tooltip) setAttr(radiobutton, { 'aria-label': tooltip, 'data-microtip-position': 'bottom', 'role': 'tooltip' });
            this.radiobuttons.push(radiobutton);
        }
        setChildren(this.el, this.radiobuttons);
        this.setValue(radiooption.value);
    }

    setValue(value: string) {
        if (value == undefined) value = this.option[0];
        for (let i = 0; i < this.option.length; i++) {
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
