import { textnode, Button } from '../Inputs/button';
import { TextInputinput, ParagraphInputinput } from '../Inputs/text';
import { NumberInputinput, numberoption, VectorInputinput } from '../Inputs/number';
import { Checkbox } from '../Inputs/checkbox';
import { SliderInput, slideroption } from '../Inputs/slider';
import { RadioInput, radiooption, RadioIconInput, radioiconoption } from '../Inputs/radio';
import { SelectInput, selectoption } from '../Inputs/select';
import { ColorButton, coloroption } from '../Pickers/colorPicker';
import { AssetButton, ImageAssetButton, TextAssetbutton } from '../Pickers/assetPicker';
import { asset } from '../Pickers/assetPicker';
export interface manageroption {
    title: string;
    text?: boolean;
    textcolor?: boolean;
    backcolor?: boolean;
    pickercolor?: boolean;
    opacity?: boolean;
    fixed?: boolean;
}
export declare class InputGroup {
    el: HTMLElement;
    constructor(parent: HTMLElement);
    addText(text: string, className: string): HTMLDivElement;
    addLink(text: string, link: string, className: string): HTMLAnchorElement;
    addIcon(icon: string, className: string): HTMLDivElement;
    addButton(textnode: textnode, callback: Function): Button;
    addTextInput(label: string, text: string, callback: Function): TextInputinput;
    addParagraphInput(label: string, paragraph: string, callback: Function): ParagraphInputinput;
    currentCallback: any;
    addColorInput(label: string, coloroption: coloroption, callback: Function): ColorButton;
    addAssetInput(label: string, asset: asset, callback: Function): AssetButton;
    addImageAssetInput(label: string, asset: asset, callback: Function): ImageAssetButton;
    addTextAssetInput(label: string, asset: asset, callback: Function): TextAssetbutton;
    addColorAndAssetInput(label: string, coloroption: coloroption, asset: asset, callback: Function): void;
    addCheckBox(label: string, checked: boolean, callback: Function): Checkbox;
    addSlider(label: string, slideroption: slideroption, callback: Function): SliderInput;
    addRadio(label: string, radiooption: radiooption, callback: Function): RadioInput;
    addRadioIcon(label: string, radiooption: radioiconoption, callback: Function): RadioIconInput;
    addSelect(label: string, selectoption: selectoption, callback: Function): SelectInput;
    addNumberInput(label: string, numberoption: numberoption, callback: Function): NumberInputinput;
    addVectorInput(label: string, numberoption: numberoption, callback: Function): VectorInputinput;
}
export declare class InputGroupSwitch extends InputGroup {
    title: HTMLElement;
    expand: HTMLElement;
    constructor(title?: string, expandable?: boolean);
    titleParent: HTMLElement;
    addTitle(title: string): void;
    addSubTitle(title: string): void;
    expanded: boolean;
    switch(): void;
    freezeInput(input: any, bool: boolean): void;
}
export declare let layerLeft: HTMLElement;
export declare let layerRight: HTMLElement;
