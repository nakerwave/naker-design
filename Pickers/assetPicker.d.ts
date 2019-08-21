import { ui_input } from '../Inputs/input';
import { ui_imagebutton, ui_button } from '../Inputs/button';
import { ui } from '../Layers/common';
export interface asset {
    type: string;
    url: string;
}
export interface assetEvents {
    change?: Function;
    focus?: Function;
    blur?: Function;
}
export declare class ui_assetinput extends ui_input {
    url: string;
    type: string;
    constructor(parent: HTMLElement, label: string, assetoption: asset);
    getThumbnail(url: string): any;
    setValue(url: string, frompicker: boolean): void;
    _setValue(url: string, frompicker: boolean): any;
    events: assetEvents;
    starturl: string;
    focus(): void;
    blurEvent(): void;
    on(event: 'focus' | 'blur' | 'change', funct: Function): this;
    checkErase(evt: Event): void;
}
export declare class ui_assetbutton extends ui_assetinput {
    image: HTMLElement;
    text: HTMLElement;
    assetbutton: HTMLElement;
    asseticon: HTMLElement;
    constructor(parent: HTMLElement, label: string, assetoption: asset);
    setValue(url: string, frompicker?: any): this;
    mouseEnter(): void;
    mouseLeave(): void;
    setIcon(icon: string): void;
    erase(frompicker?: any): void;
}
export declare class ui_imageassetbutton extends ui_assetinput {
    image: HTMLElement;
    text: HTMLElement;
    hover: HTMLElement;
    label: HTMLElement;
    container: HTMLElement;
    constructor(parent: HTMLElement, label: string, assetoption: asset);
    setValue(url: string, frompicker?: any): this;
}
export declare class ui_textassetbutton extends ui_assetinput {
    text: HTMLElement;
    hover: HTMLElement;
    label: HTMLElement;
    asseticon: HTMLElement;
    constructor(parent: HTMLElement, label: string, assetoption: asset);
    mouseEnter(): void;
    mouseLeave(): void;
    setIcon(icon: string): void;
    setValue(url: string, frompicker?: any): this;
}
export declare let overlayImages: Array<string>;
export declare let overlayAlpha: {
    'albedo': boolean;
    'ambient': boolean;
    'specular': boolean;
    'emissive': boolean;
    'bump': boolean;
    'opacity': boolean;
    'reflectivity': boolean;
    'reflection': boolean;
    'particle': boolean;
    'image': boolean;
    'heightmap': boolean;
};
export declare class ui_assetpicker extends ui {
    back: HTMLElement;
    title: HTMLElement;
    constructor();
    currentInput: ui_assetinput;
    setCurrentInput(input: ui_assetinput): void;
    assetButtons: any;
    assetImages: any;
    assetperline: number;
    type: string;
    setAssetList(type: string): this;
    checkTypeButton(type: string): void;
    initAssetType(type: string): void;
    hideAsset(): void;
    setAddAssetMode(type: string, callback: Function): void;
    waitingAsset: string;
    waitingInput: ui_assetinput;
    addWaitedAssetButton(url: string, image: string): void;
    addAssetMode: boolean;
    addAssetFunction: Function;
    addButton(type: string, url: string, image: string): ui_button | ui_imagebutton;
    onAssetDeleted: Function;
    deleteAsset(button: ui_imagebutton | ui_button, type: string, key: string): void;
    eraseCurrent(): void;
    hidePicker(): void;
}
export declare let assetpicker: ui_assetpicker;
