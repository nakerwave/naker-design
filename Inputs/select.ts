import { Input, inputEvents } from './input';

import { el, mount } from 'redom';
import Suggestions from 'suggestions';

/*
  +------------------------------------------------------------------------+
  | SELECT                                                                 |
  +------------------------------------------------------------------------+
*/

export interface selectoption {
    value: string,
    list: Array<string>,
    valueText?: Object,
}

export class SelectInput extends Input {
    options: Array<string>;
    valueText: Object;

    constructor(parent: HTMLElement, label: string, selectoption: selectoption) {
        super(parent, label)
        this.el = el('div.select.siimple-select.input-parameter');
        mount(this.parent, this.el);
        this.el.textContent = selectoption.value;
        this.setInput(selectoption);
        this.setEvents();
        return this;
    }
    
    selectlabels: Array<any> = [];
    suggestion: Suggestions;
    list: Suggestions["List"];
    setInput(selectoption: selectoption) {
        if (selectoption.valueText) this.valueText = selectoption.valueText;
        // We trick the suggestion library to be able to use it as select list
        // Classic select style not really beautiful and customizable
        this.suggestion = new Suggestions(this.el, [], {
            minLength: 0
        });
        this.suggestion.handleInputChange = () => { }

        this.setOptions(selectoption.list);
        this.list.handleMouseUp = (item) => {
            this.list.hide();
            let value;
            if (this.valueText) {
                for (const key in this.valueText) {
                    const element = this.valueText[key];
                    if (item.string == element) value = key;
                }
            } else {
                value = item.string;
            }

            this.setValue(value);
            for (let i = 0; i < this.changeFunctions.length; i++) {
                this.changeFunctions[i](value, this);
            }
        };
    }

    setOptions(options: Array<string>) {
        this.options = options;
        this.suggestion.update(options);
        this.list = this.suggestion.list;
        this.list.clear();
        for (var i = 0; i < options.length; i++) {
            let textValue = (this.valueText) ? this.valueText[options[i]] : options[i];
            this.list.add({ string: textValue });
        }
        this.list.draw();
        this.list.hide();
    }

    setEvents() {
        this.on('focus', () => {
            this.list.show();
        });

        this.on('blur', () => {
            this.list.hide();
        });

        document.addEventListener('click', (e) => {
            if (e.target !== this.el) this.blur();
        });
    }

    blur() {
        for (let i = 0; i < this.blurFunctions.length; i++) {
            this.blurFunctions[i](this.value, this);
        }
    }

    value: string;
    setValue(value: string) {
        if (value == undefined) value = '';
        this.value = value;
        let textValue = (this.valueText) ? this.valueText[value] : value;
        this.el.textContent = textValue;
    }

    inputEvent: inputEvents = {
        change: 'input',
        focus: 'mousedown',
        blur: 'blur',
    };
    changeFunctions: Array<Function> = [];
    blurFunctions: Array<Function> = [];
    on(event: string, funct: Function) {
        if (event == 'change') this.changeFunctions.push(funct);
        if (event == 'blur') this.blurFunctions.push(funct);
        this.el.addEventListener(this.inputEvent[event], (evt) => {
            funct(evt.target.value, this);
        });
        return this;
    }
}
