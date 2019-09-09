
import { actionPanel } from './actionPanel';
import { Button } from '../Inputs/button';
import { TextInput } from '../Inputs/text';
import { Undo } from '../Services/undo';

import { el, setAttr, setChildren, mount } from 'redom';

/*
  +------------------------------------------------------------------------+
  | TAG MANAGER                                                          |
  +------------------------------------------------------------------------+
*/

export let actionPanelWithTag = el('div.layer-right-with-tag');
mount(document.body, actionPanelWithTag);

export interface tagableObject {
    tag: string;
}

export class TagManager {

    el: HTMLElement
    closebutton: HTMLElement;
    deletebutton: HTMLElement;
    duplicatebutton: HTMLElement;
    tagInput: TextInput;
    undo: Undo;

    constructor(undo?: Undo) {
        this.el = el('div.tag-container',
            el('div.tag-option-container',
                [
                    this.closebutton = el('div.tag-option-button.right-icon.icon-close', { onclick: () => { this.onUnselect(); } },
                        [el('span.path1'), el('span.path2'), el('span.path3')]
                    ),
                    this.deletebutton = el('div.tag-option-button.right-icon.icon-delete', { onclick: () => { this.onDelete(); } },
                        [el('span.path1'), el('span.path2'), el('span.path3')]
                    ),
                    this.duplicatebutton = el('div.tag-option-button.right-icon.icon-duplicate', { onclick: () => { this.onDuplicate() } },
                        [el('span.path1'), el('span.path2'), el('span.path3')]
                    )
                ]
            )
        );
        this.createTagInput();

        if (undo) this.undo = undo;
    }

    validate: Button;
    focustag: string;
    createTagInput() {
        this.tagInput = new TextInput(this.el, '', '', 'tag-input');
        setAttr(this.tagInput.el, { maxlength: 30 });
        setAttr(this.tagInput.el, { focus: "false"  });
        this.tagInput.on('focus', (text) => {
            this.focustag = text;
            setAttr(this.tagInput.el, { focus: "true" });
            if (text == '') this.tagInput.setPlaceholder('');
        });
        let timeout: any;
        this.tagInput.on('input', (text) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.tagInput.el.blur();
            }, 4000);
        });
        this.tagInput.on('change', (text) => {
            if (timeout) clearTimeout(timeout);
            this.tagInput.el.blur();
        });
        this.tagInput.on('blur', (text) => {
            if (text != this.focustag) this.onChangeName(text)
            setAttr(this.tagInput.el, { focus: "false" });
        });
    }

    border: '0px'

    changeNameListeners: Array<Function> = [];
    duplicateListeners: Array<Function> = [];
    deleteListeners: Array<Function> = [];
    unselectListeners: Array<Function> = [];
    on(event: 'changeName' | 'duplicate' | 'delete' | 'unselect', callback: Function) {
        if (event == 'changeName') this.changeNameListeners.push(callback);
        if (event == 'duplicate') this.duplicateListeners.push(callback);
        if (event == 'delete') this.deleteListeners.push(callback);
        if (event == 'unselect') this.unselectListeners.push(callback);
    }

    onChangeName(name:string) {
        for (let i = 0; i < this.changeNameListeners.length; i++) {
            this.changeNameListeners[i](this.content, name);
        }
    }

    onDuplicate() {
        for (let i = 0; i < this.duplicateListeners.length; i++) {
            this.duplicateListeners[i](this.content);
        }
    }

    onDelete() {
        for (let i = 0; i < this.deleteListeners.length; i++) {
            this.deleteListeners[i](this.content);
        }
    }

    onUnselect() {
        for (let i = 0; i < this.unselectListeners.length; i++) {
            this.unselectListeners[i](this.content);
        }
    }

    content: tagableObject;
    setContent(content: tagableObject) {
        this.content = content;
        if (content.tag) this.tagInput.setValue(content.tag);
        else this.tagInput.setPlaceholder('Enter tag');
      
        setChildren(actionPanelWithTag, [this.el, actionPanel]);
        // setChildren(actionPanel, [actionPanelWithTag]);
    }
}
