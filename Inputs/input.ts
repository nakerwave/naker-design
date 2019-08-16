
import { elementEvents, ui } from '../Layers/common';

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
}
