
import { ui_input, inputEvents } from './input';

import { el, mount, setAttr } from 'redom';

/*
  +------------------------------------------------------------------------+
  | CHECKBOX                                                               |
  +------------------------------------------------------------------------+
*/

export class ui_checkbox extends ui_input {
	label:HTMLElement;

  constructor(parent:any, checked:boolean, className:string) {
		super();
		let key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

		let div = el('div', {class:'siimple-checkbox '+className},
			[
				this.el = el('input', {class:'checkbox', type: 'checkbox', checked:checked, id:'myCheckbox'+key}),
				el('label', {class:'checkbox', for:'myCheckbox'+key})
			]
		);

		mount(parent, div);
		return this;
	}

	setValue (checked:boolean) {
		if (checked == undefined) return setAttr(this.el, {checked:false});
		setAttr(this.el, {checked:checked});
	}

	inputEvent:inputEvents = {
		change:'click',
		focus:'mousedown',
		blur:'mouseup',
	};
	on (event:string, funct:Function) {
		this.el.addEventListener(this.inputEvent[event], (evt) => {
			funct(evt.target.checked, this);
		});
		return this;
	}
}
