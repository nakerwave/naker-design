
import { Undo } from '../Services/undo';
import { Input } from '../Inputs/input';
import { InputGroup } from './actionPanel';

import find from 'lodash/find';

/*
  +------------------------------------------------------------------------+
  | SETTINGS                                                               |
  +------------------------------------------------------------------------+
*/

export interface InputInterface {
    name: string,
    label?: string,
    type: 
    'title' |
    'link' | 
    'icon' | 
    'button' |
    'imagebutton' | 
    'text' | 
    'paragraph' | 
    'color' | 
    'checkbox' | 
    'slider' |
    'radio' |
    'radioicon' |
    'select' |
    'number' |
    'vector',
    options,
}

export abstract class ChangeableObject<T> {
    abstract checkValues(values: T);
    // abstract setValues(values: T);
    abstract values: T;
}

export class Settings<T> extends InputGroup {

    el: HTMLElement;
    undo: Undo<any>;
    // Force name in order to be able to have analytics with heap
    constructor(name:string, undo?: Undo<any>) {
        super(name, undo);
    }

    inputs: Array<Input<any>> = [];
    setInputs(inputList: Array<InputInterface>) {
        for (const key in inputList) {
            const input = inputList[key];
            let newinput: Input<any>;
            switch (input.type) {
                case 'slider':
                    newinput = this.addSlider(input.name, input.options, (value) => {
                        this.currentValues[input.name] = value;
                        this.currentObject.checkValues(this.currentValues);
                    });
                    break;
                case 'checkbox':
                    newinput = this.addCheckBox(input.name, input.options, (value) => {
                        this.currentValues[input.name] = value;
                        this.currentObject.checkValues(this.currentValues);
                    });
                    break;
                case 'number':
                    newinput = this.addNumberInput(input.name, input.options, (value) => {
                        this.currentValues[input.name] = value;
                        this.currentObject.checkValues(this.currentValues);
                    });
                    break;
                case 'text':
                    newinput = this.addTextInput(input.name, input.options, (value) => {
                        this.currentValues[input.name] = value;
                        this.currentObject.checkValues(this.currentValues);
                    });
                    break;
                case 'paragraph':
                    newinput = this.addParagraphInput(input.name, input.options, (value) => {
                        this.currentValues[input.name] = value;
                        this.currentObject.checkValues(this.currentValues);
                    });
                    break;
                case 'link':
                    newinput = this.addLinkInput(input.name, input.options, (value) => {
                        this.currentValues[input.name] = value;
                        this.currentObject.checkValues(this.currentValues);
                    });
                    break;
                case 'imagebutton':
                    newinput = this.addImageAssetInput(input.name, input.options, (value) => {
                        this.currentValues[input.name] = value;
                        this.currentObject.checkValues(this.currentValues);
                    });
                    break;
            }

            this.inputs.push(newinput);
        }
    }

    currentValues: T;
    setValues(values:T) {
        this.currentValues = values;
        for (const key in values) {
            let input = this.getInputByName(key);
            const value = values[key];
            if (input) input.setValue(value);
            else console.error('Input ' + key + ' not found in settings ' + this.name)
        }
    }

    getInputByName(name:string): Input<any> {
        return find(this.inputs, (i) => { return i.name == name });
    }

    currentObject: ChangeableObject<T>;
    setCurrentObject(obj: ChangeableObject<T>) {
        this.currentObject = obj;
        this.setValues(obj.values);
    }
}
