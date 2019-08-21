
// import { undo } from '../service/undo';
import { textnode, ui_button, ui_imagebutton } from '../Inputs/button';
import { ui_textinput, ui_paragraphinput } from '../Inputs/text';
import { ui_numberinput, numberoption, ui_vectorinput } from '../Inputs/number';
import { ui_checkbox } from '../Inputs/checkbox';
import { ui_slider, slideroption } from '../Inputs/slider';
import { ui_radio, radiooption, ui_radioicon, radioiconoption } from '../Inputs/radio';
import { ui_select, selectoption } from '../Inputs/select';
import { ui_colorbutton, coloroption } from '../Pickers/colorPicker';
import { ui_assetbutton, ui_imageassetbutton, ui_textassetbutton } from '../Pickers/assetPicker';
import { asset } from '../Pickers/assetPicker';

import { el, mount, unmount, setStyle, setAttr } from 'redom';

export interface manageroption {
  title:string;
  text?:boolean;
  textcolor?:boolean;
  backcolor?:boolean;
  pickercolor?:boolean;
  opacity?:boolean;
  fixed?:boolean;
}

/*
  +------------------------------------------------------------------------+
  | MAIN MANAGER                                                           |
  +------------------------------------------------------------------------+
*/

export class ui_manager {

    el:HTMLElement;
    constructor (parent:HTMLElement) {
        this.el = el('div.parameter-group');
        mount(parent, this.el);
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

  addButton (textnode:textnode, callback:Function) {
      let button = new ui_button(this.el, textnode);
    button.on('click', (text) => {
      callback(text);
      // undo.pushState();
    });
    return button;
  }

  addTextInput (label:string, text:string, callback:Function) {
      let textInput = new ui_textinput(this.el, label, text);
    // textInput.on('blur', (text) => {
    //   undo.pushState();
    // });
    textInput.on('change', (text) => {
      callback(text);
    });
    return textInput;
  }

  addParagraphInput (label:string, paragraph:string, callback:Function) {
    let paragraphInput = new ui_paragraphinput(this.el, label, paragraph);
    // paragraphInput.on('blur', (paragraph) => {
    //   undo.pushState();
    // });
    paragraphInput.on('change', (paragraph) => {
      callback(paragraph);
    });
    return paragraphInput;
  }

  currentCallback:any;
  addColorInput (label:string, coloroption:coloroption, callback:Function) {
      let colorInput = new ui_colorbutton(this.el, label, coloroption);
    colorInput.on('change', (rgba) => {
      callback(rgba);
    });
    // colorInput.on('blur', (rgba) => {
    //   undo.pushState();
    // });
    return colorInput;
  }

  addAssetInput (label:string, asset:asset, callback:Function) {
    let assetInput = new ui_assetbutton(this.el, label, asset);
    assetInput.on('change', (url) => {
      callback(url);
    });
    // assetInput.on('blur', (url) => {
    //   undo.pushState();
    // });
    return assetInput;
  }
  
    addImageAssetInput (label:string, asset:asset, callback:Function) {
      let imageAssetInput = new ui_imageassetbutton(this.el, label, asset);
      imageAssetInput.on('change', (url) => {
        callback(url);
      });
      // imageAssetInput.on('blur', (url) => {
      //   undo.pushState();
      // });
      return imageAssetInput;
    }
  
    addTextAssetInput (label:string, asset:asset, callback:Function) {
      let textAssetInput = new ui_textassetbutton(this.el, label, asset);
      textAssetInput.on('change', (url) => {
        callback(url);
      });
      // textAssetInput.on('blur', (url) => {
      //   undo.pushState();
      // });
      return textAssetInput;
    }

  addColorAndAssetInput (label:string, coloroption:coloroption, asset:asset, callback:Function) {
    let colorInput = new ui_colorbutton(this.el, label, coloroption);
    setAttr(colorInput, {class:'input-parameter-first'})
    colorInput.on('change', (rgba) => {
      callback('color', rgba);
    });
    // colorInput.on('blur', (rgba) => {
    //   undo.pushState();
    // });
    // let assetInput = inputContainer.addAssetButton(asset, 'input-parameter-second');
    // assetInput.on('change', (url) => {
    //   callback('asset', url);
    // });
    // assetInput.on('blur', (url) => {
    //   undo.pushState();
    // });
    // return {color:colorInput, asset:assetInput};
  }

  addCheckBox (label:string, checked:boolean, callback:Function) {
    let checkboxInput = new ui_checkbox(this.el, label, checked);
    checkboxInput.on('change', (checked) => {
      callback(checked);
      // undo.pushState();
    });
    return checkboxInput;
  }

  addSlider (label:string, slideroption:slideroption, callback:Function) {
      let sliderInput = new ui_slider(this.el, label, slideroption);
    sliderInput.on('change', (value) => {
      callback(value);
    });
    // sliderInput.on('blur', (value) => {
    //   undo.pushState();
    // });
    return sliderInput;
  }

  addRadio (label:string, radiooption:radiooption, callback:Function) {
    let radioInput = new ui_radio(this.el, label, radiooption);
    radioInput.on('change', (value) => {
      callback(value);
      // PushState in change because blur is called before change and it won't be saved
      // undo.pushState();
    });
    return radioInput;
  }

  addRadioIcon (label:string, radiooption:radioiconoption, callback:Function) {
      let radioInput = new ui_radioicon(this.el, label, radiooption);
    radioInput.on('change', (value) => {
      callback(value);
      // PushState in change event because blur is called before change and it won't be saved
      // undo.pushState();
    });
    return radioInput;
  }

  addSelect (label:string, selectoption:selectoption, callback:Function) {
      let selectInput = new ui_select(this.el, label, selectoption);
    selectInput.on('change', (value) => {
      callback(value);
      // undo.pushState();
    });
    return selectInput;
  }

   addNumberInput (label:string, numberoption:numberoption, callback:Function) {
       let numberInput = new ui_numberinput(this.el, label, numberoption);
    numberInput.on('change', (text) => {
      callback(text);
    });
    // numberInput.on('blur', (text) => {
    //   undo.pushState();
    // });
    return numberInput;
  }

  addVectorInput (label:string, numberoption:numberoption, callback:Function) {
    let vectorInput = new ui_vectorinput(this.el, label, numberoption);
        vectorInput.on('change', (change) => {
          callback(change);
        });
        // vectorInput.on('blur', () => {
        //   undo.pushState();
        // });

    return vectorInput;
  }
}

/*
  +------------------------------------------------------------------------+
  | DESIGN MANAGER                                                         |
  +------------------------------------------------------------------------+
*/

export class floatingManager extends ui_manager {

    title:HTMLElement;
    expand:HTMLElement;

    constructor (title?:string, expandable?:boolean) {
      super(layerRight);
      if (title) this.addTitle(title);
      if (expandable === false) {
          unmount(this.titleParent, this.expand);
          if (title) setStyle(this.title, {left:'3px'});
      }

      return this;
    }

    titleParent:HTMLElement;
    addTitle (title:string) {
      this.titleParent = el('div.parameter-title',
        this.title = el('div.title-text', title),
        this.expand = el('div.title-expand.icon-expand', {onclick:()=>{this.switch()}},
            [el('span.path1'),el('span.path2'),el('span.path3')]
        ),
      );
      mount(this.el, this.titleParent);
    }

    addSubTitle(title: string) {
      let textNode = el('div.parameter-subtitle', title);
      mount(this.el, textNode);
    }

    expanded = true;
    switch () {
        if (this.expanded) {
            this.expanded = false;
            setStyle(this.el, {height:'25px'});
            setStyle(this.expand, {transform:'rotateZ(0deg)'});
        } else {
            this.expanded = true;
            setStyle(this.el, {height:'auto'});
            setStyle(this.expand, {transform:'rotateZ(90deg)'});
        }
    }

    freezeInput (input:any, bool:boolean) {
      if (bool) setStyle(input.el, {display:'none'});
      else setStyle(input.el, {display:'block'});
      if (input.unit) {
        if (bool) setStyle(input.unit, {display:'none'});
        else setStyle(input.unit, {display:'block'});
      }
    }
}

/*
  +------------------------------------------------------------------------+
  | PARENT DESIGN MANAGER                                                  |
  +------------------------------------------------------------------------+
*/
export let layerLeft = el('div.layer-left.presets-container.editor-scroll');

/*
  +------------------------------------------------------------------------+
  | PARENT PARAMETER MANAGER                                               |
  +------------------------------------------------------------------------+
*/

export let layerRight = el('div.layer-right.parameter-container.editor-scroll');

window.addEventListener('load', () => {
  mount(document.body, layerLeft);
  mount(document.body, layerRight);
});