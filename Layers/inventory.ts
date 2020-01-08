
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
        super('', parent);
        setStyle(this.el, { border: '0px' });
        this.assetName = assetName;
        this.setSaveInputs(this.assetName);
    }

    control: HTMLElement;
    nameinput: HTMLInputElement;
    nameContainer: HTMLElement;
    setSaveInputs(placeholder: string) {
        this.placeholder = placeholder;
        let children = [
            this.inventoryContainer = el('div.inventory-container-list editor-scroll', [
                this.nameContainer = el('div.inventory-input-container', [
                    this.nameinput = el('input.inventory-input', {
                        type: 'text',
                        placeholder: placeholder + ' name',
                        onblur: () => { this.hideInput(); },
                        oninput: (evt) => { this.setName(evt.target.value); },
                        onkeyup: (evt) => { if (evt.keyCode === 13) this.hideInput(); }
                    }),
                    // el('div.input-button.inventory-button.inventory-add-button', 'OK'),
                ]),
                el('div.input-button.inventory-button.inventory-add-button.icon-add', {
                    onclick: () => { this.showInput(); this.addNewValueFromInput(); },
                }, 
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                ),
                el('div.input-button.inventory-button.inventory-add-button.icon-none', {
                    onclick: () => { this.resetValues(); },
                },
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                ),
            ])
        ]
        setChildren(this.el, children);
    }

    showInput() {
        setStyle(this.nameContainer, {display: 'block'});
        this.nameinput.focus();
    }

    hideInput() {
        setStyle(this.nameContainer, { display: 'none' });
    }

    currentname = '';
    addNewValueFromInput() {
        this._addNewValueFromInput();
    }
    _addNewValueFromInput() {
        if (this.currentname == '' || this.currentname == undefined) this.currentname = this.assetName + ' ' + (this.namelist.length + 1).toString();
        // let name = (this.assetList.length + 1).toString();
        // name = this.assetName + (this.assetList.length).toString();
        let index = this.namelist.indexOf(this.currentname);
        if (index != -1) return;
        if (this.onAdd != undefined) this.onAdd(this.currentname);
        this.setInputValue();
    }

    setName(name: string) {
        this.currentname = name;
        this.lastButton.childNodes[0].textContent = name;
    }

    onReset: Function;
    resetValues() {
        if (this.onReset) this.onReset();
    }

    _addNewValue(asset: assetOptions) {
        this.addButtonInInventory(asset.name);
        this._addValueInInventory(asset);
    }

    _addValueInInventory(asset: assetOptions) {
        this.assetList.push(cloneDeep(asset));
    }

    setInputValue() {
        this.nameinput.value = '';
        setAttr(this.nameinput, { placeholder: this.placeholder + ' ' + (this.namelist.length + 1).toString() });
        this.currentname = '';
    }

    lastButton: HTMLElement;
    addButtonInInventory(name: string) {
        this.namelist.push(name);
        let id = this.namelist.length.toString();
        let textButton: HTMLElement;
        let deleteButton: HTMLElement;
        let button = el('div.input-button.inventory-button', { 
                onclick: () => { this.manageClick(name); },
                onmouseenter: () => { setStyle(deleteButton, { display: 'inline-block'}) },
                onmouseleave: () => { setStyle(deleteButton, { display: 'none'}) },
                // onmouseenter: () => { textButton.textContent = name; setStyle(deleteButton, { display: 'inline-block' }) },
                // onmouseleave: () => { textButton.textContent = id; setStyle(deleteButton, { display: 'none' }) },
            }, [
                textButton = el('div', name),
                deleteButton = el('div.inventory-button-delete.right-icon', 'X', { onclick: (evt) => { evt.stopPropagation(); this.removeValue(button, name); } }),
            ]
        );
        // setAttr(button, { 'aria-label': name, 'data-microtip-position': 'bottom', 'role': 'tooltip' });
        mount(this.inventoryContainer, button);
        this.buttonList[name] = button;
        this.lastButton = button;
    }

    removeValue(button: HTMLElement, name: string) {
        let index = this.namelist.indexOf(name);
        if (index != -1) this.namelist.splice(index, 1);
        delete this.buttonList[name];
        this.setInputValue();
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
        let savedAsset = this.getAssetFromName(name);
        if (savedAsset == null) return;
        // Keep loop and don't replace currentAnimation entirely or content animation will be replace and it won't save changes
        // CloneDeep important or contents will share the saved parameters
        let newAsset = {};
        for (let key in savedAsset) {
            newAsset[key] = cloneDeep(savedAsset[key]);
        }
        if (this.onClick != undefined) this.onClick(newAsset);
    }
}
