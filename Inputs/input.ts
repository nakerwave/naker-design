
import { elementEvents, UI } from '../Layers/common';

import { el, mount, unmount } from 'redom';

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
    parent: HTMLElement;
    el: any;
    inputEvent: inputEvents;

    // Label mandatory to allow Heap analysis
    constructor(container: HTMLElement, label: string) {
        super();
        let inputName = label.toLowerCase().replace(' ', '_');
        this.parent = el('div.input-container.' + inputName + '_input');
        mount(container, this.parent);
        this.label = el('div.input-label', label);
        if (label) this.showLabel();
    }

    hideLabel() {
        unmount(this.parent, this.label);
    }

    showLabel() {
        mount(this.parent, this.label);
    }
}
