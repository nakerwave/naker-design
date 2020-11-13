import { actionPanel } from './panels';
import { Button } from '../Inputs/button';
import { TextInput } from '../Inputs/text';
import { Undo } from '../Services/undo';

import { el, setAttr, setChildren, mount } from 'redom';

/*
  +------------------------------------------------------------------------+
  | TAG MANAGER                                                          |
  +------------------------------------------------------------------------+
*/

export interface tagableObject {
    tag: string;
}

export class TagManager {

    el: HTMLElement
    closebutton: HTMLElement;
    deletebutton: HTMLElement;
    duplicatebutton: HTMLElement;
    tagInput: TextInput;
    undo: Undo<any>;

    constructor(undo?: Undo<any>) {
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
        setAttr(this.tagInput.el, { maxlength: 30, active: "false" });
        this.tagInput.on('focus', (text) => {
            this.focustag = text;
            setAttr(this.tagInput.el, { active: "true" });
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
            if (text != this.focustag) this.onTagChange(text)
            setAttr(this.tagInput.el, { active: "false" });
        });
    }

    border: '0px'

    tagChangeListeners: Array<Function> = [];
    duplicateListeners: Array<Function> = [];
    deleteListeners: Array<Function> = [];
    unselectListeners: Array<Function> = [];
    on(event: 'tagChange' | 'duplicate' | 'delete' | 'unselect', callback: Function) {
        if (event == 'tagChange') this.tagChangeListeners.push(callback);
        if (event == 'duplicate') this.duplicateListeners.push(callback);
        if (event == 'delete') this.deleteListeners.push(callback);
        if (event == 'unselect') this.unselectListeners.push(callback);
    }

    onTagChange(tag:string) {
        this.content.tag = tag;
        for (let i = 0; i < this.tagChangeListeners.length; i++) {
            this.tagChangeListeners[i](this.content, tag);
        }
    }

    onDuplicate() {
        this.unSelect();
        for (let i = 0; i < this.duplicateListeners.length; i++) {
            this.duplicateListeners[i](this.content);
        }
    }

    onDelete() {
        this.unSelect();
        for (let i = 0; i < this.deleteListeners.length; i++) {
            this.deleteListeners[i](this.content);
        }
    }

    onUnselect() {
        this.unSelect();
        for (let i = 0; i < this.unselectListeners.length; i++) {
            this.unselectListeners[i](this.content);
        }
    }
    
    unSelect () {
        setChildren(actionPanel, []);
        // Do not set content to null as some listeners needs it like in duplicate
        // this.content = null;
    }

    content: tagableObject;
    setContent(content: tagableObject) {
        this.content = content;
        if (content.tag) this.tagInput.setValue(content.tag);
        else this.tagInput.setPlaceholder('Enter tag');
    }
}
