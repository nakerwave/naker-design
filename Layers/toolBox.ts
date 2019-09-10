
import { el, mount, setAttr } from 'redom';
import { Undo } from '../Services/undo';

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
        this.addTool('back', 'Undo (Ctrl + Z)', () => {
            undo._back();
        });

        this.addTool('forward', 'Redo (Ctrl + Maj + Z)', () => {
            undo._forward();
        });
    }

}