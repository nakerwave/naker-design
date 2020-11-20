
import { el, mount } from 'redom';

/*
  +------------------------------------------------------------------------+
  | PARENT INPUT MANAGER                                                   |
  +------------------------------------------------------------------------+
*/

// We use a form to make sure we have no autocompletion
export let subActionPanel = el('form.sub-action-panel.parameter-container.editor-scroll', { autocomplete: "off", onsubmit: (evt) => { evt.preventDefault(); } });

/*
  +------------------------------------------------------------------------+
  | PARENT INPUT MANAGER USED WITH TAG (ONLY FOR STORY)                    |
  +------------------------------------------------------------------------+
*/
// We use a form to make sure we have no autocompletion
export let actionPanel = el('form.action-panel.editor-scroll', { autocomplete: "off", onsubmit: (evt) => { evt.preventDefault(); } });
mount(document.body, actionPanel);

/*
  +------------------------------------------------------------------------+
  | PARENT SORTABLE MANAGER                                                |
  +------------------------------------------------------------------------+
*/
// We use a form to make sure we have no autocompletion
export let selectionPanel = el('form.layer-left.presets-container', { autocomplete: "off", onsubmit: (evt) => { evt.preventDefault(); } });
// mount(document.body, selectionPanel);

