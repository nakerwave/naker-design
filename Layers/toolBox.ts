
import { el, mount, setAttr, setStyle } from 'redom';
import { Undo } from '../Services/undo';

import 'microtip/microtip.css';
import GLBench from 'gl-bench/dist/gl-bench.module';

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

    perfEl: HTMLElement;
    fpsnode: HTMLElement;
    vertices: HTMLElement;
    meshes: HTMLElement;
    benchEl: HTMLElement;
    addPerformance(canvas:HTMLCanvasElement, parent:HTMLElement, scene:any) {

        this.perfEl = el('div.help-layer',
            [
                this.benchEl = el('div'),
                el('div.help-container',
                    [
                        el('div.performance-label', 'Vertices'),
                        this.vertices = el('div.performance-value', '120'),
                    ]
                ),
                el('div.help-container',
                    [
                        el('div.performance-label', 'Meshes'),
                        this.meshes = el('div.performance-value', '120'),
                    ]
                ),
            ]
        );

        mount(parent, this.perfEl);
        setStyle(this.perfEl, { display: 'none' });
        let bench = new GLBench(canvas.getContext('webgl'),
            {
                trackGPU: true,
                dom: this.benchEl,
                css: 'naker-gl-bench',
            }
        );
        scene.registerBeforeRender(() => {
            bench.begin();
        });

        scene.registerAfterRender(() => {
            // monitored code
            bench.nextFrame(new Date());
            bench.end();
        });

        
        let perfVisible = false;
        this.addTool('performance', 'Performance', () => {
            if (perfVisible) {
                setStyle(this.perfEl, { display: 'none' });
                if (this.perfInterval) clearInterval(this.perfInterval);
            } else {
                this.startPerfInterval(scene);
                setStyle(this.perfEl, { display: 'block' });
            }
            perfVisible = !perfVisible;
        });
    }
    
    perfInterval;
    startPerfInterval(scene) {
        if (this.perfInterval) clearInterval(this.perfInterval);
        this.perfInterval = setInterval(() => {
            this.vertices.textContent = scene.getTotalVertices().toString();
            this.meshes.textContent = scene.getActiveMeshes().length.toString();
        }, 500);
        setStyle(this.control, { display: 'block' });
    }
}