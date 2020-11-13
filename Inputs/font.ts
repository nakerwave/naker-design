import { TextInput, textoption } from './text';
import { inputEvents } from './input';

import axios from 'axios';
import Suggestions from 'suggestions';
import map from 'lodash/map';

/*
  +------------------------------------------------------------------------+
  | FONT INPUT                                                             |
  +------------------------------------------------------------------------+
*/

export let fontNames: Array<string>;
let fontListLoading = false;
let fontInputList: Array<FontInput> = [];
let loadedCallback: Array<Function> = [];

export let getGoogleFonts = (callback?: Function) => {
    if (callback) loadedCallback.push(callback);
    if (fontListLoading) return;
    fontListLoading = true;
    axios.get('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyDwXUFOSFMF44soDpKz2WbHKelntWtl9yU')
        .then((response) => {
            let res = response.data;
            let fontlist = res.items;
            fontNames = map(fontlist, 'family');
            for (let i = 0; i < fontInputList.length; i++) {
                const input = fontInputList[i];
                input.fontNames = fontNames;
            }
            for (let i = 0; i < loadedCallback.length; i++) {
                const callback = loadedCallback[i];
                callback(fontNames);
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

export interface FontInterface {
    text?: string;
    href?: string;
}

export class FontInput extends TextInput {
    
    fontsuggestion: any;

    constructor(parent: HTMLElement, label: string, textoption: textoption, className?: string) {
        super(parent, label, textoption, className);

        // setStyle(this.fontFamily, { width: '150px' });

        this.on('focus', () => {
            this.fontsuggestion.update(this.fontNames);
        });

        this.fontsuggestion = new Suggestions(this.el, [], {
            minLength: 0,
            limit: 20,
        });

        if (fontInputList.length) this.fontNames = fontNames;
        else getGoogleFonts();

        fontInputList.push(this);
    }

    inputEvent: inputEvents = {
        change: 'change',
        input: 'input',
        focus: 'focus',
        blur: 'blur',
        click: 'click',
        enterkey: 'enterkey',
    };
    fontNames: Array<string> = [];

}