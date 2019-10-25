
import { Input } from '../Inputs/input';
import { UI } from '../Layers/common';
import { actionPanel } from '../Layers/panels';

import { el, mount, setAttr, setStyle } from 'redom';
import clone from 'lodash/clone';


// import '@simonwep/pickr/dist/themes/classic.min.css';   // 'classic' theme
// import '@simonwep/pickr/dist/themes/monolith.min.css';  // 'monolith' theme
// import '@simonwep/pickr/dist/themes/nano.min.css';      // 'nano' theme

// Modern or es5 bundle
import Pickr from '@simonwep/pickr';

/*
  +------------------------------------------------------------------------+
  | COLOR BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export interface coloroption {
    opacity: boolean,
    removable?: boolean,
    color?: Array<number>,
}

export class ColorButton extends Input {

    rgba: Array<number>;
    opacity: boolean;
    callback: Function;
    colorel: HTMLElement;
    coloricon: HTMLElement;
    colorbutton: HTMLElement;

    constructor(parent: HTMLElement, label: string, coloroption: coloroption) {
        super(parent, label);
        this.opacity = coloroption.opacity;
        this.el = el('div.input-parameter',
            [
                this.colorbutton = el('div.picker-button.color-default-background', { onclick: () => { this.focus() } },
                    this.colorel = el('div.color-background')
                ),
                this.coloricon = el('div.icon-color.erase-icon', { onclick: () => { this.checkErase() }, onmouseenter: () => { this.mouseEnter() }, onmouseleave: () => { this.mouseLeave() } },
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                )
            ]
        );
        mount(this.parent, this.el);
        if (coloroption.removable === false) setStyle(this.coloricon, { display: 'none' });
        if (coloroption.color) this.setValue(coloroption.color);
    }

    checkErase() {
        if (this.rgba !== undefined) this.setValue(undefined, true);
        else this.focus();
    }

    mouseEnter() {
        if (this.rgba !== undefined) this.setIcon('delete');
    }

    mouseLeave() {
        this.setIcon('color');
    }

    setIcon(icon: string) {
        setAttr(this.coloricon, { class: 'icon-' + icon + ' erase-icon' });
    }

    setValue(rgba: Array<number>, frompicker?: any) {
        if (rgba == undefined) return this.erase(frompicker);
        if (rgba[0] == null) return this.erase(frompicker); // history change
        if (typeof rgba !== 'object') return console.error('Bad color value sent to ColorButton');
        this.rgba = clone(rgba);
        let stringRgba = clone(rgba);
        if (rgba[3] == undefined || !this.opacity) stringRgba[3] = 1;
        let color = 'rgba(' + stringRgba[0] + ', ' + stringRgba[1] + ', ' + stringRgba[2] + ', ' + stringRgba[3] + ')';
        setStyle(this.colorel, { 'background-color': color });
        setAttr(this.coloricon, { active: true });
        if (this.events.change && frompicker) this.events.change(this.rgba);
        return this;
    }

    erase(frompicker?: any) {
        setStyle(this.colorel, { 'background-color': 'rgba(0,0,0,0)' });
        setAttr(this.coloricon, { active: false });
        if (this.events.change && frompicker) this.events.change(undefined);
        if (this.events.blur && frompicker) this.events.blur(undefined);
    }

    events: any = {};
    startrgba: any;

    focus() {
        this.startrgba = this.rgba;
        setAttr(this.colorbutton, { active: true });
        colorPicker.setCurrentInput(this);
        if (this.events.focus) this.events.focus(this.rgba);
    }

    blurEvent(picker?: any) {
        if (this.events.blur && picker && this.startrgba != this.rgba) this.events.blur(this.rgba);
        setAttr(this.colorbutton, { active: false });
    }

    on(event: string, funct: Function) {
        this.events[event] = funct;
        return this;
    }
}

/*
  +------------------------------------------------------------------------+
  | COLOR PICKER                                                           |
  +------------------------------------------------------------------------+
*/

export class ColorPicker extends UI {

    back: HTMLElement;
    title: HTMLElement;
    picker: any;
    opacityPicker: HTMLElement;
    chooserPicker: HTMLElement;

    constructor() {
        super();

        this.el = el('div', { id: 'colorpicker', class: 'color-picker' },
            el('div.color-picker-background')
        );
        mount(actionPanel, this.el);
        let fakeEl = el('div', { id: 'fakeEl', style:{ display: 'none' } });
        mount(document.body, fakeEl);

        this.picker = Pickr.create({
            el: '#fakeEl',
            container: '#colorpicker',
            theme: 'nano', // or 'monolith', or 'nano'
            autoReposition: false,
            defaultRepresentation: 'HEX',
            swatches: [],

            components: {

                // Main components
                preview: true,
                opacity: true,
                hue: true,

                // Input / output Options
                interaction: {
                    // hex: true,
                    // rgba: true,
                    // hsla: true,
                    // hsva: true,
                    // cmyk: true,
                    input: true,
                    // clear: true,
                    save: true
                }
            }
        });

        let pickerInputs = document.querySelector('.pcr-interaction');
        setAttr(pickerInputs, { class:'pcr-interaction-naker'});
        this.opacityPicker = document.querySelector('.pcr-color-opacity');
        this.chooserPicker = document.querySelector('.pcr-color-chooser');

        this.setEvent();
        this.setBack();
        this.hide();

        setTimeout(() => {
            this.getPalette();
        }, 4000)
    }

    setPalette (palette?: Array<string>) {
        for (let i = 0; i < palette.length; i++) {
            const rgba = palette[i];
            this.picker.addSwatch(this.getRgbaString(rgba));
        }
    }

    getRgbaString(rgba:Array<number>) {
        if (rgba[3] == undefined) rgba[3] = 1;
        return 'rgba(' + rgba[0] + ', ' + rgba[1] + ', ' + rgba[2] + ', ' + rgba[3] + ')';
    }

    getPalette () {
        let palette = [];
        let swatches = this.picker._swatchColors;
        for (const key in swatches) {
            const color = swatches[key].color.toRGBA();
            let savedColor = color.slice(0, 4);
            palette.push(savedColor);
        }
        return palette;
    }

    setBack() {
        this.back = el('div.color-picker-background-opacity', { onclick: () => { this.picker.hide(); } });
        setStyle(this.back, { cursor: 'auto', 'z-index': 199, display: 'none' });
        mount(actionPanel, this.back);
    }

    hideBack() {
        setStyle(this.back, { display: 'none' });
        setStyle(this.el, { display: 'none' });
    }

    showBack() {
        setStyle(this.back, { display: 'block' });
        setStyle(this.el, { display: 'block' });
    }

    setEvent() {
        this.picker.on('hide', instance => {
            this.currentInput.blurEvent(this.picker);
            this.currentInput = undefined;
            this.hideBack();
        }).on('change', (color, instance) => {
            if (this.currentInput) this.currentInput.setValue(color.toRGBA(), true);
        }).on('save', (color, instance) => {
            if (this.currentInput) this.picker.addSwatch(color.toRGBA().toString());
        }).on('clear', (color, instance) => {
            if (this.currentInput) this.currentInput.setValue(undefined, true);
        });;

        window.addEventListener("resize", () => {
            if (this.currentInput) this.setPickerPosition();
        });
    }

    currentInput: ColorButton = null;
    setCurrentInput(input: ColorButton) {
        if (input.rgba == undefined) input.rgba = [0, 0, 0, 1];
        let rgba = clone(input.rgba);
        if (!input.opacity) rgba[3] = 1;

        this.picker.setColor(this.rgbToHex(rgba));
        this.currentInput = input;
        this.setPickerPosition();
        // if (input.label) this.title.textContent = input.label.textContent;
        // else this.title.textContent = 'Color';
        this.checkOpacity(input.opacity)
        this.picker.show();
        this.show();

        this.showBack();
    }

    checkOpacity(opacity: boolean) {
        if (opacity) {
            setStyle(this.opacityPicker, { display: 'flex' });
            setStyle(this.chooserPicker, { top: '0px' });
        } else {
            setStyle(this.opacityPicker, { display: 'none' });
            setStyle(this.chooserPicker, { top: '12px' });
        }
    }

    componentToHex(c: number) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(rgb: Array<number>): string {
        return "#" + this.componentToHex(rgb[0]) + this.componentToHex(rgb[1]) + this.componentToHex(rgb[2]);
    }

    setPickerPosition() {
        let pos = this.currentInput.el.getBoundingClientRect();
        let y = Math.min(pos.top - 42, window.innerHeight - 230);
        y = Math.round(Math.max(y, 0));
        setStyle(this.el, { top: y + 'px' });
    }
}

export let colorPicker = new ColorPicker();
