// import { Input } from '../Inputs/input';
import { UI } from '../Layers/common';
import { actionPanel } from '../Layers/panels';
import { Slider, slideroption } from '../Inputs/slider';

import { el, mount, setAttr, setStyle } from 'redom';
import clone from 'lodash/clone';

// import '@simonwep/pickr/dist/themes/classic.min.css';   // 'classic' theme
// import '@simonwep/pickr/dist/themes/monolith.min.css';  // 'monolith' theme
// import '@simonwep/pickr/dist/themes/nano.min.css';      // 'nano' theme

// Modern or es5 bundle
import Pickr from '@simonwep/pickr';
// import noUiSlider from 'nouislider';
// import { parseToHSVA } from '@simonwep/pickr/src/js/utils/color';
// import { HSVaColor } from '@simonwep/pickr/src/js/utils/hsvacolor';
// let test = parseToHSVA([1, 1, 1, 1]);
// console.log(test);

/*
  +------------------------------------------------------------------------+
  | COLOR BUTTON                                                           |
  +------------------------------------------------------------------------+
*/

export interface coloroption {
    opacity: boolean,
    removable?: boolean,
    color?: Array<number>,
    slider?: colorslider,
    removedValue?: Array<number>,
}

export interface colorslider {
    curve?: 'logarithmic' | 'exponential' | 'linear',
    power?: number,
}

export class ColorButton extends Slider {

    rgba: Array<number>;
    removedValue: Array<number>;
    opacity: boolean;
    callback: Function;
    colorel: HTMLElement;
    coloricon: HTMLElement;
    colorbutton: HTMLElement;

    constructor(parent: HTMLElement, label: string, coloroption: coloroption) {
        super(parent, label);
        this.el = el('div.input-parameter',
        [
                this.colorbutton = el('div.picker-button', { onclick: () => { this.focus() } },
                [
                    this.colorel = el('div.color-background'),
                        el('div.color-default-background')
                    ]
                    ),
                this.coloricon = el('div.icon-color.erase-icon', { onclick: () => { this.checkErase() }, onmouseenter: () => { this.mouseEnter() }, onmouseleave: () => { this.mouseLeave() } },
                [el('span.path1'), el('span.path2'), el('span.path3')]
                )
            ]
        );
        mount(this.parent, this.el);
        this.opacity = coloroption.opacity;
        if (coloroption.slider) this.addOpacitySlider(coloroption.slider);
        if (coloroption.removable === false) setStyle(this.coloricon, { display: 'none' });
        if (coloroption.color) this.setValue(coloroption.color);
        if (coloroption.removedValue) this.removedValue = coloroption.removedValue;
    }

    checkErase() {
        if (this.rgba !== undefined) this.erase(true);
        else this.focus();
    }

    lastSliderValue = 0;
    slider = false;
    addOpacitySlider(colorslideroption: colorslider) {
        let slideroption: slideroption = {
            value: 1,
            min: 0,
            max: 1,
            step: 0.001,
        };
        if (colorslideroption.curve) slideroption.curve = colorslideroption.curve;
        this.slider = true;
        this.initSliderVar(slideroption);
        this.createSlider(this.parent, 1);
        this.setClass('input-container input-container-big');
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

    setValue(rgba: Array<number>, fromPicker?: boolean) {
        if (rgba == undefined) return this.erase(fromPicker);
        if (rgba[0] == null) return this.erase(fromPicker); // history change
        if (typeof rgba !== 'object') return console.error('Bad color value sent to ColorButton');
        this.rgba = clone(rgba);
        let stringRgba = clone(rgba);
        if (rgba[3] == undefined) stringRgba[3] = 1;
        if (!this.opacity || this.slider) stringRgba[3] = 1;
        let color = 'rgba(' + stringRgba[0] + ', ' + stringRgba[1] + ', ' + stringRgba[2] + ', ' + stringRgba[3] + ')';
        setStyle(this.colorel, { 'background-color': color });
        setAttr(this.coloricon, { active: true });
        
        if (this.slider) {
            if (fromPicker) {
                let slidervalue = this.checkSliderCurve(this.lastSliderValue);
                this.rgba[3] = slidervalue;
            } else {
                this.setSliderValue(this.rgba[3]);
            }
        }
        if (this.events.change && fromPicker) this.events.change(this.rgba);
        return this;
    }

    erase(fromPicker?: boolean) {
        if (this.removedValue !== undefined) {
            this.setValue(this.removedValue);
        } else {
            this.setValue([0, 0, 0, 0]);
            setStyle(this.colorel, { 'background-color': 'rgba(0,0,0,0)' });
        }
        setAttr(this.coloricon, { active: false });
        if (this.events.change && fromPicker) this.events.change(this.removedValue);
        if (this.events.blur && fromPicker) this.events.blur(this.removedValue);
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
        if (this.slider) {
            this.onSlider(event, (value) => {
                this.rgba[3] = value;
                funct(this.rgba);
            });
        }
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

        this.setBack();
        this.createPicker();
        this.setParent(actionPanel);
        this.addPickerActions();
        this.setEvent();
        this.hide();
    }

    createPicker() {
        this.el = el('div', { id: 'colorpicker', class: 'color-picker' },
            el('div.color-picker-background')
        );
        // Need it to be mounted in order to be able to create the picker
        mount(document.body, this.el);

        let fakeEl = el('div', { id: 'fakeEl', style: { display: 'none' } });
        mount(document.body, fakeEl);

        this.picker = Pickr.create({
            el: '#fakeEl',
            container: '#colorpicker',
            theme: 'nano', // or 'monolith', or 'nano'
            autoReposition: false,
            defaultRepresentation: 'HEXA',
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
                    // cancel: true,
                    // save: true
                }
            },
        });

        this.picker.on('change', (color, instance) => {

            // We gonna need the dom-element "palette" later
            const { palette } = instance.getRoot().palette;

            // Pickr the current hue value
            const [h] = color.toHSVA();

            // Pickr will update the colors in the first frame, so we need to wait until everything got updated
            requestAnimationFrame(() => {

                // After pickr updated the colors we gonna apply our own without opacity
                // Corresponding source: https://github.com/Simonwep/pickr/blob/master/src/js/pickr.js#L250
                palette.style.background = `
                    linear-gradient(to top, rgb(0, 0, 0), transparent),
                    linear-gradient(to left, hsl(${h}, 100%, 50%), rgba(255, 255, 255))
                `;
            });
        });

        this.opacityPicker = document.querySelector('.pcr-color-opacity');
        this.chooserPicker = document.querySelector('.pcr-color-chooser');
    }

    setParent(parent: HTMLElement) {
        mount(parent, this.el);
        mount(parent, this.back);
    }

    addPickerActions() {
        let swatches = document.querySelector('.pcr-swatches');
        let addSwatchButon = el('div.input-button.add-in-palette.icon-add', {
            onclick: () => { this.addNewInPicker(); }
        },
            [el('span.path1'), el('span.path2'), el('span.path3')]
        );
        mount(swatches, addSwatchButon);

        let pickerInputs = document.querySelector('.pcr-interaction');
        setAttr(pickerInputs, { class: 'pcr-interaction-naker' });

        let leaveButton = el('div.button.valid-button', {
            onclick: () => { this.picker.hide(); }
        }, 'Confirm');
        mount(pickerInputs, leaveButton);
    }

    setPalette (palette?: Array<Array<number>>) {
        for (let i = 0; i < palette.length; i++) {
            const rgba = palette[i];
            // it happened that color saved is 'null'
            if (rgba) {
                let test = this.isAlreadyInPalette(rgba);
                if (!test) this.picker.addSwatch(this.getRgbaString(rgba));
            }
        }
    }

    addNewInPicker() {
        let newColor = this.picker.getColor().toRGBA();
        let test = this.isAlreadyInPalette(newColor);
        if (!test) this.picker.addSwatch(newColor.toString());
    }

    isAlreadyInPalette(color: Array<number>) {
        // security
        if (!color) return;
        let newColorArr = color.slice(0, 4);
        let swatches = this.picker._swatchColors;
        for (const key in swatches) {
            const rgba = swatches[key].color.toRGBA();
            let savedColorArr = rgba.slice(0, 4);
            if (this.isEqualColor(newColorArr, savedColorArr)) return true;
        }
        return false;
    }

    isEqualColor(color1: Array<number>, color2: Array<number>) {
        let test = true;
        for (let i = 0; i < color1.length; i++) {
            const i1 = Math.round(color1[i] * 100) / 100;
            const i2 = Math.round(color2[i] * 100) / 100;
            if (i1 != i2) return test = false;
        }
        return test;
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
            this.hide();
        }).on('change', (color, instance) => {
            let colorAccurate = this.getAccuracy(color.toRGBA());
            if (this.currentInput) this.currentInput.setValue(colorAccurate, true);
        }).on('save', (color, instance) => {
            if (this.currentInput) this.picker.addSwatch(color.toRGBA().toString());
        }).on('clear', (color, instance) => {
            if (this.currentInput) this.currentInput.setValue(undefined, true);
        });
    }

    hide() {
        if (this.currentInput) {
            this.currentInput.blurEvent(this.picker);
            this.currentInput = undefined;
        }
        this.hideBack();
        return this;
    }

    getAccuracy(color: Array<number>) {
        let colorAccurate = [];
        for (let i = 0; i < 3; i++) {
            colorAccurate[i] = Math.round(color[i]);
        }
        colorAccurate[3] = Math.round(color[3] * 100) / 100;
        return colorAccurate;
    }

    currentInput: ColorButton = null;
    setCurrentInput(input: ColorButton) {
        if (input.rgba == undefined) input.rgba = [0, 0, 0, 1];
        let rgba = clone(input.rgba);
        if (!input.opacity) rgba[3] = 1;
        
        // if (input.label) this.title.textContent = input.label.textContent;
        // else this.title.textContent = 'Color';
        this.checkOpacity(input);
        this.picker.show();
        let rbaInteger = this.getAccuracy(rgba);
        setTimeout(() => {
            let newColor = this.rgbToHex(rbaInteger);
            this.picker.setColor(newColor);
            // Keep currentInput setting after setColor or it will save it in swatches
            this.currentInput = input;
        }, 1);
        this.show();
        this.showBack();
        
    }

    checkOpacity(input: ColorButton) {
        if (input.opacity && !input.slider) {
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
        return "#" + 
        this.componentToHex(rgb[0]) + 
        this.componentToHex(rgb[1]) + 
        this.componentToHex(rgb[2]) + 
        this.componentToHex(Math.round(rgb[3] * 255));
    }
}

export let colorPicker = new ColorPicker();
