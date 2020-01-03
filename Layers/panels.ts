
import { el, mount } from 'redom';

/*
  +------------------------------------------------------------------------+
  | PARENT INPUT MANAGER                                                   |
  +------------------------------------------------------------------------+
*/

export let actionPanel = el('div.layer-right.parameter-container.editor-scroll');
mount(document.body, actionPanel);


/*
  +------------------------------------------------------------------------+
  | PARENT SORTABLE MANAGER                                                |
  +------------------------------------------------------------------------+
*/
export let selectionPanel = el('div.layer-left.presets-container');
// mount(document.body, selectionPanel);