
import { el, mount, setAttr } from 'redom';
import { Undo } from '../Services/undo';

import 'microtip/microtip.css';

/*
  +------------------------------------------------------------------------+
  | TOOLBOX                                                                |
  +------------------------------------------------------------------------+
*/

export class ToolBox {

    control: HTMLElement;

    constructor(parent: HTMLElement) {
        this.control = el('div.tool-box');
        mount(parent, this.control);
    }

    addTool(icon: string, tooltip: string, callback: Function): HTMLElement {
        let tool = el('div.tool-button', {
            onclick: () => { callback(); }
        },
            el('i.icon-' + icon, [el('span.path1'), el('span.path2'), el('span.path3')])
        );
        if (tooltip) {
            setAttr(tool, { 'aria-label': tooltip, 'data-microtip-position': 'right', 'role': 'tooltip' });
        }
        mount(this.control, tool);
        return tool;
    }

    addUndo(undo: Undo) {
        let backbutton = this.addTool('back', 'Undo (Ctrl + Z)', () => {
            undo.back();
        });

        let forwardbottom = this.addTool('forward', 'Redo (Ctrl + Maj + Z)', () => {
            undo.forward();
        });

        undo.on('undo', (change) => {
            if (change) setAttr(backbutton, { class: 'tool-button tool-success' });
            else setAttr(backbutton, { class: 'tool-button tool-error' });
            setTimeout(() => { setAttr(backbutton, { class: 'tool-button' }); }, 200);
        });

        undo.on('redo', (change) => {
            if (change) setAttr(forwardbottom, { class: 'tool-button tool-success' });
            else setAttr(forwardbottom, { class: 'tool-button tool-error' });
            setTimeout(() => { setAttr(forwardbottom, { class: 'tool-button' }); }, 200);
        });
    }

}