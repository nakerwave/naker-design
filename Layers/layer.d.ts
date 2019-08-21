import { textnode, ui_button } from '../Inputs/button';
import { ui_textinput, ui_paragraphinput } from '../Inputs/text';
import { ui_numberinput, numberoption, ui_vectorinput } from '../Inputs/number';
import { ui_checkbox } from '../Inputs/checkbox';
import { ui_slider, slideroption } from '../Inputs/slider';
import { ui_radio, radiooption, ui_radioicon, radioiconoption } from '../Inputs/radio';
import { ui_select, selectoption } from '../Inputs/select';
import { coloroption } from '../Pickers/colorPicker';
import { ui_assetbutton, ui_imageassetbutton, ui_textassetbutton } from '../Pickers/assetPicker';
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
export declare class ui_manager {
    el: HTMLElement;
    constructor(parent: HTMLElement);
    addText(text: string, className: string): HTMLDivElement;
    addLink(text: string, link: string, className: string): HTMLAnchorElement;
    addIcon(icon: string, className: string): HTMLDivElement;
    addButton(textnode: textnode, callback: Function): ui_button;
    addTextInput(label: string, text: string, callback: Function): ui_textinput;
    addParagraphInput(label: string, paragraph: string, callback: Function): ui_paragraphinput;
    currentCallback: any;
    addColorInput(label: string, coloroption: coloroption, callback: Function): any;
    addAssetInput(label: string, asset: asset, callback: Function): ui_assetbutton;
    addImageAssetInput(label: string, asset: asset, callback: Function): ui_imageassetbutton;
    addTextAssetInput(label: string, asset: asset, callback: Function): ui_textassetbutton;
    addColorAndAssetInput(label: string, coloroption: coloroption, asset: asset, callback: Function): {
        color: any;
        asset: any;
    };
    addCheckBox(label: string, checked: boolean, callback: Function): ui_checkbox;
    addSlider(label: string, slideroption: slideroption, callback: Function): ui_slider;
    addRadio(label: string, radiooption: radiooption, callback: Function): ui_radio;
    addRadioIcon(label: string, radiooption: radioiconoption, callback: Function): ui_radioicon;
    addSelect(label: string, selectoption: selectoption, callback: Function): ui_select;
    addNumberInput(label: string, numberoption: numberoption, callback: Function): ui_numberinput;
    addVectorInput(label: string, numberoption: numberoption, callback: Function): ui_vectorinput;
}
export declare class floatingManager extends ui_manager {
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
