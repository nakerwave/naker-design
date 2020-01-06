
import { InputGroup } from './actionPanel';

import { el, setAttr, mount, unmount, setChildren, setStyle } from 'redom';
import cloneDeep from 'lodash/cloneDeep';

/*
  +------------------------------------------------------------------------+
  | INVENTORY MANAGER                                                      |
  +------------------------------------------------------------------------+
*/

export interface assetOptions {
    name?: string;
}

export class Inventory extends InputGroup {

    assetName: string;
    onClick: Function;
    onAdd: Function;

    namelist: Array<string> = [];
    buttonList: any = {};
    assetList: Array<assetOptions> = [];

    inventoryContainer: HTMLElement;
    // nameinput: HTMLElement;
    // currentname: string;
    placeholder: string;

    constructor(assetName: string, parent: HTMLElement) {
        super(assetName+' inventory', parent);
        setStyle(this.el, { border: '0px' });
        this.assetName = assetName;
        this.setSaveInputs(this.assetName);
    }

    control: HTMLElement;
    setSaveInputs(placeholder: string) {
        this.placeholder = placeholder;
        let children = [
            el('div.parameter-title', placeholder + 's Presets'),
            // this.nameinput = el('input.inventory-input', {
            //     type: 'text',
            //     placeholder: placeholder + ' name',
            //     onclick: () => { this.manageClick(name); },
            //     oninput: (evt) => { this.currentname = evt.target.value; },
            //     onkeyup: (evt) => { if (evt.keyCode === 13) this.addNewValueFromInput(placeholder); }
            // }),
            this.inventoryContainer = el('div.inventory-container-list editor-scroll', [
                el('div.input-button.inventory-button.inventory-add-button.icon-add', {
                    onclick: () => { this.addNewValueFromInput(); },
                }, 
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                ),
            ])
        ]
        setChildren(this.el, children);
    }

    addNewValueFromInput() {
        // if (this.currentname == '' || this.currentname == undefined) this.currentname = name + ' ' + (this.namelist.length + 1).toString();
        let name = (this.assetList.length + 1).toString();
        // let name = this.assetName + (this.assetList.length).toString();
        // let index = this.namelist.indexOf(this.currentname);
        // if (index != -1) return;
        if (this.onAdd != undefined) this.onAdd(name);
        // this.setInputValue();
    }

    _addNewValue(asset: assetOptions) {
        this.addButtonInInventory(asset.name);
        this._addValueInInventory(asset);
    }

    _addValueInInventory(asset: assetOptions) {
        this.assetList.push(cloneDeep(asset));
    }

    // setInputValue() {
    //     this.nameinput.value = '';
    //     setAttr(this.nameinput, { placeholder: this.placeholder + ' ' + (this.namelist.length + 1).toString() });
    //     this.currentname = '';
    // }

    addButtonInInventory(name: string) {
        this.namelist.push(name);
        let button = el('div.input-button.inventory-button', name, { onclick: () => { this.manageClick(name); } },
            // el('div.inventory-button-delete.right-icon.icon-delete', { onclick: (evt) => { evt.stopPropagation(); this.removeValue(button, name); } },
            //     [el('span.path1'), el('span.path2'), el('span.path3')]
            // ),
        )
        mount(this.inventoryContainer, button);
        this.buttonList[name] = button;
    }

    removeValue(button: HTMLElement, name: string) {
        let index = this.namelist.indexOf(name);
        if (index != -1) this.namelist.splice(index, 1);
        delete this.buttonList[name];
        // this.setInputValue();
        unmount(this.inventoryContainer, button);
        for (let i = 0; i < this.assetList.length; i++) {
            if (this.assetList[i].name == name) this.assetList.splice(i, 1);
        }
    }

    getAssetFromName(name: string) {
        for (let i = 0; i < this.assetList.length; i++) {
            if (this.assetList[i].name == name) return this.assetList[i];
        }
        return null;
    }

    manageClick(name: string) {
        let savedAnimation = this.getAssetFromName(name);
        if (savedAnimation == null) return;
        // Keep loop and don't replace currentAnimation entirely or content animation will be replace and it won't save changes
        // CloneDeep important or contents will share the saved parameters
        let newAsset = {};
        for (let key in savedAnimation) {
            newAsset[key] = cloneDeep(savedAnimation[key]);
        }
        if (this.onClick != undefined) this.onClick(newAsset);
    }
}
