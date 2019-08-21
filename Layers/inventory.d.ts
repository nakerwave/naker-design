import { ui_container } from './group';
import { ui_textinput, ui_button } from './input';
import { animationOptions } from '../../viewer/contents/shared/animationContent';
import { materialOptions } from '../../viewer/contents/shared/materialContent';
import { pipelineOptions } from '../../viewer/scenery/pipeline';
export declare class inventoryClass extends ui_container {
    assetType: 'material' | 'animation' | 'pipeline';
    onClick: Function;
    onAdd: Function;
    namelist: Array<string>;
    buttonList: any;
    assetList: Array<materialOptions | animationOptions | pipelineOptions>;
    inventoryContainer: ui_container;
    nameinput: ui_textinput;
    currentname: string;
    placeholder: string;
    constructor(assetType: 'material' | 'animation' | 'pipeline', parent: ui_container);
    setSaveInputs(placeholder: string): void;
    addNewValueFromInput(name: string): void;
    addNewValue(name: string, asset: materialOptions | animationOptions | pipelineOptions): void;
    addValueInInventory(name: string, asset: materialOptions | animationOptions | pipelineOptions): void;
    setInputValue(): void;
    addButtonInInventory(name: string): void;
    removeValue(button: ui_button, name: string): void;
    getAssetFromName(name: string): any;
    manageClick(name: string): void;
}
