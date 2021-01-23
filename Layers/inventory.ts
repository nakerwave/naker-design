import { el, setAttr, mount, unmount, setStyle } from 'redom';
import cloneDeep from 'lodash/cloneDeep';

/*
  +------------------------------------------------------------------------+
  | INVENTORY MANAGER                                                      |
  +------------------------------------------------------------------------+
*/

export interface assetOptions {
    name?: string;
}

export interface InventoryOptions {
    save?: boolean,
    reset?: boolean,
}

export class Inventory {

    assetName: string;
    onClick: Function;
    onAdd: Function;

    namelist: Array<string> = [];
    buttonList: any = {};
    assetList: Array<assetOptions> = [];

    inventoryContainer: HTMLElement;
    placeholder: string;

    constructor(assetName: string, parent: HTMLElement, inventoryOptions: InventoryOptions) {
        this.assetName = assetName;
        this.setSaveInputs(this.assetName, parent);
        if (inventoryOptions.save === false) unmount(this.inventoryContainer, this.saveButton);
        if (inventoryOptions.reset === false) unmount(this.inventoryContainer, this.resetButton);
    }

    el: HTMLElement;
    nameinput: HTMLInputElement;
    nameContainer: HTMLElement;
    saveButton: HTMLElement;
    resetButton: HTMLElement;
    setSaveInputs(placeholder: string, parent: HTMLElement) {
        this.placeholder = placeholder + ' name';
        this.el = el('div.parameter-gorup',
            [
                this.inventoryContainer = el('div.inventory-container-list editor-scroll', [
                    this.nameContainer = el('div.inventory-input-container', [
                        this.nameinput = el('input.inventory-input', {
                            type: 'text',
                            placeholder: placeholder + ' name',
                            onblur: (evt) => { this.hideInput(); },
                            oninput: (evt) => { this.setName(evt.target.value); },
                            onkeyup: (evt) => { if (evt.keyCode === 13) this.hideInput(); }
                        }),
                        // el('div.input-button.inventory-button.inventory-add-button', 'OK'),
                    ]),
                    this.saveButton = el('div.input-button.inventory-button.inventory-add-button.icon-save', {
                        onclick: () => { this.showInput(); this.addNewValueFromInput(); },
                    },
                        [el('span.path1'), el('span.path2'), el('span.path3')]
                    ),
                    this.resetButton = el('div.input-button.inventory-button.inventory-add-button.icon-none', {
                        onclick: () => { this.resetValues(); },
                    },
                        [el('span.path1'), el('span.path2'), el('span.path3')]
                    ),
                ])
            ]
        );
        mount(parent, this.el);
    }

    showInput() {
        setStyle(this.nameContainer, { display: 'block' });
        this.nameinput.focus();
    }

    hideInput() {
        setStyle(this.nameContainer, { display: 'none' });
        this.currentname = '';
    }

    currentname = '';
    addNewValueFromInput() {
        this._addNewValueFromInput();
    }
    _addNewValueFromInput() {
        this.currentname = this.checkName(this.currentname, 1);
        let index = this.namelist.indexOf(this.currentname);
        if (index != -1) return;
        this.setInputValue();
        if (this.onAdd != undefined) this.onAdd(this.currentname);
    }

    setName(name: string) {
        this.currentname = this.checkName(name, 0);
        this.lastButton.childNodes[0].textContent = this.currentname;
    }

    checkName(name: string, step: number): string {
        return (name == '' || name == undefined) ? this.assetName + ' ' + (this.namelist.length + step).toString() : name;
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
        let placeholder = this.checkName(this.placeholder, 1);
        setAttr(this.nameinput, { placeholder: placeholder });
    }

    lastButton: HTMLElement;
    addButtonInInventory(name: string) {
        this.namelist.push(name);
        let deleteButton: HTMLElement;
        let button = el('div.input-button.inventory-button', {
            onclick: () => { this.manageClick(name); },
            onmouseenter: () => { setStyle(deleteButton, { display: 'inline-block' }) },
            onmouseleave: () => { setStyle(deleteButton, { display: 'none' }) },
        }, [
            el('div', name),
            deleteButton = el('div.inventory-button-delete.right-icon', 'X', { onclick: (evt) => { evt.stopPropagation(); this.removeValue(button, name); } }),
        ]
        );
        mount(this.inventoryContainer, button);
        this.buttonList[name] = button;
        this.lastButton = button;
    }

    onDelete: Function;
    removeValue(button: HTMLElement, name: string) {
        let index = this.namelist.indexOf(name);
        if (index != -1) this.namelist.splice(index, 1);
        delete this.buttonList[name];
        this.setInputValue();
        unmount(this.inventoryContainer, button);
        let deletedAsset;
        for (let i = 0; i < this.assetList.length; i++) {
            if (this.assetList[i].name == name) {
                deletedAsset = this.assetList.splice(i, 1);
            }
        }
        if (this.onDelete != undefined) this.onDelete(deletedAsset);
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

    show() {
        setStyle(this.el, { dispay: 'block' });
    }

    hide() {
        setStyle(this.el, { dispay: 'none' });
    }
}
