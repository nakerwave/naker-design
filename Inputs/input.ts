
import { elementEvents, ui } from '../Layers/common';

import { el, mount } from 'redom';

export let defaultwithinput = 105;
export let defaultleftinput = 204;

export interface inputEvents extends elementEvents {
	change:string,
	focus:string,
	blur:string,
}

export class ui_input extends ui {

	label:HTMLElement;
	parent:HTMLElement;
	el:any;
	inputEvent:inputEvents;

	constructor (container:HTMLElement, label?:string) {
		super()
		this.parent = el('div.input-container')
		 if (label) {
			 this.label = el('div.input-label', label);
			 mount(this.parent, this.label);
		 }
		 mount(container, this.parent);
	}
}
