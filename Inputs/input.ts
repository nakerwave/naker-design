import { elementEvents, UI } from '../Layers/common';
import { el, mount, unmount, setAttr, setChildren, setStyle } from 'redom';

export let widthinputcontainer = 150;
export let widthinput = 60;
export let heightinput = 30;
export let rightinput = 10;
export let fontsizeinput = 14;
export let borderradius = 3;
export let presetsize = 30;

export interface inputEvents extends elementEvents {
    change: string,
    focus: string,
    blur: string,
}

export class Input extends UI {

    label: HTMLElement;
    labelString: string;
    parent: HTMLElement;
    el: any;
    inputEvent: inputEvents;

    // Label mandatory to allow Heap analysis
    constructor(container: HTMLElement, label: string) {
        super();
        this.parent = el('div');
        this.labelString = label;
        this.setClass('input-container');
        mount(container, this.parent);
        this.label = el('div.input-label', label);
        if (label) this.showLabel();
    }
    
    setClass(clas: string) {
        if (this.labelString) {
            // Add input class in order to be able to set HEAP events
            let inputName = this.labelString.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
            setAttr(this.parent, { class: clas + ' ' + inputName + '_input' });
        } else {
            setAttr(this.parent, { class: clas });
        }
    }

    hideLabel() {
        unmount(this.parent, this.label);
    }

    showLabel() {
        mount(this.parent, this.label);
    }

    setLabelIcon(icon: string) {
        setAttr(this.label, {class : 'input-label input-label-icon icon-' + icon});
        setChildren(this.label, [el('span.path1'), el('span.path2'), el('span.path3')]);
    }

    hide() {
        setStyle(this.parent, { display: 'none' });
        return this;
    }

    show() {
        setStyle(this.parent, { display: 'inline-block' });
        return this;
    }
}
