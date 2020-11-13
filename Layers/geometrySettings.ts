import { InputGroupSwitch } from './actionPanel';
import { Undo } from '../Services/undo';

import { setStyle, el, mount } from 'redom';

/*
  +------------------------------------------------------------------------+
  | POINT MANAGER                                                          |
  +------------------------------------------------------------------------+
*/

export interface point3D {
    x: number;
    y: number;
    z: number;
}

export interface option3D {
    x?: number;
    y?: number;
    z?: number;
}

export interface geometryObject {
    position?: point3D;
    rotation?: point3D;
    scaling?: point3D;
    availableAxis : {
        position: point3D;
        rotation: point3D;
        scaling: point3D;
    }
    setPosition: Function;
    setRotation: Function;
    setScaling: Function;
}

export class GeometrySettings extends InputGroupSwitch {

    constructor(undo?: Undo<any>) {
        super('Geometry', undo, false);
        let copybutton = el('div.right-icon.copy-icon.icon-copypaste', { onclick: () => { this.checkCopyPaste() }, onmouseenter: () => { this.title.textContent = 'Copy/Paste Geometry' }, onmouseleave: () => { this.title.textContent = 'Main settings' } },
            [el('span.path1'), el('span.path2'), el('span.path3')]
        );
        mount(this.el, copybutton);
        this.setPointInputs();
    }

    copy: any;
    checkCopyPaste() {
        if (this.copy) {
            this.setVectorChange('position', this.copy.position);
            this.setVectorChange('rotation', this.copy.rotation);
            this.setVectorChange('scaling', this.copy.scaling);
            this.setPointValue('position', this.copy.position);
            this.setPointValue('rotation', this.copy.rotation);
            this.setPointValue('scaling', this.copy.scaling);
            this.copy = null;
        } else {
            this.copy = {};
            let pos = this.pointInputs.position;
            let rot = this.pointInputs.rotation;
            let sca = this.pointInputs.scaling;
            this.copy.position = { x: pos.x.value, y: pos.y.value, z: pos.z.value };
            this.copy.rotation = { x: rot.x.value, y: rot.y.value, z: rot.z.value };
            this.copy.scaling = { x: sca.x.value, y: sca.y.value, z: sca.z.value };
        }
    }

    pointInputs: any = {};
    setPointInputs() {
        this.pointInputs.position = this.addVectorInput('Position', { step: 0.5 }, (vector) => {
            this.setVectorChange('position', vector);
        });

        this.pointInputs.rotation = this.addVectorInput('Rotation', { step: 10, min: -180, max: 180 }, (vector) => {
            this.setVectorChange('rotation', vector);
        });

        this.pointInputs.scaling = this.addVectorInput('scaling', { step: 0.1, min: 0.01 }, (vector) => {
            // scaling can't be negative
            for (let key in vector) {
                if (vector[key] < 0) vector[key] = 0;
            }
            this.setVectorChange('scaling', vector);
        });
    }

    content: geometryObject;
    setContent(content: geometryObject) {
        this.content = content;
        this.setAllPointValue(this.content);
        this.unfreezeAllInputs();
        this.setAvailableInputs(content.availableAxis);
    }

    unfreezeAllInputs() {
        this.freezeVectorInputs('position', false);
        this.freezeVectorInputs('rotation', false);
        this.freezeVectorInputs('scaling', false);
    }

    setAvailableInputs(availableAxis: any) {
        let p = 0;
        for (let key in availableAxis.position) {
            this.freezeInput(this.pointInputs.position[key], !availableAxis.position[key]);
            p += availableAxis.position[key];
        }
        if (p) setStyle(this.pointInputs.position.parent, { display: 'block' });
        else setStyle(this.pointInputs.position.parent, { display: 'none' });

        let r = 0;
        for (let key in availableAxis.rotation) {
            this.freezeInput(this.pointInputs.rotation[key], !availableAxis.rotation[key]);
            r += availableAxis.rotation[key];
        }
        if (r) setStyle(this.pointInputs.rotation.parent, { display: 'block' });
        else setStyle(this.pointInputs.rotation.parent, { display: 'none' });

        let s = 0;
        for (let key in availableAxis.scaling) {
            this.freezeInput(this.pointInputs.scaling[key], !availableAxis.scaling[key]);
            s += availableAxis.scaling[key];
        }
        if (s) setStyle(this.pointInputs.scaling.parent, { display: 'block' });
        else setStyle(this.pointInputs.scaling.parent, { display: 'none' });
    }

    freezeVectorInputs(vector: string, bool: boolean) {
        let vectorInput = this.pointInputs[vector];
        for (let key in { x: 0, y: 0, z: 0 }) {
            if (key != 'label') this.freezeInput(vectorInput[key], bool);
        }
    }

    listeners: Array<Function> = [];
    setVectorChange(arg: string, vector: option3D) {
        if (arg == 'position') this.content.setPosition(vector);
        if (arg == 'rotation') this.content.setRotation(vector);
        if (arg == 'scaling') this.content.setScaling(vector);
        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i](arg, vector);
        }
    }

    addListener (callback: Function) {
        this.listeners.push(callback);
    }

    setAllPointValue(content: geometryObject) {
        if (content.position) this.setPointValue('position', content.position);
        if (content.rotation) this.setPointValue('rotation', content.rotation);
        if (content.scaling) this.setPointValue('scaling', content.scaling);
    }

    decimal = 100;
    setPointValue(vector: string, point: option3D) {
        if (point.x !== undefined) this.pointInputs[vector].x.setValue(Math.round(point.x * this.decimal) / this.decimal);
        if (point.y !== undefined) this.pointInputs[vector].y.setValue(Math.round(point.y * this.decimal) / this.decimal);
        if (point.z !== undefined) this.pointInputs[vector].z.setValue(Math.round(point.z * this.decimal) / this.decimal);
    }
}