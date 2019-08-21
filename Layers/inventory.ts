
import { UI _container } from './group';
import { TextInputinput, Button } from './input';
import { threedJsonHelper } from '../../viewer/service/threedjsonhelper';
import { projectInterface } from '../../viewer/service/projectInterface';
import { animationOptions } from '../../viewer/contents/shared/animationContent';
import { materialOptions } from '../../viewer/contents/shared/materialContent';
import { pipelineOptions } from '../../viewer/scenery/pipeline';

import { el, setAttr, mount, unmount } from 'redom';
import cloneDeep from 'lodash/cloneDeep';

/*
  +------------------------------------------------------------------------+
  | INVENTORY MANAGER                                                      |
  +------------------------------------------------------------------------+
*/

export class inventoryClass extends ui_container {

  assetType:'material'|'animation'|'pipeline';
  onClick:Function;
  onAdd:Function;

  namelist:Array<string> = [];
  buttonList:any = {};
  assetList:Array<materialOptions|animationOptions|pipelineOptions> = [];

  inventoryContainer:ui_container;
  nameinput:TextInputinput;
  currentname:string;
  placeholder:string;

  constructor (assetType:'material'|'animation'|'pipeline', parent:ui_container) {
    super(parent.el, 'inventory');
    this.assetType = assetType;
    this.setSaveInputs(this.assetType);
  }

  setSaveInputs (placeholder:string) {
    this.addTitle(placeholder+'s Inventory');
    this.placeholder = placeholder;
    this.nameinput = this.addInput(placeholder + ' name', 'inventory-input');
    this.nameinput.on('input', (text) => {
      this.currentname = text;
    });
    this.nameinput.on('enterkey', (text) => {
      this.addNewValueFromInput(placeholder);
    });
    let button = this.addButton({ui:'text', text:'Save'}, 'inventory-add-button');
    button.on('click', () => {
      this.addNewValueFromInput(placeholder);
    });
    this.inventoryContainer = this.addContainer('inventory-container-list editor-scroll');
  }

  addNewValueFromInput (name:string) {
    if (this.currentname == '' || this.currentname == undefined) this.currentname = name+' '+(this.namelist.length+1).toString();
    let index = this.namelist.indexOf(this.currentname);
    if (index != -1) return;
    if (this.onAdd != undefined) this.onAdd(this.currentname);
    this.setInputValue();
  }

  addNewValue (name:string, asset:materialOptions|animationOptions|pipelineOptions) {
    this.addButtonInInventory(name);
    this.addValueInInventory(name, asset);
  }

  addValueInInventory (name:string, asset:materialOptions|animationOptions|pipelineOptions) {
    let assetToSave:any = threedJsonHelper.recursiveObjectToObject(projectInterface[this.assetType], asset);
    assetToSave.name = name;
    this.assetList.push(assetToSave);
  }

  setInputValue () {
    this.nameinput.setValue('');
    setAttr(this.nameinput.el, {placeholder:this.placeholder+' '+(this.namelist.length+1).toString()});
    this.currentname = '';
  }

  addButtonInInventory (name:string) {
    this.namelist.push(name);
    let button = el('div.inventory-button-list', name, {onclick:()=>{if (this.onClick != undefined) this.manageClick(name);}},
      el('div.inventory-button-delete.right-icon.icon-delete', {onclick:(evt)=>{evt.stopPropagation();this.removeValue(button, name);}},
        [el('span.path1'),el('span.path2'),el('span.path3')]
      ),
    )
    mount(this.inventoryContainer.el, button);
    this.buttonList[name] = button;
  }

  removeValue (button:Button, name:string) {
    let index = this.namelist.indexOf(name);
    if (index != -1) this.namelist.splice(index, 1);
    delete this.buttonList[name];
    this.setInputValue();
    unmount(this.inventoryContainer.el, button);
    for (let i = 0; i < this.assetList.length; i++) {
      if (this.assetList[i].name == name) delete this.assetList[i];
    }
  }

  getAssetFromName (name:string) {
    for (let i = 0; i < this.assetList.length; i++) {
      if (this.assetList[i].name == name) return this.assetList[i];
    }
    return null;
  }

  manageClick (name:string) {
    let savedAnimation = this.getAssetFromName(name);
    if (savedAnimation == null) return;
    // Keep loop and don't replace currentAnimation entirely or content animation will be replace and it won't save changes
    // CloneDeep important or contents will share the saved parameters
    let newAsset = {};
    for (let key in savedAnimation) {
      newAsset[key] = cloneDeep(savedAnimation[key]);
    }
    this.onClick(newAsset);
  }
}
