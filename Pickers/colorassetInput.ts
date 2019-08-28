
import { Input } from '../Inputs/input';

import { ColorButton, coloroption } from './colorPicker';
import { AssetButton, asset } from './assetPicker';

import { el, unmount, mount, setAttr } from 'redom';

export class ColorAssetInput extends Input {

    numberInputs: any = {};
    colorButton: ColorButton;
    assetButton: AssetButton;
    constructor(parent: HTMLElement, label: string, coloroption: coloroption, asset: asset) {
        super(parent, label);
        let vectorContainer = el('div.input-container')
        mount(this.parent, vectorContainer);

        // Force label for colorPicker
        this.colorButton = new ColorButton(parent, label, coloroption);
        unmount(parent, this.colorButton.parent);
        mount(vectorContainer, this.colorButton.el);
        setAttr(this.colorButton.el, { class: 'input-parameter-first' });

        this.assetButton = new AssetButton(parent, label, asset);
        unmount(parent, this.assetButton.parent);
        mount(vectorContainer, this.assetButton.el);
        setAttr(this.assetButton.el, { class: 'input-parameter-second' });
    }

    on(event: 'change'|'focus'|'blur', funct: Function) {
        this.colorButton.on(event, (rgba) => {
            funct('color', rgba);
        });
        this.assetButton.on(event, (url) => {
            funct('asset', url);
        });
        return this;
    }

    setValue(type: 'color'|'asset' , value: any) {
        if (type == 'color') this.colorButton.setValue(value);
        if (type == 'asset') this.assetButton.setValue(value);
        return this;
    }
}
