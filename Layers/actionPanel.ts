import { Undo } from '../Services/undo';
import { Input } from '../Inputs/input';
import { textnode, Button } from '../Inputs/button';
import { TextInput } from '../Inputs/text';
import { ParagraphInput } from '../Inputs/paragraph';
import { LinkInput } from '../Inputs/link';
import { NumberInput, numberoption, VectorInput } from '../Inputs/number';
import { CheckboxInput } from '../Inputs/checkbox';
import { SliderInput, SimpleSliderInput, slideroption } from '../Inputs/slider';
import { RadioInput, radiooption, RadioIconInput, radioiconoption } from '../Inputs/radio';
import { SelectInput, selectoption } from '../Inputs/select';
import { ColorButton, coloroption } from '../Pickers/colorPicker';
import { asset, AssetButton, ImageAssetButton, TextAssetButton } from '../Pickers/assetPicker';
import { ColorAssetInput } from '../Pickers/colorassetInput';
import { UI } from './common';
import { actionPanel } from './panels';

import { el, mount, unmount, setStyle, setAttr } from 'redom';

/*
  +------------------------------------------------------------------------+
  | INPUT GROUP                                                            |
  +------------------------------------------------------------------------+
*/

export class InputGroup extends UI {

    el: HTMLElement;
    undo: Undo<any>;
    name: string;
    // Force name in order to be able to have analytics with heap
    constructor(name: string, undo: Undo<any>, parent?: HTMLElement) {
        super();
        // Add block class in order to be able to set HEAP events
        this.name = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        this.el = el('div.parameter-group.' + this.name + '_block');
        if (parent) mount(parent, this.el);
        this.undo = undo;
    }

    addText(text: string, className: string) {
        let textNode = el('div', { class: className }, text);
        mount(this.el, textNode);
        return textNode;
    }

    addLink(text: string, link: string, className: string) {
        let linkNode = el('a', { class: className, 'href': link, 'target': '_blank' }, text);
        mount(this.el, linkNode);
        return linkNode;
    }

    addIcon(icon: string, className: string) {
        let iconNode = el('div', { class: className + ' icon-' + icon }, [el('span.path1'), el('span.path2'), el('span.path3')]);
        mount(this.el, iconNode);
        return iconNode;
    }

    addButton(textnode: textnode, callback: Function) {
        let button = new Button(this.el, textnode);
        button.on('click', (text) => {
            callback(text);
            this.undo.pushState();
        });
        return button;
    }

    addTextInput(label: string, text: string, callback: Function) {
        let textInput = new TextInput(this.el, label, text);
        textInput.on('blur', (text) => {
            this.undo.pushState();
        });
        textInput.on('change', (text) => {
            callback(text);
        });
        return textInput;
    }

    addLinkInput(label: string, link: LinkInterface, callback: Function) {
        let linkInput = new LinkInput(this.el, label, link);
        linkInput.on('blur', (link) => {
            this.undo.pushState();
        });
        linkInput.on('change', (link) => {
            callback(link);
        });
        return linkInput;
    }

    addParagraphInput(label: string, paragraph: string, callback: Function) {
        let paragraphInput = new ParagraphInput(this.el, label, paragraph);
        paragraphInput.on('blur', (paragraph) => {
            this.undo.pushState();
        });
        paragraphInput.on('change', (paragraph) => {
            callback(paragraph);
        });
        return paragraphInput;
    }

    addColorInput(label: string, coloroption: coloroption, callback: Function) {
        let colorInput = new ColorButton(this.el, label, coloroption);
        colorInput.on('change', (rgba) => {
            callback(rgba);
        });
        colorInput.on('blur', (rgba) => {
            this.undo.pushState();
        });
        return colorInput;
    }

    addAssetInput(label: string, asset: asset, callback: Function) {
        let assetInput = new AssetButton(this.el, label, asset);
        assetInput.on('change', (url) => {
            callback(url);
        });
        assetInput.on('blur', (url) => {
            this.undo.pushState();
        });
        return assetInput;
    }

    addImageAssetInput(label: string, asset: asset, callback: Function) {
        let imageAssetInput = new ImageAssetButton(this.el, label, asset);
        imageAssetInput.on('change', (url) => {
            callback(url);
            this.undo.pushState();
        });
        // imageAssetInput.on('blur', (url) => {
        //     this.undo.pushState();
        // });
        return imageAssetInput;
    }

    addTextAssetInput(label: string, asset: asset, callback: Function) {
        let textAssetInput = new TextAssetButton(this.el, label, asset);
        textAssetInput.on('change', (url) => {
            callback(url);
        });
        textAssetInput.on('blur', (url) => {
            this.undo.pushState();
        });
        return textAssetInput;
    }

    addColorAndAssetInput(label: string, coloroption: coloroption, asset: asset, callback: Function) {
        let colorassetInput = new ColorAssetInput(this.el, label, coloroption, asset);
        colorassetInput.on('change', (type, value) => {
            callback(type, value);
        });
        colorassetInput.on('blur', (rgba) => {
            this.undo.pushState();
        });
        return colorassetInput;
    }

    addCheckBox(label: string, checked: boolean, callback: Function) {
        let checkboxInput = new CheckboxInput(this.el, label, checked);
        checkboxInput.on('change', (checked) => {
            callback(checked);
            this.undo.pushState();
        });
        return checkboxInput;
    }

    addSlider(label: string, slideroption: slideroption, callback: Function) {
        let sliderInput = new SliderInput(this.el, label, slideroption);
        sliderInput.on('change', (value) => {
            callback(value);
        });
        sliderInput.on('blur', (value) => {
            this.undo.pushState();
        });
        return sliderInput;
    }

    addSimpleSlider(label: string, slideroption: slideroption, callback: Function) {
        let sliderInput = new SimpleSliderInput(this.el, label, slideroption);
        sliderInput.on('change', (value) => {
            callback(value);
        });
        sliderInput.on('blur', (value) => {
            this.undo.pushState();
        });
        return sliderInput;
    }

    addRadio(label: string, radiooption: radiooption, callback: Function) {
        let radioInput = new RadioInput(this.el, label, radiooption);
        radioInput.on('change', (value) => {
            callback(value);
            this.undo.pushState();
        });
        return radioInput;
    }

    addRadioIcon(label: string, radiooption: radioiconoption, callback: Function) {
        let radioInput = new RadioIconInput(this.el, label, radiooption);
        radioInput.on('change', (value) => {
            callback(value);
            this.undo.pushState();
        });
        return radioInput;
    }

    addSelect(label: string, selectoption: selectoption, callback: Function) {
        let selectInput = new SelectInput(this.el, label, selectoption);
        selectInput.on('change', (value) => {
            callback(value);
            this.undo.pushState();
        });
        return selectInput;
    }

    addNumberInput(label: string, numberoption: numberoption, callback: Function) {
        let numberInput = new NumberInput(this.el, label, numberoption);
        numberInput.on('change', (text) => {
            callback(text);
        });
        numberInput.on('blur', (text) => {
            this.undo.pushState();
        });
        return numberInput;
    }

    addVectorInput(label: string, numberoption: numberoption, callback: Function) {
        let vectorInput = new VectorInput(this.el, label, numberoption);
        vectorInput.on('change', (change) => {
            callback(change);
        });
        vectorInput.on('blur', () => {
            this.undo.pushState();
        });
        return vectorInput;
    }

    addVectorTitle() {
        let title = el('div.vector-title', [
            el('div.vector-axe', [
                el('div.arrow.icon-X-Y-Z-axis.x-axe', [el('span.path1'), el('span.path2'), el('span.path3')]),
                el('div', 'X'),
            ]),
            el('div.vector-axe', [
                el('div.arrow.icon-X-Y-Z-axis.y-axe', [el('span.path1'), el('span.path2'), el('span.path3')]),
                el('div', 'Y'),
            ]),
            el('div.vector-axe', [
                el('div.arrow.icon-X-Y-Z-axis.z-axe', [el('span.path1'), el('span.path2'), el('span.path3')]),
                el('div', 'Z'),
            ]),
        ]);
        mount(this.el, title);
        return title;
    }

    addSwitchButton(callback: Function) {
        let test = false;
        let switchButton = this.addButton({ ui: 'text', text: 'Less Options' }, () => {
            if (test) switchButton.el.textContent = 'Less Options';
            else switchButton.el.textContent = 'More Options';
            callback(test);
        });
    }
}

/*
  +------------------------------------------------------------------------+
  | INPUT GROUP SWITCH                                                     |
  +------------------------------------------------------------------------+
*/

export class InputGroupSwitch extends InputGroup {

    title: HTMLElement;
    expand: HTMLElement;

    constructor(title: string, undo: Undo<any>, expandable?: boolean) {
        super(title, undo, actionPanel);
        if (title) this.addTitle(title);
        // if (expandable === false) {
        //     if (title) {
        //         // unmount(this.titleParent, this.expand);
        //         setAttr(this.title, {class:''});
        //     }
        // }
    }

    titleParent: HTMLElement;
    addTitle(title: string) {
        this.titleParent = el('div.parameter-title',
            this.title = el('div', title),
            // this.title = el('div.switch-title', title),
            // this.expand = el('div.title-expand.icon-expand', { onclick: () => { this.switch() } },
            //     [el('span.path1'), el('span.path2'), el('span.path3')]
            // ),
        );
        mount(this.el, this.titleParent);
    }

    addSubTitle(title: string) {
        let textNode = el('div.parameter-subtitle', title);
        mount(this.el, textNode);
    }

    // expanded = true;
    // switch() {
    //     if (this.expanded) {
    //         this.expanded = false;
    //         setStyle(this.el, { height: '25px' });
    //         setStyle(this.expand, { transform: 'rotateZ(90deg)' });
    //     } else {
    //         this.expanded = true;
    //         setStyle(this.el, { height: 'auto' });
    //         setStyle(this.expand, { transform: 'rotateZ(0deg)' });
    //     }
    // }

    freezeInput(input: Input, bool: boolean) {
        if (bool) setStyle(input.el, { display: 'none' });
        else setStyle(input.el, { display: 'block' });
        if (input.unit) {
            if (bool) setStyle(input.unit, { display: 'none' });
            else setStyle(input.unit, { display: 'block' });
        }
    }
}
