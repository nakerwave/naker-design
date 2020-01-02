
import { elementEvents, UI } from '../Layers/common';

import { el, mount, unmount } from 'redom';

export let defaultwidthinputcontainer = 108;
export let defaultwidthinput = 60;
export let defaultheightinput = 30;
export let defaultrightinput = 10;
export let defaultfontsizeinput = 14;
export let defaultborderradius = 3;
export let defaultpresetsize = 30;

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
        this.showLabel();
    }

    hideLabel() {
        unmount(this.parent, this.label);
    }

    showLabel() {
        mount(this.parent, this.label);
    }
}
