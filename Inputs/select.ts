
import { Input, inputEvents } from './input';

import { el, mount } from 'redom';
import Suggestions from 'suggestions';

/*
  +------------------------------------------------------------------------+
  | SELECT                                                                 |
  +------------------------------------------------------------------------+
*/

export interface selectoption {
    value: string;
    list: Array<string>;
}

export class SelectInput extends Input {
    options: Array<string>;
    label: HTMLElement;

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
        // We trick the suggestion library to be able to use it as select list
        // Classic select style not really beautiful and customizable
        this.suggestion = new Suggestions(this.el, [], {
            minLength: 0
        });
        this.suggestion.handleInputChange = () => { }

        this.setOptions(selectoption.list);
        this.list.handleMouseUp = (item) => {
            this.list.hide();
            this.setValue(item.string);
            for (let i = 0; i < this.changeFunctions.length; i++) {
                this.changeFunctions[i](item.string, this);
            }
        };
    }

    setOptions(options: Array<string>) {
        this.options = options;
        this.suggestion.update(options);
        this.list = this.suggestion.list;
        this.list.clear();
        for (var i = 0; i < options.length; i++) {
            this.list.add({ string: options[i] });
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
        this.el.textContent = value;
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
