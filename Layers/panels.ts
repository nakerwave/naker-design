
import { el, mount } from 'redom';

/*
  +------------------------------------------------------------------------+
  | PARENT INPUT MANAGER                                                   |
  +------------------------------------------------------------------------+
*/

// We use a form to make sure we have no autocompletion
export let actionPanel = el('form.layer-right.parameter-container.editor-scroll', { autocomplete: "off", onsubmit: (evt) => { evt.preventDefault(); } });
mount(document.body, actionPanel);

/*
  +------------------------------------------------------------------------+
  | PARENT INPUT MANAGER USED WITH TAG (ONLY FOR STORY)                    |
  +------------------------------------------------------------------------+
*/
// We use a form to make sure we have no autocompletion
export let actionPanelWithTag = el('form.layer-right-with-tag', { autocomplete: "off", onsubmit: (evt) => { evt.preventDefault(); } });

/*
  +------------------------------------------------------------------------+
  | PARENT SORTABLE MANAGER                                                |
  +------------------------------------------------------------------------+
*/
// We use a form to make sure we have no autocompletion
export let selectionPanel = el('form.layer-left.presets-container', { autocomplete: "off", onsubmit: (evt) => { evt.preventDefault(); } });
// mount(document.body, selectionPanel);

