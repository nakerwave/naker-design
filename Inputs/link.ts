
import { ChangeEffectInput, TextInput } from './text';

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