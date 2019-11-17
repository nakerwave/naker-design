
import { elementEvents, UI } from '../Layers/common';

import { el, mount, unmount } from 'redom';

export let defaultwithinput = 108;

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
