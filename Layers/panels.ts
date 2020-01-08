
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
  | PARENT INPUT MANAGER USED WITH TAG (ONLY FOR STORY)                    |
  +------------------------------------------------------------------------+
*/
export let actionPanelWithTag = el('div.layer-right-with-tag');

/*
  +------------------------------------------------------------------------+
  | PARENT SORTABLE MANAGER                                                |
  +------------------------------------------------------------------------+
*/
export let selectionPanel = el('div.layer-left.presets-container');
// mount(document.body, selectionPanel);

