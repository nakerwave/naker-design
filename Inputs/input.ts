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

export abstract class Input<T> extends UI {

    abstract setValue(value: T);
    abstract on(event: string, funct: (value: T) => void);

    label: HTMLElement;
    name: string;
    parent: HTMLElement;
    el: any;
    inputEvent: inputEvents;

    // Label mandatory to allow Heap analysis
    constructor(container: HTMLElement, label: string) {
        super();
        this.parent = el('div');
        this.name = label;
        this.setClass('input-container');
        mount(container, this.parent);
        this.label = el('span.input-label', label, { 'title': label });
        if (label) this.showLabel();
    }

    setClass(clas: string) {
        if (this.name) {
            // Add input class in order to be able to set HEAP events
            let inputName = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
            setAttr(this.parent, { class: clas + ' ' + inputName + '_input' });
        } else {
            setAttr(this.parent, { class: clas });
        }
    }

    setBoldLabel() {
        setStyle(this.label, { 'font-weight': 600 });
    }

    hideLabel() {
        unmount(this.parent, this.label);
    }

    showLabel() {
        mount(this.parent, this.label);
    }

    setLabelIcon(icon: string) {
        setAttr(this.label, { class: 'input-label input-label-icon icon-' + icon });
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
